import express from "express";
import { getRequestAuthUser, requireRole } from "../auth/auth.service";
import { loadAll, insertDoc, updateDoc, removeDoc, findOne } from "../../core/store";
import { emitChange } from "../../core/realtime";
import { deliverNotification, isResendConfigured, type NotifyChannel, type Recipient } from "./notify.service";
import { isWhatsAppCloudConfigured } from "../whatsapp/whatsapp.service";
import { db } from "../../core/db";
import { BookingRequestModel, ContactMessageModel } from "../../core/models";
import { isMongoConfigured } from "../../core/mongo";

const router = express.Router();

const AUDIENCES = ["all", "customers", "admins", "staff"] as const;
const CHANNELS = ["in-app", "email", "sms", "whatsapp"] as const;

const adminOnly = requireRole(["admin", "manager"]);
const notificationReaders = requireRole(["admin", "manager", "staff", "rider"]);
const adminNotificationRoles = new Set(["admin", "manager"]);
const staffNotificationRoles = new Set(["staff", "rider"]);

const toDateValue = (value: unknown) => {
  const parsed = Date.parse(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const toIsoDate = (value: unknown) => {
  const parsed = toDateValue(value);
  return parsed ? new Date(parsed).toISOString() : new Date().toISOString();
};

const formatRs = (value: unknown) => `Rs. ${Number(value ?? 0).toLocaleString("en-PK")}`;

const canReadManualNotification = (notification: Record<string, any>, role = "") => {
  const audience = String(notification.audience ?? "all");

  if (adminNotificationRoles.has(role)) {
    return audience === "admins" || audience === "all";
  }

  if (staffNotificationRoles.has(role)) {
    return audience === "staff" || audience === "all";
  }

  return false;
};

const loadBookings = async () => {
  if (isMongoConfigured()) {
    return BookingRequestModel.find().sort({ createdAt: -1 }).lean();
  }
  return db.bookings;
};

const loadContactMessages = async () => {
  if (isMongoConfigured()) {
    return ContactMessageModel.find().sort({ createdAt: -1 }).lean();
  }
  return db.contactMessages;
};

const buildSystemNotification = ({
  id,
  title,
  message,
  source,
  createdAt,
  severity = "info",
  metadata = {},
}: {
  id: string;
  title: string;
  message: string;
  source: string;
  createdAt: unknown;
  severity?: "info" | "warning" | "danger" | "success";
  metadata?: Record<string, unknown>;
}) => ({
  id: `SYS-${source}-${id}`,
  title,
  message,
  audience: "admins",
  channel: "in-app",
  status: "Live",
  scheduledAt: "",
  sentAt: toIsoDate(createdAt),
  createdBy: "system",
  branchId: "",
  metadata: {
    system: true,
    source,
    severity,
    ...metadata,
  },
  createdAt: toIsoDate(createdAt),
  system: true,
});

const buildSystemNotifications = async () => {
  const [orders, inventory, bookings, contactMessages, jobApplications, reviews] = await Promise.all([
    loadAll("orders"),
    loadAll("inventory"),
    loadBookings(),
    loadContactMessages(),
    loadAll("jobApplications"),
    loadAll("reviews"),
  ]);

  const paymentAlerts = orders
    .filter((order) => String(order.paymentStatus ?? "") === "Pending Verification")
    .slice(0, 8)
    .map((order) =>
      buildSystemNotification({
        id: String(order.id),
        title: "Payment verification needed",
        message: `${order.id} from ${order.customer} is waiting for ${order.paymentMethod} verification (${formatRs(order.total)}).`,
        source: "orders",
        createdAt: order.time,
        severity: "warning",
        metadata: { orderId: order.id, paymentStatus: order.paymentStatus },
      }),
    );

  const orderAlerts = orders
    .filter(
      (order) =>
        ["Pending", "Confirmed", "Preparing", "Out for Delivery"].includes(String(order.status ?? "")) &&
        String(order.paymentStatus ?? "") !== "Pending Verification",
    )
    .slice(0, 8)
    .map((order) =>
      buildSystemNotification({
        id: String(order.id),
        title: `Order ${order.status}`,
        message: `${order.id} for ${order.customer} is ${order.status}. Total: ${formatRs(order.total)}.`,
        source: "orders",
        createdAt: order.time,
        severity: order.status === "Pending" ? "warning" : "info",
        metadata: { orderId: order.id, orderStatus: order.status },
      }),
    );

  const bookingAlerts = bookings
    .filter((booking) => String(booking.status ?? "") === "Pending")
    .slice(0, 8)
    .map((booking) =>
      buildSystemNotification({
        id: String(booking.id),
        title: "New booking request",
        message: `${booking.customerName} requested ${booking.eventType || "an event"} for ${booking.guests} guests on ${booking.date} at ${booking.time}.`,
        source: "bookings",
        createdAt: booking.createdAt ?? booking.date,
        severity: "info",
        metadata: { bookingId: booking.id },
      }),
    );

  const contactAlerts = contactMessages
    .filter((message) => String(message.status ?? "") === "Unread")
    .slice(0, 8)
    .map((message) =>
      buildSystemNotification({
        id: String(message.id),
        title: "Unread support message",
        message: `${message.name} sent "${message.subject || "Contact request"}".`,
        source: "contact",
        createdAt: message.createdAt,
        severity: String(message.priority ?? "") === "High" ? "danger" : "info",
        metadata: { messageId: message.id, priority: message.priority },
      }),
    );

  const stockAlerts = inventory
    .filter((item) => Number(item.stock ?? 0) <= Number(item.minStock ?? 0))
    .slice(0, 8)
    .map((item) =>
      buildSystemNotification({
        id: String(item.id),
        title: "Low stock alert",
        message: `${item.name} is at ${item.stock} ${item.unit}; minimum level is ${item.minStock}.`,
        source: "inventory",
        createdAt: item.lastUpdated,
        severity: "danger",
        metadata: { itemId: item.id, stock: item.stock, minStock: item.minStock },
      }),
    );

  const careerAlerts = jobApplications
    .filter((application) => ["Pending", "Reviewing"].includes(String(application.status ?? "")))
    .slice(0, 6)
    .map((application) =>
      buildSystemNotification({
        id: String(application.id),
        title: "Career application pending",
        message: `${application.name} applied for ${application.jobTitle}.`,
        source: "careers",
        createdAt: application.appliedAt,
        severity: "info",
        metadata: { applicationId: application.id, applicationStatus: application.status },
      }),
    );

  const reviewAlerts = reviews
    .filter((review) => String(review.status ?? "") === "Pending")
    .slice(0, 6)
    .map((review) =>
      buildSystemNotification({
        id: String(review.id),
        title: "Review waiting for moderation",
        message: `${review.customerName} left a ${review.rating}-star review.`,
        source: "reviews",
        createdAt: review.createdAt,
        severity: "info",
        metadata: { reviewId: review.id, rating: review.rating },
      }),
    );

  return [
    ...paymentAlerts,
    ...orderAlerts,
    ...bookingAlerts,
    ...contactAlerts,
    ...stockAlerts,
    ...careerAlerts,
    ...reviewAlerts,
  ]
    .sort((a, b) => toDateValue(b.createdAt) - toDateValue(a.createdAt))
    .slice(0, 30);
};

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

  if (audience === "admins" || audience === "all") {
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
    live: notifications.filter((n) => n.status === "Live" || n.metadata?.system).length,
    drafts: notifications.filter((n) => n.status === "Draft" || n.status === "Queued").length,
    failed: notifications.filter((n) => n.status === "Failed").length,
    sentToday: notifications.filter((n) => String(n.sentAt ?? "").slice(0, 10) === todayKey).length,
    delivered: notifications.reduce((sum, n) => sum + Number(n.metadata?.delivered ?? 0), 0),
  };
};

// List notifications + channel availability + metrics for the signed-in role.
router.get("/", notificationReaders, async (req, res) => {
  const role = getRequestAuthUser(req)?.role ?? "";
  const manualNotifications = (await loadAll("notifications"))
    .slice()
    .filter((notification) => canReadManualNotification(notification, role))
    .sort((a, b) => Date.parse(String(b.createdAt ?? 0)) - Date.parse(String(a.createdAt ?? 0)));
  const systemNotifications = adminNotificationRoles.has(role) ? await buildSystemNotifications() : [];
  const notifications = [...systemNotifications, ...manualNotifications].sort(
    (a, b) => toDateValue(b.createdAt) - toDateValue(a.createdAt),
  );

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
