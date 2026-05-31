import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, CheckCircle, Clock, Pencil, RefreshCw, Search, Trash2, UserPlus, Users } from "lucide-react";

type StaffMember = {
  id: number;
  name: string;
  role: string;
  status: string;
  shift: string;
  salary?: number;
  joinDate: string;
  email?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  department?: string;
  userAccountId?: string;
};

const emptyForm = {
  name: "",
  role: "",
  status: "Active",
  shift: "Morning",
  salary: "0",
  joinDate: "",
  email: "",
  phone: "",
  address: "",
  emergencyContact: "",
  department: "",
};

const HRManagement = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchStaff = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/hr");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to load staff.");
      setStaff(data);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Staff records could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredStaff = useMemo(
    () =>
      staff.filter((member) =>
        [member.name, member.role, member.status, member.shift]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      ),
    [staff, searchQuery],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (member: StaffMember) => {
    setEditing(member);
    setForm({
      name: member.name,
      role: member.role,
      status: member.status,
      shift: member.shift,
      salary: String(member.salary ?? 0),
      joinDate: member.joinDate,
      email: member.email ?? "",
      phone: member.phone ?? "",
      address: member.address ?? "",
      emergencyContact: member.emergencyContact ?? "",
      department: member.department ?? "",
    });
    setShowForm(true);
  };

  const saveMember = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        name: form.name,
        role: form.role,
        status: form.status,
        shift: form.shift,
        salary: Number(form.salary),
        joinDate: form.joinDate || new Date().toISOString().slice(0, 10),
        email: form.email,
        phone: form.phone,
        address: form.address,
        emergencyContact: form.emergencyContact,
        department: form.department,
      };

      const response = await fetch(editing ? `/api/hr/${editing.id}` : "/api/hr", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Failed to save staff.");
      await fetchStaff();
      setShowForm(false);
    } catch (saveError) {
      console.error(saveError);
      setError("Staff record could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const deleteMember = async (id: number) => {
    const confirmed = window.confirm("Delete this staff member?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/hr/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      await fetchStaff();
    } catch (deleteError) {
      console.error(deleteError);
      setError("Staff member could not be deleted.");
    }
  };

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
              onSubmit={saveMember}
              className="relative w-full max-w-3xl rounded-[2.5rem] bg-white p-8 shadow-2xl"
            >
              <h3 className="text-3xl font-bold text-dark">{editing ? "Edit Staff Member" : "Add Staff Member"}</h3>
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none" placeholder="Full name" />
                <select value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none">
                  <option value="">Select role</option>
                  <option value="Manager / Branch Supervisor">Manager / Branch Supervisor</option>
                  <option value="Cashier / Counter Staff">Cashier / Counter Staff</option>
                  <option value="Kitchen Staff / Chef">Kitchen Staff / Chef</option>
                  <option value="Rider / Delivery Staff">Rider / Delivery Staff</option>
                  <option value="Inventory Staff">Inventory Staff</option>
                  <option value="General Staff">General Staff</option>
                </select>
                <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none">
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <select value={form.shift} onChange={(e) => setForm((prev) => ({ ...prev, shift: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none">
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
                <input value={form.salary} onChange={(e) => setForm((prev) => ({ ...prev, salary: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none" placeholder="Salary" type="number" min="0" />
                <input value={form.joinDate} onChange={(e) => setForm((prev) => ({ ...prev, joinDate: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none" type="date" />
                <input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none" placeholder="Staff email" type="email" />
                <input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none" placeholder="Phone number" />
                <input value={form.department} onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none" placeholder="Department" />
                <input value={form.emergencyContact} onChange={(e) => setForm((prev) => ({ ...prev, emergencyContact: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none" placeholder="Emergency contact" />
                <input value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none md:col-span-2" placeholder="Address" />
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-gray-200 px-6 py-3 font-bold text-muted">Cancel</button>
                <button type="submit" disabled={saving} className="rounded-full bg-primary px-7 py-3 font-bold text-white">{saving ? "Saving..." : editing ? "Update" : "Create"}</button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Users size={24} /></div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Total Staff</p>
          <p className="text-2xl font-display font-bold text-dark">{staff.length}</p>
        </div>
        <div className="rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-500"><CheckCircle size={24} /></div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Active Now</p>
          <p className="text-2xl font-display font-bold text-dark">{staff.filter((s) => s.status === "Active").length}</p>
        </div>
        <div className="rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-500"><Clock size={24} /></div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">On Leave</p>
          <p className="text-2xl font-display font-bold text-dark">{staff.filter((s) => s.status === "On Leave").length}</p>
        </div>
        <div className="rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500"><Calendar size={24} /></div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">New Hires</p>
          <p className="text-2xl font-display font-bold text-dark">
            {staff.filter((s) => new Date(s.joinDate).getMonth() === new Date().getMonth()).length}
          </p>
        </div>
      </div>

      <div className="rounded-3xl lg:rounded-[3rem] border border-gray-50 bg-white p-4 sm:p-6 lg:p-10 shadow-xl shadow-dark/5">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-bold text-dark">Workforce Directory</h2>
          <div className="flex w-full flex-wrap gap-4 md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input type="text" placeholder="Search staff..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-xl bg-surface py-3 pr-4 pl-12 text-sm outline-none" />
            </div>
            <button onClick={fetchStaff} className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-strong text-dark transition hover:bg-primary hover:text-white">
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/20">
              <UserPlus size={20} />
              Add Staff
            </button>
          </div>
        </div>

        {error && <p className="mb-4 text-sm font-medium text-red-500">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-bold uppercase tracking-widest text-muted">
                <th className="pb-6">Employee</th>
                <th className="pb-6">Role</th>
                <th className="pb-6">Contact</th>
                <th className="pb-6">Shift</th>
                <th className="pb-6">Status</th>
                <th className="pb-6">Salary</th>
                <th className="pb-6">Joined</th>
                <th className="pb-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStaff.map((member) => (
                <tr key={member.id} className="group hover:bg-surface transition-colors">
                  <td className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-strong font-bold text-dark">
                        {member.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <span className="block font-bold text-dark">{member.name}</span>
                        <span className="text-xs text-muted">ID: {member.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 font-medium text-dark">{member.role}</td>
                  <td className="py-6">
                    <p className="text-sm text-dark">{member.phone || "No phone"}</p>
                    <p className="text-xs text-muted">{member.email || member.department || "No department"}</p>
                  </td>
                  <td className="py-6 text-sm text-muted">{member.shift}</td>
                  <td className="py-6">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${member.status === "Active" ? "bg-green-500/10 text-green-500" : member.status === "On Leave" ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="py-6 text-sm font-bold text-dark">Rs. {Number(member.salary ?? 0).toLocaleString()}</td>
                  <td className="py-6 text-sm text-muted">{member.joinDate}</td>
                  <td className="py-6">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(member)} className="rounded-lg bg-surface-strong p-2 text-dark transition hover:bg-primary hover:text-white">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => deleteMember(member.id)} className="rounded-lg bg-surface-strong p-2 text-dark transition hover:bg-red-500 hover:text-white">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredStaff.length === 0 && <div className="p-10 text-center text-muted">No staff members found.</div>}
        </div>
      </div>
    </div>
  );
};

export default HRManagement;
