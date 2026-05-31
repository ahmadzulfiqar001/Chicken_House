import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Megaphone, Plus, Search, Edit2, Trash2, Eye, TrendingUp, Calendar, CheckCircle, FileText } from "lucide-react";

type Promotion = {
  id: number | string;
  title: string;
  slug?: string;
  description?: string;
  type?: string;
  status?: string;
  badge?: string;
  discountLabel?: string;
  startAt?: string;
  endAt?: string;
  createdAt?: string;
};

const emptyForm = {
  title: "",
  description: "",
  type: "deal",
  status: "Draft",
  discountLabel: "",
  startAt: "",
  endAt: "",
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-PK", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [viewing, setViewing] = useState<Promotion | null>(null);

  const fetchPromotions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/promotions?all=1");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to load promotions.");
      setPromotions(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Promotions could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const filteredPromotions = useMemo(
    () =>
      promotions.filter((promo) =>
        (promo.title ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [promotions, searchQuery],
  );

  const stats = useMemo(() => {
    const active = promotions.filter((p) => p.status === "Active").length;
    const drafts = promotions.filter((p) => p.status === "Draft").length;
    const expired = promotions.filter((p) => p.status === "Expired").length;
    return { total: promotions.length, active, drafts, expired };
  }, [promotions]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const savePromotion = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        title: form.title,
        description: form.description,
        type: form.type,
        status: form.status,
        discountLabel: form.discountLabel,
        startAt: form.startAt || null,
        endAt: form.endAt || null,
      };

      const response = await fetch(editing ? `/api/promotions/${editing.id}` : "/api/promotions", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Failed to save promotion.");
      await fetchPromotions();
      setShowForm(false);
    } catch (saveError) {
      console.error(saveError);
      setError(saveError instanceof Error ? saveError.message : "Promotion could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (promo: Promotion) => {
    const nextStatus = promo.status === "Active" ? "Draft" : "Active";
    try {
      const response = await fetch(`/api/promotions/${promo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Failed to update promotion.");
      await fetchPromotions();
    } catch (toggleError) {
      console.error(toggleError);
      setError(toggleError instanceof Error ? toggleError.message : "Promotion status could not be updated.");
    }
  };

  const deletePromotion = async (promo: Promotion) => {
    const confirmed = window.confirm(`Delete the campaign "${promo.title}"?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/promotions/${promo.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message ?? "Delete failed");
      }
      await fetchPromotions();
    } catch (deleteError) {
      console.error(deleteError);
      setError(deleteError instanceof Error ? deleteError.message : "Promotion could not be deleted.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="absolute inset-0 bg-dark/60 backdrop-blur-sm" />
            <motion.form
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              onSubmit={savePromotion}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-white p-8 shadow-2xl"
            >
              <h3 className="text-3xl font-bold text-dark">{editing ? "Edit Campaign" : "New Campaign"}</h3>
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none md:col-span-2" placeholder="Campaign title" required />
                <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} className="min-h-[110px] rounded-2xl bg-surface px-5 py-4 outline-none md:col-span-2" placeholder="Description" />
                <select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none">
                  <option value="deal">Deal</option>
                  <option value="discount">Discount</option>
                  <option value="banner">Banner</option>
                  <option value="combo">Combo</option>
                </select>
                <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none">
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                </select>
                <input value={form.discountLabel} onChange={(e) => setForm((prev) => ({ ...prev, discountLabel: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none md:col-span-2" placeholder="Discount label (e.g. 20% OFF)" />
                <label className="space-y-2">
                  <span className="px-1 text-xs font-bold uppercase tracking-widest text-muted">Starts</span>
                  <input value={form.startAt} onChange={(e) => setForm((prev) => ({ ...prev, startAt: e.target.value }))} className="w-full rounded-2xl bg-surface px-5 py-4 outline-none" type="date" />
                </label>
                <label className="space-y-2">
                  <span className="px-1 text-xs font-bold uppercase tracking-widest text-muted">Ends</span>
                  <input value={form.endAt} onChange={(e) => setForm((prev) => ({ ...prev, endAt: e.target.value }))} className="w-full rounded-2xl bg-surface px-5 py-4 outline-none" type="date" />
                </label>
              </div>
              {error && <p className="mt-5 text-sm font-medium text-red-500">{error}</p>}
              <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-gray-200 px-6 py-3 font-bold text-muted">Cancel</button>
                <button type="submit" disabled={saving} className="rounded-full bg-primary px-7 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-70">{saving ? "Saving..." : editing ? "Update" : "Create"}</button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* View Details Modal */}
      <AnimatePresence>
        {viewing && (
          <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewing(null)} className="absolute inset-0 bg-dark/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-white p-8 shadow-2xl"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Campaign</p>
                  <h3 className="mt-2 text-3xl font-bold text-dark">{viewing.title}</h3>
                </div>
                <button type="button" onClick={() => setViewing(null)} className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-muted transition hover:text-dark">Close</button>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-surface-strong px-3 py-1 text-xs font-bold capitalize text-dark">{viewing.type ?? "deal"}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                  viewing.status === "Active" ? "bg-green-500/10 text-green-500" :
                  viewing.status === "Draft" ? "bg-blue-500/10 text-blue-500" :
                  "bg-surface-strong text-muted"
                }`}>{viewing.status}</span>
                {viewing.discountLabel ? <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{viewing.discountLabel}</span> : null}
              </div>
              <p className="mt-6 text-sm leading-relaxed text-muted">{viewing.description || "No description provided for this campaign."}</p>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-surface px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">Starts</p>
                  <p className="mt-2 font-bold text-dark">{formatDate(viewing.startAt)}</p>
                </div>
                <div className="rounded-3xl bg-surface px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">Ends</p>
                  <p className="mt-2 font-bold text-dark">{formatDate(viewing.endAt)}</p>
                </div>
                <div className="rounded-3xl bg-surface px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">Created</p>
                  <p className="mt-2 font-bold text-dark">{formatDate(viewing.createdAt)}</p>
                </div>
                <div className="rounded-3xl bg-surface px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">Slug</p>
                  <p className="mt-2 font-bold text-dark">{viewing.slug || "—"}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Promotion Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Megaphone size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Total Campaigns</p>
          <p className="text-2xl font-display font-bold text-dark">{stats.total}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
            <TrendingUp size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Active Campaigns</p>
          <p className="text-2xl font-display font-bold text-dark">{stats.active}</p>
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
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Drafts</p>
          <p className="text-2xl font-display font-bold text-dark">{stats.drafts}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
            <Calendar size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Expired</p>
          <p className="text-2xl font-display font-bold text-dark">{stats.expired}</p>
        </motion.div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <h2 className="text-2xl font-bold text-dark">Marketing Campaigns</h2>

          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
            <button onClick={openCreate} className="px-6 py-3 rounded-xl bg-primary text-white font-bold flex items-center gap-2 hover:bg-primary-strong transition-all shadow-lg shadow-primary/20">
              <Plus size={20} />
              New Campaign
            </button>
          </div>
        </div>

        {error && !showForm && <p className="mb-6 text-sm font-medium text-red-500">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-6 text-muted text-xs font-bold uppercase tracking-widest">Campaign Name</th>
                <th className="pb-6 text-muted text-xs font-bold uppercase tracking-widest">Type</th>
                <th className="pb-6 text-muted text-xs font-bold uppercase tracking-widest">Status</th>
                <th className="pb-6 text-muted text-xs font-bold uppercase tracking-widest">Offer</th>
                <th className="pb-6 text-muted text-xs font-bold uppercase tracking-widest">Ends On</th>
                <th className="pb-6 text-muted text-xs font-bold uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPromotions.map((cp) => (
                <tr key={cp.id} className="group hover:bg-surface transition-colors">
                  <td className="py-6">
                    <span className="text-dark font-bold block">{cp.title}</span>
                    <span className="text-muted text-xs">{cp.slug ?? `CP-${cp.id}`}</span>
                  </td>
                  <td className="py-6">
                    <span className="px-3 py-1 rounded-full bg-surface-strong text-dark text-xs font-bold capitalize">
                      {cp.type ?? "deal"}
                    </span>
                  </td>
                  <td className="py-6">
                    <button
                      onClick={() => toggleStatus(cp)}
                      title="Toggle Draft / Active"
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all hover:opacity-80 ${
                        cp.status === "Active" ? "bg-green-500/10 text-green-500" :
                        cp.status === "Draft" ? "bg-blue-500/10 text-blue-500" :
                        "bg-surface-strong text-muted"
                      }`}>
                      {cp.status}
                    </button>
                  </td>
                  <td className="py-6">
                    <span className="text-dark font-bold text-sm">{cp.discountLabel || cp.badge || "—"}</span>
                  </td>
                  <td className="py-6 text-muted text-sm font-bold">{formatDate(cp.endAt)}</td>
                  <td className="py-6">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(cp); setForm({ title: cp.title ?? "", description: cp.description ?? "", type: cp.type ?? "deal", status: cp.status ?? "Draft", discountLabel: cp.discountLabel ?? "", startAt: cp.startAt ? cp.startAt.slice(0, 10) : "", endAt: cp.endAt ? cp.endAt.slice(0, 10) : "" }); setError(""); setShowForm(true); }} className="p-2 rounded-lg bg-surface-strong text-dark hover:bg-primary hover:text-white transition-all">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => deletePromotion(cp)} className="p-2 rounded-lg bg-surface-strong text-dark hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={18} />
                      </button>
                      <button onClick={() => setViewing(cp)} className="p-2 rounded-lg bg-surface-strong text-dark hover:bg-primary hover:text-white transition-all">
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading ? (
            <div className="p-10 text-center text-muted">Loading campaigns...</div>
          ) : filteredPromotions.length === 0 ? (
            <div className="p-10 text-center text-muted">No campaigns yet.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PromotionManagement;
