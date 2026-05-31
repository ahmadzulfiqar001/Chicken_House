import express from "express";
import { requireRole } from "../auth/auth.service";
import { loadAll, insertDoc, updateDoc, removeDoc } from "../../core/store";

const router = express.Router();

// Public: list published reviews (used by the homepage testimonials carousel).
// Admin/manager may pass ?all=1 to include pending/rejected for moderation.
router.get("/", async (req, res) => {
  const includeAll = String(req.query.all ?? "") === "1";
  const limit = Number(req.query.limit ?? 0);

  let reviews = (await loadAll("reviews"))
    .slice()
    .sort((a, b) => Date.parse(String(b.createdAt ?? 0)) - Date.parse(String(a.createdAt ?? 0)));

  if (!includeAll) {
    reviews = reviews.filter((review) => review.status === "Approved");
  }

  if (Number.isFinite(limit) && limit > 0) {
    reviews = reviews.slice(0, limit);
  }

  return res.json(reviews);
});

// Public: submit a guest review.
router.post("/", async (req, res) => {
  const customerName = String(req.body?.customerName ?? req.body?.name ?? "").trim();
  const comment = String(req.body?.comment ?? req.body?.text ?? "").trim();
  const rating = Math.round(Number(req.body?.rating ?? 5));

  if (customerName.length < 2) {
    return res.status(400).json({ message: "Please enter your name." });
  }
  if (comment.length < 5) {
    return res.status(400).json({ message: "Please write a slightly longer review." });
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5." });
  }

  const record = {
    id: `REV-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    customerName,
    customerEmail: String(req.body?.customerEmail ?? req.body?.email ?? "").trim().toLowerCase(),
    source: "website",
    rating,
    title: String(req.body?.title ?? "").trim(),
    comment,
    tags: [],
    status: "Pending", // held for admin moderation before appearing on the public site
    isFeatured: false,
    branchId: "renala-khurd-main",
    orderId: String(req.body?.orderId ?? "").trim(),
    createdAt: new Date().toISOString(),
  };

  await insertDoc("reviews", record);
  return res.status(201).json(record);
});

// Admin/manager: moderate a review (status / featured).
router.patch("/:id", requireRole(["admin", "manager"]), async (req, res) => {
  const patch: Record<string, unknown> = {};
  if (req.body?.status !== undefined) patch.status = String(req.body.status);
  if (req.body?.isFeatured !== undefined) patch.isFeatured = Boolean(req.body.isFeatured);

  await updateDoc("reviews", { id: req.params.id }, patch);
  return res.json({ message: "Review updated.", id: req.params.id, ...patch });
});

router.delete("/:id", requireRole(["admin"]), async (req, res) => {
  const removed = await removeDoc("reviews", { id: req.params.id });
  if (!removed) return res.status(404).json({ message: "Review not found." });
  return res.json({ message: "Review removed." });
});

export default router;
