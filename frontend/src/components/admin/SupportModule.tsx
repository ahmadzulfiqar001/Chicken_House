import { FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useRealtime } from "../../lib/realtime";
import {
  Archive,
  CheckCircle,
  ChevronRight,
  Clock,
  HelpCircle,
  Mail,
  MailOpen,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

const statusStyles = {
  Unread: "bg-red-500/10 text-red-500",
  Read: "bg-blue-500/10 text-blue-500",
  Replied: "bg-green-500/10 text-green-500",
  Archived: "bg-gray-500/10 text-gray-500",
};

const priorityStyles = {
  High: "bg-red-500/10 text-red-500",
  Medium: "bg-yellow-500/10 text-yellow-500",
  Low: "bg-blue-500/10 text-blue-500",
};

const SupportModule = ({ focusTicketId }: { focusTicketId?: string } = {}) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to load support tickets.");
      setTickets(data);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Support tickets could not be loaded right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useRealtime("contactMessages", () => {
    fetchTickets();
  });

  useEffect(() => {
    if (!focusTicketId) return;

    setSearchQuery(focusTicketId);

    const targetTicket = tickets.find((ticket) => String(ticket.id) === focusTicketId);
    if (targetTicket) {
      setSelected(targetTicket);
    }
  }, [focusTicketId, tickets]);

  const filteredTickets = useMemo(() => {
    const lowered = searchQuery.toLowerCase();
    return tickets.filter((ticket) =>
      [ticket.name, ticket.subject, ticket.email, ticket.message, ticket.status, ticket.priority]
        .join(" ")
        .toLowerCase()
        .includes(lowered),
    );
  }, [tickets, searchQuery]);

  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === "Unread" || t.status === "Read").length;
    const resolved = tickets.filter((t) => t.status === "Replied" || t.status === "Archived").length;
    const unread = tickets.filter((t) => t.status === "Unread").length;
    return { total, open, resolved, unread };
  }, [tickets]);

  const patchTicket = async (id, payload) => {
    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Failed to update ticket.");
      await fetchTickets();
      if (selected?.id === id) setSelected(data);
      return data;
    } catch (patchError) {
      console.error(patchError);
      setError("Ticket could not be updated.");
      return null;
    }
  };

  const openReply = (ticket) => {
    setReplyTarget(ticket);
    setReplyText(ticket.responseMessage ?? "");
  };

  const closeReply = () => {
    setReplyTarget(null);
    setReplyText("");
  };

  const submitReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!replyTarget || replyText.trim().length < 2) return;
    setSaving(true);
    setError("");
    const result = await patchTicket(replyTarget.id, {
      responseMessage: replyText.trim(),
      status: "Replied",
    });
    setSaving(false);
    if (result) closeReply();
  };

  const changeStatus = async (ticket, status) => {
    await patchTicket(ticket.id, { status });
  };

  return (
    <div className="space-y-8">
      {/* Reply Modal */}
      <AnimatePresence>
        {replyTarget && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeReply}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            />
            <motion.form
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              onSubmit={submitReply}
              className="relative w-full max-w-full sm:max-w-2xl rounded-[2.5rem] bg-white p-8 shadow-2xl"
            >
              <h3 className="text-3xl font-bold text-dark">Reply to {replyTarget.name}</h3>
              <p className="mt-2 text-sm text-muted">{replyTarget.subject || "Support request"}</p>
              <div className="mt-6 rounded-2xl bg-surface p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted">Original Message</p>
                <p className="mt-2 text-sm leading-7 text-dark">{replyTarget.message}</p>
              </div>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="mt-6 min-h-36 w-full rounded-2xl bg-surface px-5 py-4 outline-none"
                placeholder="Write your reply to the customer..."
              />
              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={closeReply}
                  className="rounded-full border border-gray-200 px-6 py-3 font-bold text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-primary px-7 py-3 font-bold text-white"
                >
                  {saving ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="relative w-full max-w-full sm:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto rounded-[3rem] bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 p-8">
                <div>
                  <h2 className="text-2xl font-bold text-dark">{selected.subject || "Support Ticket"}</h2>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">
                    {new Date(selected.createdAt).toLocaleString("en-PK")}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-muted transition hover:bg-red-500 hover:text-white"
                >
                  <XCircle size={22} />
                </button>
              </div>

              <div className="space-y-5 p-8">
                <div className="rounded-[2rem] bg-surface p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">Customer</p>
                  <h3 className="mt-2 text-xl font-bold text-dark">{selected.name}</h3>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-2xl bg-white p-4">
                      <Mail size={18} className="text-primary" />
                      <span className="text-sm font-medium text-dark">{selected.email || "No email"}</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-white p-4">
                      <Phone size={18} className="text-primary" />
                      <span className="text-sm font-medium text-dark">{selected.phone || "No phone"}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] bg-surface p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">Message</p>
                  <p className="mt-3 text-sm leading-7 text-dark">{selected.message}</p>
                </div>

                {selected.responseMessage ? (
                  <div className="rounded-[2rem] bg-green-500/5 p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-green-600">Your Reply</p>
                    <p className="mt-3 text-sm leading-7 text-dark">{selected.responseMessage}</p>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <span className={`rounded-full px-3 py-2 text-xs font-bold ${statusStyles[selected.status] ?? "bg-surface-strong text-dark"}`}>
                    {selected.status}
                  </span>
                  {selected.priority ? (
                    <span className={`rounded-full px-3 py-2 text-xs font-bold ${priorityStyles[selected.priority] ?? "bg-surface-strong text-dark"}`}>
                      {selected.priority} Priority
                    </span>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-4 sm:gap-3 md:grid-cols-4">
                  <button
                    onClick={() => openReply(selected)}
                    className="rounded-2xl bg-primary px-4 py-4 font-bold text-white transition hover:bg-primary-dark"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => changeStatus(selected, "Read")}
                    className="rounded-2xl bg-blue-50 px-4 py-4 font-bold text-blue-500 transition hover:bg-blue-500 hover:text-white"
                  >
                    Mark Read
                  </button>
                  <button
                    onClick={() => changeStatus(selected, "Archived")}
                    className="rounded-2xl bg-surface-strong px-4 py-4 font-bold text-dark transition hover:bg-gray-500 hover:text-white"
                  >
                    Archive
                  </button>
                  <button
                    onClick={() => changeStatus(selected, "Replied")}
                    className="rounded-2xl bg-green-50 px-4 py-4 font-bold text-green-600 transition hover:bg-green-500 hover:text-white"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Support Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <HelpCircle size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Total Tickets</p>
          <p className="text-2xl font-display font-bold text-dark">{stats.total}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
            <Clock size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Open Tickets</p>
          <p className="text-2xl font-display font-bold text-dark">{stats.open}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
            <CheckCircle size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Resolved</p>
          <p className="text-2xl font-display font-bold text-dark">{stats.resolved}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
            <MessageSquare size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Unread</p>
          <p className="text-2xl font-display font-bold text-dark">{stats.unread}</p>
        </motion.div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <h2 className="text-2xl font-bold text-dark">Support Tickets</h2>

          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
            <button
              onClick={fetchTickets}
              className="p-3 rounded-xl bg-surface text-dark hover:bg-primary hover:text-white transition-all"
              title="Refresh"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {error && <p className="mb-4 text-sm font-medium text-red-500">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Customer</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Subject</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Priority</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Status</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="group hover:bg-surface transition-colors">
                  <td className="py-6">
                    <span className="text-dark font-bold block">{ticket.name}</span>
                    <span className="text-muted text-xs">{ticket.email}</span>
                  </td>
                  <td className="py-6">
                    <span className="text-dark font-medium block max-w-xs truncate">{ticket.subject || "No subject"}</span>
                    <span className="text-muted text-xs">{new Date(ticket.createdAt).toLocaleString("en-PK")}</span>
                  </td>
                  <td className="py-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${priorityStyles[ticket.priority] ?? "bg-surface-strong text-dark"}`}>
                      {ticket.priority || "Normal"}
                    </span>
                  </td>
                  <td className="py-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles[ticket.status] ?? "bg-surface-strong text-dark"}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="py-6">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openReply(ticket)}
                        className="p-2 rounded-lg bg-surface-strong text-dark hover:bg-primary hover:text-white transition-all"
                        title="Reply"
                      >
                        <MessageSquare size={18} />
                      </button>
                      {ticket.status === "Unread" ? (
                        <button
                          onClick={() => changeStatus(ticket, "Read")}
                          className="p-2 rounded-lg bg-surface-strong text-dark hover:bg-primary hover:text-white transition-all"
                          title="Mark read"
                        >
                          <MailOpen size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => changeStatus(ticket, "Archived")}
                          className="p-2 rounded-lg bg-surface-strong text-dark hover:bg-primary hover:text-white transition-all"
                          title="Archive"
                        >
                          <Archive size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => setSelected(ticket)}
                        className="p-2 rounded-lg bg-surface-strong text-dark hover:bg-primary hover:text-white transition-all"
                        title="View details"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && filteredTickets.length === 0 && (
            <div className="p-10 text-center text-muted">No support tickets yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportModule;
