import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Bell,
  MessageSquare,
  Mail,
  Smartphone,
  Settings,
  AlertCircle,
  CheckCircle,
  Send,
  Trash2,
  Search,
  FileText,
} from "lucide-react";
import { useRealtime } from "../../lib/realtime";
import { useToast } from "../layout/ToastProvider";

const emptyForm = {
  title: "",
  message: "",
  audience: "all",
  channel: "in-app",
};

const statusStyles = {
  Sent: "bg-green-500/10 text-green-600",
  Queued: "bg-blue-500/10 text-blue-500",
  Live: "bg-amber-500/10 text-amber-600",
  Draft: "bg-surface-strong text-muted",
  Failed: "bg-red-500/10 text-red-500",
};

const channelLabels = {
  "in-app": "In-App",
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
};

const sourceLabels = {
  orders: "Orders",
  bookings: "Bookings",
  contact: "Support",
  inventory: "Inventory",
  careers: "Careers",
  reviews: "Reviews",
};

const formatTime = (value) => {
  if (!value) {
    return "Not sent yet";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not sent yet";
  }
  return date.toLocaleString("en-PK");
};

export type NotificationTarget = {
  tab: string;
  source: string;
  id?: string;
  search?: string;
};

const getNotificationTarget = (notif): NotificationTarget | null => {
  const source = String(notif.metadata?.source ?? "");

  if (source === "orders") {
    return { tab: "orders", source, id: String(notif.metadata?.orderId ?? ""), search: String(notif.metadata?.orderId ?? "") };
  }

  if (source === "bookings") {
    return { tab: "bookings", source, id: String(notif.metadata?.bookingId ?? ""), search: String(notif.metadata?.bookingId ?? "") };
  }

  if (source === "contact") {
    return { tab: "support", source, id: String(notif.metadata?.messageId ?? ""), search: String(notif.metadata?.messageId ?? "") };
  }

  if (source === "inventory") {
    return { tab: "inventory", source, id: String(notif.metadata?.itemId ?? ""), search: String(notif.metadata?.itemId ?? "") };
  }

  if (source === "careers") {
    return { tab: "careers", source, id: String(notif.metadata?.applicationId ?? ""), search: String(notif.metadata?.applicationId ?? "") };
  }

  return null;
};

const NotificationModule = ({ onOpenRelated }: { onOpenRelated?: (target: NotificationTarget) => void }) => {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [channels, setChannels] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [sending, setSending] = useState(false);
  const [reviewBusyId, setReviewBusyId] = useState("");

  const loadNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message ?? "Failed to load notifications.");
      }

      setNotifications(data.notifications ?? []);
      setMetrics(data.metrics ?? null);
      setChannels(data.channels ?? null);
      setError("");
    } catch (fetchError) {
      console.error(fetchError);
      setError("Notifications could not be loaded right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  // Live updates: manual notifications and system-alert sources both refresh this list.
  useRealtime(["notifications", "orders", "bookings", "inventory", "contactMessages"], () => {
    void loadNotifications();
  });

  const filteredNotifications = useMemo(() => {
    const lowered = search.toLowerCase();
    return notifications.filter((notif) =>
      [notif.title, notif.message, notif.audience, notif.channel, notif.status]
        .join(" ")
        .toLowerCase()
        .includes(lowered),
    );
  }, [notifications, search]);

  const composeNotification = async (event: FormEvent) => {
    event.preventDefault();

    if (form.title.trim().length < 2 || form.message.trim().length < 2) {
      showToast({
        tone: "error",
        title: "Notification not sent",
        description: "A title and message are both required.",
      });
      return;
    }

    setSending(true);

    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          message: form.message.trim(),
          audience: form.audience,
          channel: form.channel,
          send: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message ?? "Failed to send notification.");
      }

      await loadNotifications();
      setForm(emptyForm);
      showToast({
        tone: "success",
        title: "Notification sent",
        description: `"${form.title.trim()}" was dispatched to ${form.audience}.`,
      });
    } catch (composeError) {
      console.error(composeError);
      showToast({
        tone: "error",
        title: "Send failed",
        description: composeError instanceof Error ? composeError.message : "The notification could not be sent.",
      });
    } finally {
      setSending(false);
    }
  };

  const sendNotification = async (notif) => {
    try {
      const res = await fetch(`/api/notifications/${notif.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message ?? "Failed to send notification.");
      }

      await loadNotifications();
      showToast({
        tone: "success",
        title: notif.status === "Sent" ? "Notification resent" : "Notification sent",
        description: `"${notif.title}" was dispatched.`,
      });
    } catch (sendError) {
      console.error(sendError);
      showToast({
        tone: "error",
        title: "Send failed",
        description: sendError instanceof Error ? sendError.message : "The notification could not be sent.",
      });
    }
  };

  const deleteNotification = async (notif) => {
    if (!window.confirm(`Delete notification "${notif.title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/notifications/${notif.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message ?? "Failed to delete notification.");
      }

      await loadNotifications();
      showToast({
        tone: "success",
        title: "Notification deleted",
        description: `"${notif.title}" was removed.`,
      });
    } catch (deleteError) {
      console.error(deleteError);
      showToast({
        tone: "error",
        title: "Delete failed",
        description: deleteError instanceof Error ? deleteError.message : "The notification could not be deleted.",
      });
    }
  };

  const moderateReview = async (notif, status: "Approved" | "Rejected") => {
    const reviewId = String(notif.metadata?.reviewId ?? "");
    if (!reviewId) return;

    setReviewBusyId(reviewId);

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message ?? "Review could not be updated.");
      }

      await loadNotifications();
      showToast({
        tone: "success",
        title: "Review settled",
        description: `Review ${status.toLowerCase()}. The alert has been cleared.`,
      });
    } catch (reviewError) {
      console.error(reviewError);
      showToast({
        tone: "error",
        title: "Review action failed",
        description: reviewError instanceof Error ? reviewError.message : "Review could not be updated.",
      });
    } finally {
      setReviewBusyId("");
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50">
              <div className="mb-4 h-12 w-12 rounded-2xl bg-surface" />
              <div className="mb-2 h-3 w-28 rounded-full bg-surface" />
              <div className="h-8 w-20 rounded-full bg-surface" />
            </div>
          ))}
        </div>
        <div className="h-96 rounded-[3rem] bg-white shadow-xl shadow-dark/5 border border-gray-50" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Notification Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Bell size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Total Notifications</p>
          <p className="text-2xl font-display font-bold text-dark">{metrics?.total ?? 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
            <CheckCircle size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Sent</p>
          <p className="text-2xl font-display font-bold text-dark">{metrics?.sent ?? 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
            <FileText size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Live Alerts</p>
          <p className="text-2xl font-display font-bold text-dark">{metrics?.live ?? 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Failed</p>
          <p className="text-2xl font-display font-bold text-dark">{metrics?.failed ?? 0}</p>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-muted">
            {metrics?.sentToday ?? 0} sent today
          </p>
        </motion.div>
      </div>

      {/* Notification List + Compose / Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Notification List */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <h2 className="text-2xl font-bold text-dark">Recent Notifications</h2>
            <div className="relative flex-1 md:w-64 md:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search notifications..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
          </div>

          {error ? <p className="mb-6 text-sm font-medium text-red-500">{error}</p> : null}

          <div className="space-y-6">
            {filteredNotifications.map((notif) => {
              const isSystemAlert = Boolean(notif.system || notif.metadata?.system);
              const sourceLabel = notif.metadata?.source ? sourceLabels[notif.metadata.source] ?? notif.metadata.source : "";
              const target = getNotificationTarget(notif);
              const reviewId = String(notif.metadata?.reviewId ?? "");
              const isReviewAlert = notif.metadata?.source === "reviews" && Boolean(reviewId);

              return (
                <div
                  key={notif.id}
                  onClick={target && onOpenRelated ? () => onOpenRelated(target) : undefined}
                  onKeyDown={(event) => {
                    if (!target || !onOpenRelated) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onOpenRelated(target);
                    }
                  }}
                  role={target && onOpenRelated ? "button" : undefined}
                  tabIndex={target && onOpenRelated ? 0 : undefined}
                  className={`flex items-start gap-6 p-6 rounded-3xl bg-surface hover:bg-surface-strong transition-all group ${
                    target && onOpenRelated ? "cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/25" : ""
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      notif.channel === "email"
                        ? "bg-purple-500/10 text-purple-500"
                        : notif.channel === "sms"
                          ? "bg-blue-500/10 text-blue-500"
                          : notif.channel === "whatsapp"
                            ? "bg-green-500/10 text-green-500"
                            : isSystemAlert
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-primary/10 text-primary"
                    }`}
                  >
                    {notif.channel === "email" ? (
                      <Mail size={24} />
                    ) : notif.channel === "sms" ? (
                      <Smartphone size={24} />
                    ) : notif.channel === "whatsapp" ? (
                      <MessageSquare size={24} />
                    ) : isSystemAlert ? (
                      <AlertCircle size={24} />
                    ) : (
                      <Bell size={24} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                      <span className="text-dark font-bold">{notif.title}</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          statusStyles[notif.status] ?? "bg-surface-strong text-muted"
                        }`}
                      >
                        {isSystemAlert ? "Live Alert" : notif.status}
                      </span>
                    </div>
                    <p className="text-muted text-sm leading-relaxed">{notif.message}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted">
                      <span className="px-2 py-1 rounded-full bg-white">
                        {channelLabels[notif.channel] ?? notif.channel}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-white">{notif.audience}</span>
                      {sourceLabel ? <span className="px-2 py-1 rounded-full bg-white">{sourceLabel}</span> : null}
                      <span>{formatTime(notif.sentAt)}</span>
                      {!isSystemAlert && notif.metadata ? (
                        <span className="text-primary">{notif.metadata.delivered ?? 0} delivered</span>
                      ) : null}
                    </div>
                    {!isSystemAlert ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => sendNotification(notif)}
                          className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-dark transition hover:bg-primary hover:text-white"
                        >
                          <Send size={14} />
                          {notif.status === "Sent" ? "Resend" : "Send"}
                        </button>
                        <button
                          onClick={() => deleteNotification(notif)}
                          className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-dark transition hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    ) : isReviewAlert ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={reviewBusyId === reviewId}
                          onClick={(event) => {
                            event.stopPropagation();
                            void moderateReview(notif, "Approved");
                          }}
                          className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-dark transition hover:bg-green-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <CheckCircle size={14} />
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={reviewBusyId === reviewId}
                          onClick={(event) => {
                            event.stopPropagation();
                            void moderateReview(notif, "Rejected");
                          }}
                          className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-dark transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <AlertCircle size={14} />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <p className="mt-4 text-xs font-medium text-muted">
                        {target && onOpenRelated
                          ? `Click to open ${sourceLabel || "the related module"}. This alert clears once the issue is resolved there.`
                          : "Auto alert from live restaurant data. Handle it from its related module."}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {!filteredNotifications.length ? (
              <div className="rounded-3xl bg-surface px-6 py-12 text-center text-muted">
                {search ? "No notifications matched your search." : "No manual notifications or live alerts yet."}
              </div>
            ) : null}
          </div>
        </div>

        {/* Compose + Channels */}
        <div className="bg-dark rounded-[3rem] p-10 text-white">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <Send size={24} className="text-primary" />
            Compose
          </h3>

          <form onSubmit={composeNotification} className="space-y-4">
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Notification title"
              className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-primary/40"
            />
            <textarea
              value={form.message}
              onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
              placeholder="Message body"
              className="min-h-24 w-full rounded-xl bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={form.audience}
                onChange={(event) => setForm((current) => ({ ...current, audience: event.target.value }))}
                className="rounded-xl bg-white/10 px-3 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option className="text-dark" value="all">All</option>
                <option className="text-dark" value="customers">Customers</option>
                <option className="text-dark" value="admins">Admins</option>
                <option className="text-dark" value="staff">Staff</option>
              </select>
              <select
                value={form.channel}
                onChange={(event) => setForm((current) => ({ ...current, channel: event.target.value }))}
                className="rounded-xl bg-white/10 px-3 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option className="text-dark" value="in-app">In-App</option>
                <option className="text-dark" value="email">Email</option>
                <option className="text-dark" value="sms">SMS</option>
                <option className="text-dark" value="whatsapp">WhatsApp</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Send size={18} />
              {sending ? "Sending..." : "Send Notification"}
            </button>
          </form>

          <h3 className="text-xl font-bold mt-12 mb-6 flex items-center gap-3">
            <Settings size={24} className="text-primary" />
            Channels
          </h3>
          <div className="space-y-4">
            {[
              { key: "in-app", label: "In-App", icon: Bell },
              { key: "email", label: "Email Alerts", icon: Mail },
              { key: "whatsapp", label: "WhatsApp", icon: MessageSquare },
              { key: "sms", label: "SMS Marketing", icon: Smartphone },
            ].map(({ key, label, icon: Icon }) => {
              const available = channels ? channels[key] : false;
              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <span className="font-bold">{label}</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      available ? "bg-green-500/10 text-green-400" : "bg-white/10 text-white/40"
                    }`}
                  >
                    {available ? "Available" : "Not configured"}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-10 p-6 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-white/60 text-xs leading-relaxed">
              In-app notifications are saved here immediately. Email, SMS, and WhatsApp depend on configured providers; if a provider is not configured, the notification stays queued for sending later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModule;
