import { FormEvent, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, UserPlus, Shield, Search, RefreshCw, Pencil, Trash2, X, 
  CheckCircle, XCircle, Clock, Ban
} from "lucide-react";

type UserAccount = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "rider" | "staff" | "user";
  status: "Active" | "Suspended" | "Pending";
  phone: string;
  memberSince: string;
  emailVerified: boolean;
  lastLoginAt: string;
  avatarInitials: string;
  staffMemberId?: number;
  customerProfileId?: string;
  linkedProfile?: {
    type: "staff" | "customer";
    shift?: string;
    department?: string;
    address?: string;
    emergencyContact?: string;
    salary?: number;
    title?: string;
    city?: string;
    orderCount?: number;
    loyaltyPoints?: number;
  } | null;
};

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "user" as const,
  status: "Active" as const,
  phone: "",
  shift: "Morning",
  department: "",
  salary: "0",
  address: "",
  emergencyContact: "",
};

const UserManagement = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<UserAccount | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (user: UserAccount) => {
    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone,
      password: "",
      shift: user.linkedProfile?.shift ?? "Morning",
      department: user.linkedProfile?.department ?? "",
      salary: String(user.linkedProfile?.salary ?? 0),
      address: user.linkedProfile?.address ?? "",
      emergencyContact: user.linkedProfile?.emergencyContact ?? "",
    });
    setShowModal(true);
  };

  const saveUser = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        status: form.status,
        phone: form.phone,
        shift: form.shift,
        department: form.department,
        salary: Number(form.salary),
        address: form.address,
        emergencyContact: form.emergencyContact,
      };

      const response = await fetch(editing ? `/api/users/${editing.id}` : "/api/users", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message ?? "Failed to save user");
      }

      await fetchUsers();
      setShowModal(false);
    } catch (saveError) {
      console.error(saveError);
      setError(saveError instanceof Error ? saveError.message : "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm("Delete this user? This action cannot be undone.")) return;

    try {
      const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      await fetchUsers();
    } catch (deleteError) {
      console.error(deleteError);
      setError("Failed to delete user");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = [user.name, user.email, user.role, user.status]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === "admin").length,
    managers: users.filter(u => u.role === "manager").length,
    staff: users.filter(u => ["manager", "rider", "staff"].includes(u.role)).length,
    customers: users.filter(u => u.role === "user").length,
    active: users.filter(u => u.status === "Active").length,
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-500/10 text-red-500";
      case "manager": return "bg-blue-500/10 text-blue-500";
      case "rider": return "bg-cyan-500/10 text-cyan-600";
      case "staff": return "bg-purple-500/10 text-purple-500";
      case "user": return "bg-slate-500/10 text-slate-600";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  const getRoleLabel = (role: UserAccount["role"]) => {
    switch (role) {
      case "user": return "Customer";
      case "staff": return "General Staff";
      case "rider": return "Rider";
      case "manager": return "Manager";
      case "admin": return "Admin";
      default: return role;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-500/10 text-green-500";
      case "Suspended": return "bg-red-500/10 text-red-500";
      case "Pending": return "bg-yellow-500/10 text-yellow-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <div className="space-y-8">
      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-dark/60 backdrop-blur-sm" />
            <motion.form
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              onSubmit={saveUser}
              className="relative w-full max-w-2xl rounded-[2.5rem] bg-white p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-3xl font-bold text-dark">{editing ? "Edit User" : "Add User"}</h3>
                <button type="button" onClick={() => setShowModal(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-muted hover:bg-red-500 hover:text-white transition">
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none" placeholder="Full name" required />
                <input value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none" placeholder="Email" type="email" required disabled={!!editing} />
                <input value={form.password} onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none" placeholder={editing ? "Set new password (optional)" : "Temporary password"} type="text" />
                <select value={form.role} onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value as any }))} className="rounded-2xl bg-surface px-5 py-4 outline-none">
                  <option value="user">User (Customer)</option>
                  <option value="staff">General Staff</option>
                  <option value="rider">Rider</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
                <select value={form.status} onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as any }))} className="rounded-2xl bg-surface px-5 py-4 outline-none">
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Pending">Pending</option>
                </select>
                <input value={form.phone} onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none" placeholder="Phone number" />
                <select value={form.shift} onChange={(e) => setForm(prev => ({ ...prev, shift: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none">
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
                <input value={form.department} onChange={(e) => setForm(prev => ({ ...prev, department: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none" placeholder="Department" />
                <input value={form.salary} onChange={(e) => setForm(prev => ({ ...prev, salary: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none" placeholder="Salary" type="number" min="0" />
                <input value={form.emergencyContact} onChange={(e) => setForm(prev => ({ ...prev, emergencyContact: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none" placeholder="Emergency contact" />
                <input value={form.address} onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))} className="rounded-2xl bg-surface px-5 py-4 outline-none md:col-span-2" placeholder="Address" />
              </div>

              {error && <p className="mt-4 text-sm font-medium text-red-500">{error}</p>}

              <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-full border border-gray-200 px-6 py-3 font-bold text-muted hover:bg-surface transition">Cancel</button>
                <button type="submit" disabled={saving} className="rounded-full bg-primary px-7 py-3 font-bold text-white hover:bg-primary-strong transition disabled:opacity-50">{saving ? "Saving..." : editing ? "Update" : "Create"}</button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Users size={24} /></div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Total Users</p>
          <p className="text-2xl font-display font-bold text-dark">{stats.total}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500"><Shield size={24} /></div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Admins</p>
          <p className="text-2xl font-display font-bold text-dark">{stats.admins}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500"><Users size={24} /></div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Managers</p>
          <p className="text-2xl font-display font-bold text-dark">{stats.managers}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500"><Users size={24} /></div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Staff</p>
          <p className="text-2xl font-display font-bold text-dark">{stats.staff}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-500/10 text-slate-600"><Clock size={24} /></div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Customers</p>
          <p className="text-2xl font-display font-bold text-dark">{stats.customers}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-500"><CheckCircle size={24} /></div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Active</p>
          <p className="text-2xl font-display font-bold text-dark">{stats.active}</p>
        </motion.div>
      </div>

      {/* Users Table */}
      <div className="rounded-[3rem] border border-gray-50 bg-white p-10 shadow-xl shadow-dark/5">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-dark">User & Role Management</h2>
            <p className="mt-1 text-sm text-muted">Create real logins for admin, manager, rider, general staff, and customer accounts.</p>
          </div>

          <div className="flex w-full flex-wrap gap-4 md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-xl bg-surface py-3 pr-4 pl-12 text-sm outline-none" />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-xl bg-surface px-4 py-3 text-sm font-bold outline-none">
              <option value="All">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="rider">Rider</option>
              <option value="staff">General Staff</option>
              <option value="user">Customer</option>
            </select>
            <button onClick={fetchUsers} className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-strong text-dark transition hover:bg-primary hover:text-white">
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-strong transition">
              <UserPlus size={20} />
              Add User
            </button>
          </div>
        </div>

        {error && <p className="mb-4 text-sm font-medium text-red-500">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-bold uppercase tracking-widest text-muted">
                <th className="pb-6">User</th>
                <th className="pb-6">Role</th>
                <th className="pb-6">Linked Profile</th>
                <th className="pb-6">Status</th>
                <th className="pb-6">Phone</th>
                <th className="pb-6">Member Since</th>
                <th className="pb-6">Last Login</th>
                <th className="pb-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-surface transition-colors">
                  <td className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-strong font-bold text-dark">{user.avatarInitials}</div>
                      <div>
                        <span className="block font-bold text-dark">{user.name}</span>
                        <span className="text-xs text-muted">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-6">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${getRoleBadgeColor(user.role)}`}>{getRoleLabel(user.role)}</span>
                  </td>
                  <td className="py-6">
                    {user.linkedProfile ? (
                      <div>
                        <p className="text-sm font-bold text-dark">{user.linkedProfile.type === "staff" ? user.linkedProfile.title || "Staff Profile" : "Customer Profile"}</p>
                        <p className="text-xs text-muted">
                          {user.linkedProfile.type === "staff"
                            ? `${user.linkedProfile.department || "Ops"} | ${user.linkedProfile.shift || "Shift"}`
                            : `${user.linkedProfile.city || "Renala Khurd"} | ${user.linkedProfile.orderCount || 0} orders`}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-muted">Not linked</span>
                    )}
                  </td>
                  <td className="py-6">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusBadgeColor(user.status)}`}>{user.status}</span>
                  </td>
                  <td className="py-6 text-sm text-muted">{user.phone || "N/A"}</td>
                  <td className="py-6 text-sm text-dark">{user.memberSince}</td>
                  <td className="py-6 text-sm text-muted">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}</td>
                  <td className="py-6">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(user)} className="rounded-lg bg-surface-strong p-2 text-dark transition hover:bg-primary hover:text-white">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => deleteUser(user.id)} className="rounded-lg bg-surface-strong p-2 text-dark transition hover:bg-red-500 hover:text-white">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredUsers.length === 0 && <div className="p-10 text-center text-muted">No users found.</div>}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
