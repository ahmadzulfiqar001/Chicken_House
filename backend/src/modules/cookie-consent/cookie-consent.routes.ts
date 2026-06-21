import express from "express";
import { findOne, insertDoc, updateDoc } from "../../core/store";

const router = express.Router();

const trimTo = (value: unknown, maxLength: number) => String(value ?? "").trim().slice(0, maxLength);

const getClientIp = (req: express.Request) => {
  const forwardedFor = String(req.headers["x-forwarded-for"] ?? "").split(",")[0]?.trim();
  return forwardedFor || req.ip || "";
};

router.post("/", async (req, res) => {
  const choice = trimTo(req.body?.choice, 20);

  if (choice !== "accepted" && choice !== "rejected") {
    return res.status(400).json({ message: "Cookie consent choice is required." });
  }

  const now = new Date().toISOString();
  const visitorId =
    trimTo(req.body?.visitorId, 120) || `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const existing = await findOne("cookieConsents", { visitorId });
  const choicePatch = choice === "accepted" ? { acceptedAt: now, rejectedAt: "" } : { acceptedAt: "", rejectedAt: now };
  const patch = {
    visitorId,
    choice,
    consentVersion: trimTo(req.body?.consentVersion, 80),
    source: trimTo(req.body?.source, 80) || "cookie-banner",
    page: trimTo(req.body?.page, 300),
    timezone: trimTo(req.body?.timezone, 80),
    userAgent: trimTo(req.get("user-agent"), 500),
    ipAddress: trimTo(getClientIp(req), 80),
    updatedAt: now,
    ...choicePatch,
  };

  if (existing) {
    await updateDoc("cookieConsents", { visitorId }, patch);
    return res.json({ message: "Cookie consent updated.", consent: { ...existing, ...patch } });
  }

  const record = {
    id: `CONS-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: trimTo(req.body?.decidedAt, 40) || now,
    ...patch,
  };

  await insertDoc("cookieConsents", record);
  return res.status(201).json({ message: "Cookie consent saved.", consent: record });
});

export default router;
