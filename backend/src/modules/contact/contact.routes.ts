import express from "express";
import { requirePermission } from "../auth/auth.service";
import { db } from "../../core/db";
import { ContactMessageModel } from "../../core/models";
import { isMongoConfigured } from "../../core/mongo";

const router = express.Router();

// Viewing the contact inbox is staff-only; POST stays public for the website form.
router.get("/", requirePermission("users:view"), async (_req, res) => {
  if (isMongoConfigured()) {
    const messages = await ContactMessageModel.find().sort({ createdAt: -1 }).lean();
    return res.json(messages);
  }

  return res.json([...db.contactMessages].reverse());
});

router.post("/", async (req, res) => {
  const payload = {
    name: String(req.body?.name ?? "").trim(),
    email: String(req.body?.email ?? "").trim().toLowerCase(),
    phone: String(req.body?.phone ?? "").trim(),
    subject: String(req.body?.subject ?? "").trim(),
    message: String(req.body?.message ?? "").trim(),
    source: String(req.body?.source ?? "website").trim() || "website",
  };

  if (payload.name.length < 2) {
    return res.status(400).json({ message: "Please enter your name." });
  }

  if (!payload.email.includes("@")) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  if (payload.phone && !/^\+?[0-9\s-]{10,16}$/.test(payload.phone)) {
    return res.status(400).json({ message: "Please enter a valid phone number." });
  }

  if (!payload.subject) {
    return res.status(400).json({ message: "Please enter a subject." });
  }

  if (payload.message.length < 10) {
    return res.status(400).json({ message: "Please enter a more detailed message." });
  }

  const messageRecord = {
    id: `MSG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ...payload,
    status: "Unread",
    priority: "Normal",
    tags: [],
    assignedTo: "",
    responseMessage: "",
    respondedAt: "",
  };

  if (isMongoConfigured()) {
    const created = await ContactMessageModel.create(messageRecord);
    return res.status(201).json(created.toObject());
  }

  db.contactMessages.push(messageRecord);
  return res.status(201).json(messageRecord);
});

export default router;
