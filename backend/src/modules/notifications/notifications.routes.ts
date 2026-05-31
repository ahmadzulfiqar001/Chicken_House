import express from "express";
import { getRequestAuthUser, requireRole } from "../auth/auth.service";
import { loadAll, insertDoc, updateDoc, removeDoc, findOne } from "../../core/store";
import { emitChange } from "../../core/realtime";
import { deliverNotification, isResendConfigured, type NotifyChannel, type Recipient } from "./notify.service";
import { isWhatsAppCloudConfigured } from "../whatsapp/whatsapp.service";

const router = express.Router();

const AUDIENCES = ["all", "customers", "admins", "staff"] as const;
const CHANNELS = ["in-app", "email", "sms", "whatsapp"] as const;

const adminOnly = requireRole(["admin", "manager"]);

/** Resolve the recipient list (emails + phones) for a target audience. */
const collectRecipients = async (audience: string): Promise<Recipient[]> => {
  const recipients: Recipient[] = [];

  if (audience === "customers" || audience === "all") {
    const customers = await loadAll("customers");
    for (const customer of customers) {
      recipients.push({ email: String(customer.email ?? ""), phone: String(customer.phone ?? ""), name: String(customer.name ?? "") });
    }
  }

  if (audience === "staff" || audience === "all") {
    const staff = await loadAll("staff");
    for (const member of staff) {
      recipients.push({ email: String(member.email ?? ""), phone: String(member.phone ?? ""), name: String(member.name ?? "") });
    }
  }

  if (audience === "admins") {
    const accounts = await loadAll("userAccounts");
    for (const account of accounts) {
      if (["admin", "manager"].includes(String(account.role))) {
        recipients.push({ email: String(account.email ?? ""), phone: String(account.phone ?? ""), name: String(account.name ?? "") });
      }
    }
  }

  // De-duplicate by email+phone.
  const seen = new Set<string>();
  return recipients.filter((recipient) => {
    const key = `${recipient.email}|${recipient.phone}`;
    if (seen.has(key) || (!recipient.email && !recipient.phone)) return false;
    seen.add(key);
    return true;
  });
};

const buildMetrics = (notifications: Array<Record<string, any>>) => {
  const todayKey = new Date().toISOString().slice(0, 10);
  return {
    total: notifications.length,
    sent: notifications.filter((n) => n.status === "Sent").length,
    drafts: notifications.filter((n) => n.status === "Draft" || n.status === "Queued").length,
    failed: notifications.filter((n) => n.status === "Failed").length,
    sentToday: notifications.filter((n) => String(n.sentAt ?? "").slice(0, 10) === todayKey).length,
    delivered: notifications.reduce((sum, n) => sum + Number(n.metadata?.delivered ?? 0), 0),
  };
};

// List notifications + channel availability + metrics (admin/manager).
router.get("/", adminOnly, async (_req, res) => {
  const notifications = (await loadAll("notifications"))
    .slice()
    .sort((a, b) => Date.parse(String(b.createdAt ?? 0)) - Date.parse(String(a.createdAt ?? 0)));

  return res.json({
    notifications,
    metrics: buildMetrics(notifications),
    channels: {
      email: isResendConfigured(),
      whatsapp: isWhatsAppCloudConfigured(),
      sms: isWhatsAppCloudConfigured(),
      "in-app": true,
    },
  });
});

// Create + (optionally) broadcast a notification (admin/manager).
router.post("/", adminOnly, async (req, res) => {
  const title = String(req.body?.title ?? "").trim();
  const message = String(req.body?.message ?? "").trim();
  const audience = String(req.body?.audience ?? "all").trim();
  const channel = String(req.body?.channel ?? "in-app").trim() as NotifyChannel;
  const shouldSend = req.body?.send !== false; // default: send immediately

  if (title.length < 2) return res.status(400).json({ message: "Please enter a notification title." });
  if (message.length < 2) return res.status(400).json({ message: "Please enter a message." });
  if (!AUDIENCES.includes(audience as (typeof AUDIENCES)[number]))
    return res.status(400).json({ message: "Invalid audience." });
  if (!CHANNELS.includes(channel as (typeof CHANNELS)[number]))
    return res.status(400).json({ message: "Invalid channel." });

  const actor = getRequestAuthUser(req);
  const now = new Date().toISOString();

  const record: Record<string, any> = {
    id: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    message,
    audience,
    channel,
    status: "Draft",
    scheduledAt: "",
    sentAt: "",
    createdBy: actor?.email ?? "",
    branchId: "",
    metadata: {},
    createdAt: now,
  };

  if (shouldSend) {
    const recipients = await collectRecipients(audience);
    const delivery = await deliverNotification({ channel, title, message, recipients });
    record.metadata = {
      audienceSize: recipients.length,
      attempted: delivery.attempted,
      delivered: delivery.delivered,
      skipped: delivery.skipped,
      errors: delivery.errors.slice(0, 5),
    };
    record.sentAt = now;
    record.status = delivery.skipped
      ? "Queued" // channel not configured — kept as queued so it can be sent later
      : delivery.errors.length && delivery.delivered === 0
        ? "Failed"
        : "Sent";
  }

  await insertDoc("notifications", record);
  emitChange("notifications", { operationType: "insert" });

  return res.status(201).json(record);
});

// Re-send an existing notification (admin/manager).
router.post("/:id/send", adminOnly, async (req, res) => {
  const notification = await findOne("notifications", { id: req.params.id });
  if (!notification) return res.status(404).json({ message: "Notification not found." });

  const recipients = await collectRecipients(String(notification.audience ?? "all"));
  const delivery = await deliverNotification({
    channel: String(notification.channel ?? "in-app") as NotifyChannel,
    title: String(notification.title ?? ""),
    message: String(notification.message ?? ""),
    recipients,
  });

  const now = new Date().toISOString();
  const status = delivery.skipped
    ? "Queued"
    : delivery.errors.length && delivery.delivered === 0
      ? "Failed"
      : "Sent";

  await updateDoc(
    "notifications",
    { id: req.params.id },
    {
      status,
      sentAt: now,
      metadata: {
        audienceSize: recipients.length,
        attempted: delivery.attempted,
        delivered: delivery.delivered,
        skipped: delivery.skipped,
        errors: delivery.errors.slice(0, 5),
      },
    },
  );
  emitChange("notifications", { operationType: "update" });

  return res.json({ ...notification, status, sentAt: now });
});

router.delete("/:id", requireRole(["admin"]), async (req, res) => {
  const removed = await removeDoc("notifications", { id: req.params.id });
  if (!removed) return res.status(404).json({ message: "Notification not found." });
  emitChange("notifications", { operationType: "delete" });
  return res.json({ message: "Notification removed." });
});

export default router;
