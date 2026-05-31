import express from "express";
import { requireRole } from "../auth/auth.service";
import { loadAll, findOne, insertDoc, updateDoc, removeDoc } from "../../core/store";

const router = express.Router();

const STATUSES = ["Available", "On Delivery", "Offline"];

const adminOrManager = requireRole(["admin", "manager"]);

// List riders + fleet metrics (admin/manager).
router.get("/", adminOrManager, async (_req, res) => {
  const riders = (await loadAll("riders"))
    .slice()
    .sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")));

  const metrics = {
    total: riders.length,
    active: riders.filter((rider) => rider.status === "Available" || rider.status === "On Delivery").length,
    onDelivery: riders.filter((rider) => rider.status === "On Delivery").length,
    offline: riders.filter((rider) => rider.status === "Offline").length,
    avgRating: riders.length
      ? Number((riders.reduce((sum, rider) => sum + Number(rider.rating ?? 0), 0) / riders.length).toFixed(1))
      : 0,
  };

  return res.json({ riders, metrics });
});

// Admin: add a rider.
router.post("/", requireRole(["admin"]), async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  if (name.length < 2) return res.status(400).json({ message: "Please enter the rider's name." });

  const record = {
    id: `RD-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    phone: String(req.body?.phone ?? "").trim(),
    status: STATUSES.includes(String(req.body?.status)) ? String(req.body.status) : "Available",
    shift: String(req.body?.shift ?? "Day"),
    vehicleType: String(req.body?.vehicleType ?? "Bike"),
    plateNumber: String(req.body?.plateNumber ?? "").trim(),
    zone: String(req.body?.zone ?? "").trim(),
    rating: Number(req.body?.rating ?? 0),
    activeOrders: Number(req.body?.activeOrders ?? 0),
  };

  await insertDoc("riders", record);
  return res.status(201).json(record);
});

// Admin/manager: update a rider (status, zone, etc.).
router.patch("/:id", adminOrManager, async (req, res) => {
  const existing = await findOne("riders", { id: req.params.id });
  if (!existing) return res.status(404).json({ message: "Rider not found." });

  const patch: Record<string, unknown> = {};
  const fields = ["name", "phone", "status", "shift", "vehicleType", "plateNumber", "zone", "rating", "activeOrders"];
  for (const field of fields) {
    if (req.body?.[field] !== undefined) patch[field] = req.body[field];
  }
  if (patch.status && !STATUSES.includes(String(patch.status))) {
    return res.status(400).json({ message: "Invalid rider status." });
  }

  await updateDoc("riders", { id: req.params.id }, patch);
  return res.json({ ...existing, ...patch });
});

router.delete("/:id", requireRole(["admin"]), async (req, res) => {
  const removed = await removeDoc("riders", { id: req.params.id });
  if (!removed) return res.status(404).json({ message: "Rider not found." });
  return res.json({ message: "Rider removed." });
});

export default router;
