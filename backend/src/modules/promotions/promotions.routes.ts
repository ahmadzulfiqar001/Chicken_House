import express from "express";
import { requireRole } from "../auth/auth.service";
import { loadAll, findOne, insertDoc, updateDoc, removeDoc } from "../../core/store";

const router = express.Router();

const slugify = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `promo-${Date.now()}`;

const TYPES = ["deal", "discount", "banner", "combo"];
const STATUSES = ["Draft", "Active", "Expired"];

// Public: active promotions (homepage/menu). Admin passes ?all=1 for the full list.
router.get("/", async (req, res) => {
  const includeAll = String(req.query.all ?? "") === "1";
  let promotions = (await loadAll("promotions"))
    .slice()
    .sort((a, b) => Date.parse(String(b.createdAt ?? 0)) - Date.parse(String(a.createdAt ?? 0)));

  if (!includeAll) {
    promotions = promotions.filter((promotion) => promotion.status === "Active");
  }

  return res.json(promotions);
});

// Admin: create a promotion.
router.post("/", requireRole(["admin", "manager"]), async (req, res) => {
  const title = String(req.body?.title ?? "").trim();
  if (title.length < 2) return res.status(400).json({ message: "Please enter a promotion title." });

  const type = String(req.body?.type ?? "deal");
  const status = String(req.body?.status ?? "Draft");
  if (!TYPES.includes(type)) return res.status(400).json({ message: "Invalid promotion type." });
  if (!STATUSES.includes(status)) return res.status(400).json({ message: "Invalid promotion status." });

  const slug = String(req.body?.slug ?? "").trim() || slugify(title);
  if (await findOne("promotions", { slug })) {
    return res.status(409).json({ message: "A promotion with this slug already exists." });
  }

  const record = {
    id: `PROMO-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    slug,
    description: String(req.body?.description ?? "").trim(),
    type,
    status,
    badge: String(req.body?.badge ?? "").trim(),
    image: String(req.body?.image ?? "").trim(),
    startAt: String(req.body?.startAt ?? "").trim(),
    endAt: String(req.body?.endAt ?? "").trim(),
    discountLabel: String(req.body?.discountLabel ?? "").trim(),
    appliesToCategories: Array.isArray(req.body?.appliesToCategories) ? req.body.appliesToCategories : [],
    appliesToMenuIds: Array.isArray(req.body?.appliesToMenuIds) ? req.body.appliesToMenuIds : [],
    branchIds: Array.isArray(req.body?.branchIds) ? req.body.branchIds : [],
    ctas: Array.isArray(req.body?.ctas) ? req.body.ctas : [],
    createdAt: new Date().toISOString(),
  };

  await insertDoc("promotions", record);
  return res.status(201).json(record);
});

// Admin: update a promotion.
router.patch("/:id", requireRole(["admin", "manager"]), async (req, res) => {
  const existing = await findOne("promotions", { id: req.params.id });
  if (!existing) return res.status(404).json({ message: "Promotion not found." });

  const patch: Record<string, unknown> = {};
  const fields = ["title", "description", "type", "status", "badge", "image", "startAt", "endAt", "discountLabel"];
  for (const field of fields) {
    if (req.body?.[field] !== undefined) patch[field] = req.body[field];
  }
  if (patch.status && !STATUSES.includes(String(patch.status))) {
    return res.status(400).json({ message: "Invalid promotion status." });
  }

  await updateDoc("promotions", { id: req.params.id }, patch);
  return res.json({ ...existing, ...patch });
});

// Admin: delete a promotion.
router.delete("/:id", requireRole(["admin"]), async (req, res) => {
  const removed = await removeDoc("promotions", { id: req.params.id });
  if (!removed) return res.status(404).json({ message: "Promotion not found." });
  return res.json({ message: "Promotion removed." });
});

export default router;
