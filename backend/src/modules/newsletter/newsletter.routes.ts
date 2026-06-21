import express from "express";
import { requireRole } from "../auth/auth.service";
import { loadAll, insertDoc, findOne, updateDoc } from "../../core/store";

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public: subscribe to the newsletter (idempotent — re-subscribing is a no-op success).
router.post("/", async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const name = String(req.body?.name ?? "").trim();

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  const existing = await findOne("newsletterSubscribers", { email });
  if (existing) {
    if (String(existing.status ?? "").toLowerCase() === "unsubscribed") {
      const patch = {
        status: "Subscribed",
        source: String(req.body?.source ?? existing.source ?? "website").trim() || "website",
        name: name || String(existing.name ?? ""),
        unsubscribedAt: "",
        updatedAt: new Date().toISOString(),
      };
      await updateDoc("newsletterSubscribers", { email }, patch);
      return res.status(200).json({ message: "You're subscribed again.", subscriber: { ...existing, ...patch } });
    }

    return res.status(200).json({ message: "You're already subscribed.", subscriber: existing });
  }

  const record = {
    id: `SUB-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    email,
    name,
    source: String(req.body?.source ?? "website").trim() || "website",
    status: "Subscribed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    unsubscribedAt: "",
  };

  await insertDoc("newsletterSubscribers", record);
  return res.status(201).json({ message: "Subscribed successfully.", subscriber: record });
});

// Public: unsubscribe by email. The record is retained with status "Unsubscribed"
// so the admin can keep an accurate subscription history.
router.post("/unsubscribe", async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  const existing = await findOne("newsletterSubscribers", { email });
  if (!existing) {
    return res.status(404).json({ message: "This email is not subscribed." });
  }

  if (String(existing.status ?? "").toLowerCase() === "unsubscribed") {
    return res.status(200).json({ message: "This email is already unsubscribed.", subscriber: existing });
  }

  const patch = {
    status: "Unsubscribed",
    unsubscribedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await updateDoc("newsletterSubscribers", { email }, patch);
  return res.json({ message: "You've been unsubscribed.", subscriber: { ...existing, ...patch } });
});

// Admin: list subscribers.
router.get("/", requireRole(["admin", "manager"]), async (_req, res) => {
  const subscribers = (await loadAll("newsletterSubscribers"))
    .slice()
    .sort((a, b) => Date.parse(String(b.createdAt ?? 0)) - Date.parse(String(a.createdAt ?? 0)));
  return res.json(subscribers);
});

export default router;
