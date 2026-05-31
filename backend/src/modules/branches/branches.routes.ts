import express from "express";
import { requireRole } from "../auth/auth.service";
import { loadAll, findOne, insertDoc, updateDoc, removeDoc } from "../../core/store";

const router = express.Router();

const slugify = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `branch-${Date.now()}`;

// Public: list branches (restaurant locations are public information).
router.get("/", async (_req, res) => {
  const branches = (await loadAll("branches"))
    .slice()
    .sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")));
  return res.json(branches);
});

// Admin: create a branch.
router.post("/", requireRole(["admin"]), async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  if (name.length < 2) return res.status(400).json({ message: "Please enter a branch name." });

  const slug = String(req.body?.slug ?? "").trim() || slugify(name);
  if (await findOne("branches", { slug })) {
    return res.status(409).json({ message: "A branch with this slug already exists." });
  }

  const BRANCH_STATUSES = ["Active", "Closed", "Under Construction"];
  const status = BRANCH_STATUSES.includes(String(req.body?.status)) ? String(req.body.status) : "Active";

  const record = {
    id: `BR-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    slug,
    status,
    manager: String(req.body?.manager ?? "").trim(),
    email: String(req.body?.email ?? "").trim().toLowerCase(),
    phone: String(req.body?.phone ?? "").trim(),
    addressLine1: String(req.body?.addressLine1 ?? "").trim(),
    addressLine2: String(req.body?.addressLine2 ?? "").trim(),
    city: String(req.body?.city ?? "").trim(),
    landmark: String(req.body?.landmark ?? "").trim(),
    coordinates: req.body?.coordinates ?? {},
    timings: Array.isArray(req.body?.timings) ? req.body.timings : [],
    amenities: Array.isArray(req.body?.amenities) ? req.body.amenities : [],
    parkingAvailable: req.body?.parkingAvailable !== false,
    staffCount: Number(req.body?.staffCount ?? 0),
    rating: Number(req.body?.rating ?? 0),
    averageDailyOrders: Number(req.body?.averageDailyOrders ?? 0),
    averageDailyRevenue: Number(req.body?.averageDailyRevenue ?? 0),
    gallery: [],
  };

  await insertDoc("branches", record);
  return res.status(201).json(record);
});

// Admin: update a branch.
router.patch("/:id", requireRole(["admin"]), async (req, res) => {
  const existing = await findOne("branches", { id: req.params.id });
  if (!existing) return res.status(404).json({ message: "Branch not found." });

  const patch: Record<string, unknown> = {};
  const fields = ["name", "status", "manager", "email", "phone", "addressLine1", "addressLine2", "city", "landmark", "staffCount", "rating", "parkingAvailable"];
  for (const field of fields) {
    if (req.body?.[field] !== undefined) patch[field] = req.body[field];
  }

  await updateDoc("branches", { id: req.params.id }, patch);
  return res.json({ ...existing, ...patch });
});

// Admin: delete a branch.
router.delete("/:id", requireRole(["admin"]), async (req, res) => {
  const removed = await removeDoc("branches", { id: req.params.id });
  if (!removed) return res.status(404).json({ message: "Branch not found." });
  return res.json({ message: "Branch removed." });
});

export default router;
