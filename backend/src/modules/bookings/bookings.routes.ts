import express from "express";
import { requirePermission } from "../auth/auth.service";
import { db } from "../../core/db";
import { calculateQuotedBookingPrice, validateBookingPayload } from "./bookings.helpers";
import { BookingRequestModel } from "../../core/models";
import { isMongoConfigured } from "../../core/mongo";

const router = express.Router();

const validStatuses = ["Pending", "Confirmed", "Completed", "Cancelled"];

const normalizeSlot = (value: unknown) => String(value ?? "").trim();

const loadConfirmedConflict = async ({
  zone,
  tableId,
  date,
  time,
  excludeId = "",
}: {
  zone: string;
  tableId: number;
  date: string;
  time: string;
  excludeId?: string;
}) => {
  const match: Record<string, unknown> = {
    status: "Confirmed",
    date,
    time,
  };

  match.zone = zone;

  if (tableId > 0) {
    match.$or = [{ tableId }, { tableId: 0 }, { tableId: { $exists: false } }];
  }

  if (isMongoConfigured()) {
    return BookingRequestModel.findOne(
      excludeId ? { ...match, id: { $ne: excludeId } } : match,
    ).lean();
  }

  return db.bookings.find(
    (item) =>
      item.status === "Confirmed" &&
      item.date === date &&
      item.time === time &&
      (tableId > 0
        ? Number((item as Record<string, unknown>).tableId ?? 0) === tableId ||
          (item.zone === zone && !Number((item as Record<string, unknown>).tableId ?? 0))
        : item.zone === zone) &&
      (!excludeId || item.id !== excludeId),
  ) ?? null;
};

router.get("/availability", async (req, res) => {
  const date = normalizeSlot(req.query.date);
  const time = normalizeSlot(req.query.time);
  const zone = normalizeSlot(req.query.zone);

  const match: Record<string, string> = {
    status: "Confirmed",
  };

  if (date && time) {
    match.date = date;
    match.time = time;
  }

  if (zone) {
    match.zone = zone;
  }

  const today = new Date().toISOString().slice(0, 10);
  const confirmedBookings = isMongoConfigured()
    ? await BookingRequestModel.find(
        date && time ? match : { ...match, date: { $gte: today } },
      ).select("id zone tableId date time guests").lean()
    : db.bookings.filter((item) =>
        item.status === "Confirmed" &&
        (date && time ? item.date === date && item.time === time : item.date >= today) &&
        (!zone || item.zone === zone),
      );

  const reservations = confirmedBookings.map((booking) => ({
    id: String(booking.id),
    zone: String(booking.zone),
    tableId: Number((booking as Record<string, unknown>).tableId ?? 0),
    date: String(booking.date),
    time: String(booking.time),
    guests: Number(booking.guests ?? 0),
  }));

  return res.json({
    date,
    time,
    reservedZones: [...new Set(reservations.map((booking) => booking.zone))],
    reservations,
  });
});

// View bookings - requires bookings:view permission
router.get("/", requirePermission("bookings:view"), async (req, res) => {
  const limit = Number(req.query.limit ?? 0);
  const status = String(req.query.status ?? "").trim();

  if (isMongoConfigured()) {
    const query = status ? { status } : {};
    let bookingQuery = BookingRequestModel.find(query).sort({ createdAt: -1 });

    if (Number.isFinite(limit) && limit > 0) {
      bookingQuery = bookingQuery.limit(limit);
    }

    const bookings = await bookingQuery.lean();
    return res.json(bookings);
  }

  let bookings = [...db.bookings].reverse();

  if (status) {
    bookings = bookings.filter((item) => item.status === status);
  }

  if (Number.isFinite(limit) && limit > 0) {
    bookings = bookings.slice(0, limit);
  }

  return res.json(bookings);
});

// Create booking - public website flow
router.post("/", async (req, res) => {
  const payload = {
    customerName: String(req.body?.customerName ?? "").trim(),
    customerEmail: String(req.body?.customerEmail ?? "").trim().toLowerCase(),
    customerPhone: String(req.body?.customerPhone ?? "").trim(),
    eventType: String(req.body?.eventType ?? "").trim(),
    zone: String(req.body?.zone ?? "").trim(),
    tableId: Math.max(0, Number(req.body?.tableId ?? 0)),
    guests: Number(req.body?.guests ?? 0),
    package: String(req.body?.package ?? "").trim(),
    date: String(req.body?.date ?? "").trim(),
    time: String(req.body?.time ?? "").trim(),
    specialRequests: String(req.body?.specialRequests ?? "").trim(),
    source: String(req.body?.source ?? "website").trim() || "website",
  };

  const validationError = validateBookingPayload({
    customerName: payload.customerName,
    customerEmail: payload.customerEmail,
    customerPhone: payload.customerPhone,
    eventType: payload.eventType,
    zone: payload.zone,
    guests: payload.guests,
    packageId: payload.package,
    date: payload.date,
    time: payload.time,
  });

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const confirmedConflict = await loadConfirmedConflict({
    zone: payload.zone,
    tableId: payload.tableId,
    date: payload.date,
    time: payload.time,
  });

  if (confirmedConflict) {
    return res.status(409).json({
      message: "This venue zone is already reserved for the selected date and time.",
    });
  }

  const bookingRecord = {
    id: `BOOK-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ...payload,
    status: "Pending",
    branchId: "renala-khurd-main",
    quotedPrice: calculateQuotedBookingPrice(payload.package, payload.guests),
    internalNotes: "",
    assignedTo: "",
  };

  if (isMongoConfigured()) {
    const created = await BookingRequestModel.create(bookingRecord);
    return res.status(201).json(created.toObject());
  }

  db.bookings.push(bookingRecord);
  return res.status(201).json(bookingRecord);
});

// Update booking - requires bookings:update permission
router.patch("/:id", requirePermission("bookings:update"), async (req, res) => {
  const status = String(req.body?.status ?? "").trim();

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid booking status." });
  }

  if (isMongoConfigured()) {
    if (status === "Confirmed") {
      const currentBooking = await BookingRequestModel.findOne({ id: req.params.id }).lean();

      if (!currentBooking) {
        return res.status(404).json({ message: "Booking not found." });
      }

      const zone = normalizeSlot(req.body?.zone ?? currentBooking.zone);
      const tableId = Math.max(0, Number(req.body?.tableId ?? currentBooking.tableId ?? 0));
      const date = normalizeSlot(req.body?.date ?? currentBooking.date);
      const time = normalizeSlot(req.body?.time ?? currentBooking.time);
      const conflict = await loadConfirmedConflict({ zone, tableId, date, time, excludeId: req.params.id });

      if (conflict) {
        return res.status(409).json({
          message: "Another confirmed booking already reserves this zone for the selected date and time.",
        });
      }
    }

    const updated = await BookingRequestModel.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Booking not found." });
    }

    return res.json(updated);
  }

  const index = db.bookings.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Booking not found." });
  }

  if (status === "Confirmed") {
    const nextBooking = {
      ...db.bookings[index],
      ...req.body,
    };
    const conflict = await loadConfirmedConflict({
      zone: normalizeSlot(nextBooking.zone),
      tableId: Math.max(0, Number((nextBooking as Record<string, unknown>).tableId ?? 0)),
      date: normalizeSlot(nextBooking.date),
      time: normalizeSlot(nextBooking.time),
      excludeId: req.params.id,
    });

    if (conflict) {
      return res.status(409).json({
        message: "Another confirmed booking already reserves this zone for the selected date and time.",
      });
    }
  }

  db.bookings[index] = {
    ...db.bookings[index],
    ...req.body,
  };

  return res.json(db.bookings[index]);
});

export default router;
