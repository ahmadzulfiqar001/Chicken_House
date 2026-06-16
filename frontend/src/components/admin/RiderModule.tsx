import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bike, MapPin, Clock, CheckCircle, Star, ChevronRight, Search, RefreshCw, Phone, UserPlus, X } from "lucide-react";

const emptyForm = {
  name: "",
  phone: "",
  zone: "",
  vehicleType: "Bike",
  status: "Available",
};

const RiderModule = () => {
  const [riders, setRiders] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchRiders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/riders");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to load riders.");
      setRiders(data.riders ?? []);
      setMetrics(data.metrics ?? null);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Riders could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  const filteredRiders = useMemo(
    () =>
      riders.filter((rider) =>
        [rider.name, rider.zone]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      ),
    [riders, searchQuery],
  );

  const addRider = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/riders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          zone: form.zone,
          vehicleType: form.vehicleType,
          status: form.status,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Failed to add rider.");
      await fetchRiders();
      setForm(emptyForm);
      setShowForm(false);
    } catch (saveError) {
      console.error(saveError);
      setError("Rider could not be added.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (rider, status) => {
    try {
      const response = await fetch(`/api/riders/${rider.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Failed to update status.");
      setRiders((prev) => prev.map((r) => (r.id === rider.id ? { ...r, status } : r)));
      setSelected((prev) => (prev && prev.id === rider.id ? { ...prev, status } : prev));
    } catch (updateError) {
      console.error(updateError);
      setError("Rider status could not be updated.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Rider Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Bike size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Total Riders</p>
          <p className="text-2xl font-display font-bold text-dark">{metrics?.total ?? 0} Riders</p>
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
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Active Now</p>
          <p className="text-2xl font-display font-bold text-dark">{metrics?.active ?? 0} Active</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
            <MapPin size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">On Delivery</p>
          <p className="text-2xl font-display font-bold text-dark">{metrics?.onDelivery ?? 0} Riders</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center mb-4">
            <Star size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Avg. Rating</p>
          <p className="text-2xl font-display font-bold text-dark">{metrics?.avgRating ?? 0} / 5.0</p>
        </motion.div>
      </div>

      {/* Riders Table */}
      <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <h2 className="text-2xl font-bold text-dark">Rider Management</h2>

          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                placeholder="Search riders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
            <button
              onClick={fetchRiders}
              className="p-3 rounded-xl bg-surface text-dark hover:bg-primary hover:text-white transition-all"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => {
                setForm(emptyForm);
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
            >
              <UserPlus size={20} />
              Add Rider
            </button>
          </div>
        </div>

        {error && <p className="mb-4 text-sm font-medium text-red-500">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Rider</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Zone</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Active Orders</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Rating</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Status</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRiders.map((rider) => (
                <tr key={rider.id} className="group hover:bg-surface transition-colors">
                  <td className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface-strong flex items-center justify-center text-dark font-bold">
                        {rider.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <span className="text-dark font-bold block">{rider.name}</span>
                        <span className="text-muted text-xs">{rider.phone || rider.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 font-medium text-dark">{rider.zone || "—"}</td>
                  <td className="py-6 font-bold text-dark">{rider.activeOrders ?? 0}</td>
                  <td className="py-6 font-bold text-primary">{rider.rating ?? 0} / 5.0</td>
                  <td className="py-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      rider.status === "Available" ? "bg-green-500/10 text-green-500" :
                      rider.status === "On Delivery" ? "bg-blue-500/10 text-blue-500" :
                      "bg-surface-strong text-muted"
                    }`}>
                      {rider.status}
                    </span>
                  </td>
                  <td className="py-6">
                    <div className="flex gap-2">
                      <a
                        href={rider.phone ? `tel:${rider.phone}` : undefined}
                        className={`p-2 rounded-lg bg-surface-strong text-dark transition-all ${
                          rider.phone ? "hover:bg-primary hover:text-white" : "opacity-40 pointer-events-none"
                        }`}
                        title={rider.phone ? `Call ${rider.name}` : "No phone number"}
                      >
                        <Phone size={18} />
                      </a>
                      <button
                        onClick={() => setSelected(rider)}
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
          {!loading && filteredRiders.length === 0 && (
            <div className="p-10 text-center text-muted">No riders yet.</div>
          )}
        </div>
      </div>

      {/* Add Rider Form */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            />
            <motion.form
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              onSubmit={addRider}
              className="relative w-full max-w-2xl rounded-[2.5rem] bg-white p-8 shadow-2xl"
            >
              <h3 className="text-3xl font-bold text-dark">Add Rider</h3>
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="rounded-2xl bg-surface px-5 py-4 outline-none"
                  placeholder="Full name"
                />
                <input
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="rounded-2xl bg-surface px-5 py-4 outline-none"
                  placeholder="Phone number"
                />
                <input
                  value={form.zone}
                  onChange={(e) => setForm((prev) => ({ ...prev, zone: e.target.value }))}
                  className="rounded-2xl bg-surface px-5 py-4 outline-none"
                  placeholder="Zone / area"
                />
                <select
                  value={form.vehicleType}
                  onChange={(e) => setForm((prev) => ({ ...prev, vehicleType: e.target.value }))}
                  className="rounded-2xl bg-surface px-5 py-4 outline-none"
                >
                  <option value="Bike">Bike</option>
                  <option value="Car">Car</option>
                  <option value="Scooter">Scooter</option>
                  <option value="Bicycle">Bicycle</option>
                </select>
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="rounded-2xl bg-surface px-5 py-4 outline-none md:col-span-2"
                >
                  <option value="Available">Available</option>
                  <option value="On Delivery">On Delivery</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-full border border-gray-200 px-6 py-3 font-bold text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-primary px-7 py-3 font-bold text-white"
                >
                  {saving ? "Saving..." : "Create"}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Rider Details Modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
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
              className="relative w-full max-w-lg rounded-[2.5rem] bg-white p-8 shadow-2xl"
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute right-6 top-6 p-2 rounded-lg bg-surface-strong text-dark hover:bg-primary hover:text-white transition-all"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-surface-strong flex items-center justify-center text-dark font-bold text-lg">
                  {selected.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-dark">{selected.name}</h3>
                  <span className="text-muted text-xs">{selected.id}</span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Phone</p>
                  {selected.phone ? (
                    <a href={`tel:${selected.phone}`} className="font-bold text-primary inline-flex items-center gap-2">
                      <Phone size={14} /> {selected.phone}
                    </a>
                  ) : (
                    <p className="font-bold text-dark">—</p>
                  )}
                </div>
                <div>
                  <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Zone</p>
                  <p className="font-bold text-dark">{selected.zone || "—"}</p>
                </div>
                <div>
                  <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Vehicle</p>
                  <p className="font-bold text-dark">{selected.vehicleType || "—"}{selected.plateNumber ? ` · ${selected.plateNumber}` : ""}</p>
                </div>
                <div>
                  <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Shift</p>
                  <p className="font-bold text-dark">{selected.shift || "—"}</p>
                </div>
                <div>
                  <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Active Orders</p>
                  <p className="font-bold text-dark">{selected.activeOrders ?? 0}</p>
                </div>
                <div>
                  <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Rating</p>
                  <p className="font-bold text-primary inline-flex items-center gap-1"><Star size={14} /> {selected.rating ?? 0} / 5.0</p>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-muted text-xs font-bold uppercase tracking-widest mb-3">Update Status</p>
                <div className="flex flex-wrap gap-3">
                  {["Available", "On Delivery", "Offline"].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(selected, status)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        selected.status === status
                          ? "bg-primary text-white"
                          : "bg-surface-strong text-dark hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RiderModule;
