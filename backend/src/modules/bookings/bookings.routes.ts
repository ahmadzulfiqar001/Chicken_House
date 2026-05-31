import express from "express";
import { requirePermission } from "../auth/auth.service";
import { db } from "../../core/db";
import { calculateQuotedBookingPrice, validateBookingPayload } from "./bookings.helpers";
import { BookingRequestModel } from "../../core/models";
import { isMongoConfigured } from "../../core/mongo";

const router = express.Router();

const validStatuses = ["Pending", "Confirmed", "Completed", "Cancelled"];

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

  db.bookings[index] = {
    ...db.bookings[index],
    ...req.body,
  };

  return res.json(db.bookings[index]);
});

export default router;
