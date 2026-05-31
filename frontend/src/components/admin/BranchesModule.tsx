import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Users, Phone, Star, Plus, Search, Pencil, Trash2, RefreshCw, ExternalLink } from "lucide-react";

const emptyForm = {
  name: "",
  city: "",
  phone: "",
  manager: "",
  addressLine1: "",
  status: "Active",
};

const BranchesModule = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [viewing, setViewing] = useState(null);

  const fetchBranches = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/branches");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to load branches.");
      setBranches(data);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Branches could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const filteredBranches = useMemo(
    () =>
      branches.filter((branch) =>
        [branch.name, branch.city]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      ),
    [branches, searchTerm],
  );

  const totalStaff = useMemo(
    () => branches.reduce((sum, branch) => sum + (Number(branch.staffCount) || 0), 0),
    [branches],
  );

  const activeCount = useMemo(
    () => branches.filter((branch) => branch.status === "Active").length,
    [branches],
  );

  const upcomingCount = useMemo(
    () => branches.filter((branch) => branch.status === "Under Construction").length,
    [branches],
  );

  const avgRating = useMemo(() => {
    const rated = branches.filter((branch) => Number(branch.rating) > 0);
    if (rated.length === 0) return 0;
    return rated.reduce((sum, branch) => sum + Number(branch.rating), 0) / rated.length;
  }, [branches]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEdit = (branch) => {
    setEditing(branch);
    setForm({
      name: branch.name ?? "",
      city: branch.city ?? "",
      phone: branch.phone ?? "",
      manager: branch.manager ?? "",
      addressLine1: branch.addressLine1 ?? "",
      status: branch.status ?? "Active",
    });
    setError("");
    setShowForm(true);
  };

  const saveBranch = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        city: form.city,
        phone: form.phone,
        manager: form.manager,
        addressLine1: form.addressLine1,
        status: form.status,
      };
      const response = await fetch(editing ? `/api/branches/${editing.id}` : "/api/branches", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Failed to save branch.");
      await fetchBranches();
      setShowForm(false);
    } catch (saveError) {
      console.error(saveError);
      setError("Branch could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const deleteBranch = async (id) => {
    const confirmed = window.confirm("Delete this branch?");
    if (!confirmed) return;
    try {
      const response = await fetch(`/api/branches/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      await fetchBranches();
    } catch (deleteError) {
      console.error(deleteError);
      setError("Branch could not be deleted.");
    }
  };

  const fullAddress = (branch) =>
    [branch.addressLine1, branch.addressLine2, branch.landmark, branch.city].filter(Boolean).join(", ");

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="absolute inset-0 bg-dark/60 backdrop-blur-sm" />
            <motion.form
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              onSubmit={saveBranch}
              className="relative w-full max-w-2xl rounded-[2.5rem] bg-white p-8 shadow-2xl"
            >
              <h3 className="text-3xl font-bold text-dark">{editing ? "Edit Branch" : "Add New Branch"}</h3>
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none" placeholder="Branch name" required />
                <input value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none" placeholder="City" />
                <input value={form.manager} onChange={(e) => setForm((prev) => ({ ...prev, manager: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none" placeholder="Manager" />
                <input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none" placeholder="Phone number" />
                <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none md:col-span-2">
                  <option value="Active">Active</option>
                  <option value="Under Construction">Under Construction</option>
                  <option value="Closed">Closed</option>
                </select>
                <input value={form.addressLine1} onChange={(e) => setForm((prev) => ({ ...prev, addressLine1: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none md:col-span-2" placeholder="Address" />
              </div>
              {error && <p className="mt-4 text-sm font-medium text-red-500">{error}</p>}
              <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-gray-200 px-6 py-3 font-bold text-muted">Cancel</button>
                <button type="submit" disabled={saving} className="rounded-full bg-primary px-7 py-3 font-bold text-white">{saving ? "Saving..." : editing ? "Update" : "Create"}</button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewing && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewing(null)} className="absolute inset-0 bg-dark/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="relative w-full max-w-xl rounded-[2.5rem] bg-white p-8 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-3xl font-bold text-dark">{viewing.name}</h3>
                  <p className="text-muted">{viewing.city || "—"}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  viewing.status === 'Active' ? 'bg-green-50 text-green-500' :
                  viewing.status === 'Under Construction' ? 'bg-yellow-50 text-yellow-500' : 'bg-red-50 text-red-500'
                }`}>
                  {viewing.status}
                </span>
              </div>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">Manager</p>
                  <p className="font-bold text-dark">{viewing.manager || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">Staff</p>
                  <p className="font-bold text-dark">{viewing.staffCount ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">Phone</p>
                  <p className="font-bold text-dark flex items-center gap-2"><Phone size={14} />{viewing.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">Email</p>
                  <p className="font-bold text-dark break-all">{viewing.email || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">Rating</p>
                  <p className="font-bold text-dark flex items-center gap-1 text-yellow-500"><Star size={14} fill="currentColor" />{Number(viewing.rating) > 0 ? Number(viewing.rating).toFixed(1) : "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">Address</p>
                  <p className="font-bold text-dark flex items-center gap-2"><MapPin size={14} />{fullAddress(viewing) || "—"}</p>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={() => { const branch = viewing; setViewing(null); openEdit(branch); }} className="rounded-full border border-gray-200 px-6 py-3 font-bold text-muted">Edit</button>
                <button type="button" onClick={() => setViewing(null)} className="rounded-full bg-primary px-7 py-3 font-bold text-white">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-dark">Branches Management</h2>
          <p className="text-muted">Manage restaurant locations and performance.</p>
        </div>
        <button onClick={openCreate} className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20">
          <Plus size={20} />
          Add New Branch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <MapPin size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-muted uppercase tracking-widest">Total Branches</p>
              <h3 className="text-2xl font-bold text-dark">{branches.length}</h3>
            </div>
          </div>
          <p className="text-muted text-xs">{activeCount} Active, {upcomingCount} Upcoming</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-muted uppercase tracking-widest">Total Staff</p>
              <h3 className="text-2xl font-bold text-dark">{totalStaff}</h3>
            </div>
          </div>
          <p className="text-muted text-xs">Across all locations</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-500 flex items-center justify-center">
              <Star size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-muted uppercase tracking-widest">Avg. Rating</p>
              <h3 className="text-2xl font-bold text-dark">{avgRating > 0 ? avgRating.toFixed(1) : "N/A"}</h3>
            </div>
          </div>
          <p className="text-muted text-xs">Across all rated branches</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="Search branches..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button onClick={fetchBranches} className="px-4 py-3 rounded-xl bg-surface text-dark font-bold flex items-center gap-2 hover:bg-surface-strong transition-all">
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button onClick={openCreate} className="px-4 py-3 rounded-xl bg-surface text-dark font-bold flex items-center gap-2 hover:bg-surface-strong transition-all">
              <Plus size={18} />
              Add
            </button>
          </div>
        </div>

        {error && <p className="px-8 pt-4 text-sm font-medium text-red-500">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface text-muted text-xs font-bold uppercase tracking-widest">
                <th className="px-8 py-4">Branch ID</th>
                <th className="px-8 py-4">Name</th>
                <th className="px-8 py-4">Address</th>
                <th className="px-8 py-4">Manager</th>
                <th className="px-8 py-4">Staff</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Rating</th>
                <th className="px-8 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBranches.map((branch) => (
                <tr key={branch.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-8 py-6 font-mono text-sm">{branch.id}</td>
                  <td className="px-8 py-6 font-bold text-dark">{branch.name}</td>
                  <td className="px-8 py-6 text-sm text-muted">{fullAddress(branch) || "—"}</td>
                  <td className="px-8 py-6 font-bold text-dark">{branch.manager || "—"}</td>
                  <td className="px-8 py-6 text-sm text-muted">{branch.staffCount ?? 0}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      branch.status === 'Active' ? 'bg-green-50 text-green-500' :
                      branch.status === 'Under Construction' ? 'bg-yellow-50 text-yellow-500' : 'bg-red-50 text-red-500'
                    }`}>
                      {branch.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1 text-yellow-500 font-bold">
                      <Star size={14} fill="currentColor" />
                      {Number(branch.rating) > 0 ? Number(branch.rating).toFixed(1) : "N/A"}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setViewing(branch)} className="text-primary font-bold hover:underline flex items-center gap-1">
                        View Details
                        <ExternalLink size={14} />
                      </button>
                      <button onClick={() => openEdit(branch)} className="rounded-lg bg-surface-strong p-2 text-dark transition hover:bg-primary hover:text-white">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => deleteBranch(branch.id)} className="rounded-lg bg-surface-strong p-2 text-dark transition hover:bg-red-500 hover:text-white">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredBranches.length === 0 && (
            <div className="p-10 text-center text-muted">No branches yet.</div>
          )}
          {loading && <div className="p-10 text-center text-muted">Loading branches...</div>}
        </div>
      </div>
    </div>
  );
};

export default BranchesModule;
