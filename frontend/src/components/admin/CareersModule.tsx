import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Briefcase,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Plus,
  Trash2,
  Search,
} from "lucide-react";

const STATUS_STYLES = {
  Pending: "bg-yellow-500/10 text-yellow-600",
  Reviewing: "bg-blue-500/10 text-blue-600",
  Approved: "bg-green-500/10 text-green-600",
  Rejected: "bg-red-500/10 text-red-600",
};

const emptyOpening = {
  title: "",
  department: "Kitchen",
  type: "Full-time",
  location: "Renala Khurd",
  salaryRange: "",
  description: "",
  requirements: "",
};

const CareersModule = ({ focusApplicationId }: { focusApplicationId?: string } = {}) => {
  const [tab, setTab] = useState("applications");

  const [applications, setApplications] = useState([]);
  const [metrics, setMetrics] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [openings, setOpenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [banner, setBanner] = useState(null);
  const [busyId, setBusyId] = useState("");
  const [showOpeningForm, setShowOpeningForm] = useState(false);
  const [openingForm, setOpeningForm] = useState(emptyOpening);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [appsRes, openingsRes] = await Promise.all([
        fetch("/api/careers/applications"),
        fetch("/api/careers/openings?all=1"),
      ]);
      if (appsRes.ok) {
        const data = await appsRes.json();
        setApplications(data.applications ?? []);
        setMetrics(data.metrics ?? { total: 0, pending: 0, approved: 0, rejected: 0 });
      }
      if (openingsRes.ok) {
        setOpenings(await openingsRes.json());
      }
    } catch (error) {
      console.error("Failed to load careers data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAll();
  }, []);

  useEffect(() => {
    if (!focusApplicationId) return;

    setTab("applications");
    setStatusFilter("All");
    setSearch(focusApplicationId);
  }, [focusApplicationId]);

  const decide = async (application, status) => {
    const note = window.prompt(
      status === "Approved"
        ? "Optional note to include in the approval email:"
        : "Optional reason to include in the rejection email:",
      "",
    );
    if (note === null) return; // cancelled

    setBusyId(application.id);
    setBanner(null);
    try {
      const res = await fetch(`/api/careers/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, decisionNote: note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBanner({ type: "error", message: data?.message || "Could not update the application." });
        return;
      }
      const delivered = data?.emailResult?.delivered ?? 0;
      const skipped = data?.emailResult?.skipped;
      setBanner({
        type: "success",
        message: skipped
          ? `Application ${status.toLowerCase()}. (Email skipped — Resend not configured.)`
          : `Application ${status.toLowerCase()} and ${delivered ? "decision email sent" : "email attempted"} to ${application.email}.`,
      });
      await fetchAll();
    } catch (error) {
      console.error(error);
      setBanner({ type: "error", message: "Could not update the application." });
    } finally {
      setBusyId("");
    }
  };

  const createOpening = async (event) => {
    event.preventDefault();
    if (openingForm.title.trim().length < 2) return;
    try {
      const res = await fetch("/api/careers/openings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...openingForm,
          requirements: openingForm.requirements
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
        }),
      });
      if (res.ok) {
        setOpeningForm(emptyOpening);
        setShowOpeningForm(false);
        await fetchAll();
      }
    } catch (error) {
      console.error("Could not create opening", error);
    }
  };

  const toggleOpening = async (opening) => {
    await fetch(`/api/careers/openings/${opening.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: opening.status === "Open" ? "Closed" : "Open" }),
    });
    await fetchAll();
  };

  const deleteOpening = async (opening) => {
    if (!window.confirm(`Delete the "${opening.title}" opening?`)) return;
    await fetch(`/api/careers/openings/${opening.id}`, { method: "DELETE" });
    await fetchAll();
  };

  const filteredApps = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((app) => {
      if (statusFilter !== "All" && app.status !== statusFilter) return false;
      if (!q) return true;
      return `${app.id} ${app.name} ${app.email} ${app.jobTitle}`.toLowerCase().includes(q);
    });
  }, [applications, search, statusFilter]);

  const kpis = [
    { label: "Total Applications", value: metrics.total, icon: <Users size={22} />, color: "bg-blue-500/10 text-blue-500" },
    { label: "Pending Review", value: metrics.pending, icon: <Clock size={22} />, color: "bg-yellow-500/10 text-yellow-500" },
    { label: "Approved", value: metrics.approved, icon: <CheckCircle size={22} />, color: "bg-green-500/10 text-green-500" },
    { label: "Rejected", value: metrics.rejected, icon: <XCircle size={22} />, color: "bg-red-500/10 text-red-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-dark flex items-center gap-3">
            <Briefcase className="text-primary" /> Careers
          </h2>
          <p className="text-muted">Review job applications and manage open positions.</p>
        </div>
        <div className="flex gap-2 rounded-2xl bg-surface p-1">
          {["applications", "openings"].map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition ${
                tab === key ? "bg-white text-primary shadow-sm" : "text-muted hover:text-dark"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {banner && (
        <div
          className={`rounded-2xl border p-4 text-sm font-medium ${
            banner.type === "success" ? "border-green-100 bg-green-50 text-green-700" : "border-red-100 bg-red-50 text-red-600"
          }`}
        >
          {banner.message}
        </div>
      )}

      {tab === "applications" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {kpis.map((kpi) => (
              <motion.div key={kpi.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${kpi.color}`}>{kpi.icon}</div>
                <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">{kpi.label}</p>
                <p className="text-2xl font-display font-bold text-dark">{kpi.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-dark/5 border border-gray-50 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, role…"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary/20 text-sm"
                />
              </div>
              <div className="flex gap-2">
                {["All", "Pending", "Approved", "Rejected"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      statusFilter === status ? "bg-primary text-white" : "bg-surface text-muted hover:text-dark"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="p-10 text-center text-muted">Loading applications…</div>
            ) : filteredApps.length === 0 ? (
              <div className="p-10 text-center text-muted">No applications yet.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredApps.map((app) => (
                  <div key={app.id} className="p-6 flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-dark">{app.name}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${STATUS_STYLES[app.status] ?? "bg-surface text-muted"}`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-primary mt-1">{app.jobTitle}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-muted mt-2">
                        <span className="inline-flex items-center gap-1"><Mail size={13} /> {app.email}</span>
                        {app.phone ? <span className="inline-flex items-center gap-1"><Phone size={13} /> {app.phone}</span> : null}
                        {app.experience ? <span>Exp: {app.experience}</span> : null}
                      </div>
                      {app.coverLetter ? <p className="text-sm text-dark/70 mt-2 line-clamp-2">{app.coverLetter}</p> : null}
                      {app.resumeUrl ? (
                        <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-primary hover:underline mt-1 inline-block">View resume →</a>
                      ) : null}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        disabled={busyId === app.id || app.status === "Approved"}
                        onClick={() => decide(app, "Approved")}
                        className="px-4 py-2 rounded-xl bg-green-500/10 text-green-600 font-bold text-sm hover:bg-green-500 hover:text-white transition disabled:opacity-40"
                      >
                        Approve
                      </button>
                      <button
                        disabled={busyId === app.id || app.status === "Rejected"}
                        onClick={() => decide(app, "Rejected")}
                        className="px-4 py-2 rounded-xl bg-red-500/10 text-red-600 font-bold text-sm hover:bg-red-500 hover:text-white transition disabled:opacity-40"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === "openings" && (
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-dark/5 border border-gray-50 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-dark">Job Openings</h3>
            <button
              onClick={() => setShowOpeningForm((v) => !v)}
              className="px-5 py-3 rounded-xl bg-primary text-white font-bold flex items-center gap-2 hover:bg-primary-strong transition"
            >
              <Plus size={18} /> New Opening
            </button>
          </div>

          {showOpeningForm && (
            <form onSubmit={createOpening} className="p-6 border-b border-gray-100 grid gap-4 sm:grid-cols-2 bg-surface/50">
              <input required value={openingForm.title} onChange={(e) => setOpeningForm({ ...openingForm, title: e.target.value })} placeholder="Job title" className="rounded-xl bg-white border border-gray-100 px-4 py-3 text-sm" />
              <input value={openingForm.department} onChange={(e) => setOpeningForm({ ...openingForm, department: e.target.value })} placeholder="Department" className="rounded-xl bg-white border border-gray-100 px-4 py-3 text-sm" />
              <select value={openingForm.type} onChange={(e) => setOpeningForm({ ...openingForm, type: e.target.value })} className="rounded-xl bg-white border border-gray-100 px-4 py-3 text-sm">
                {["Full-time", "Part-time", "Contract", "Internship"].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input value={openingForm.location} onChange={(e) => setOpeningForm({ ...openingForm, location: e.target.value })} placeholder="Location" className="rounded-xl bg-white border border-gray-100 px-4 py-3 text-sm" />
              <input value={openingForm.salaryRange} onChange={(e) => setOpeningForm({ ...openingForm, salaryRange: e.target.value })} placeholder="Salary range (optional)" className="rounded-xl bg-white border border-gray-100 px-4 py-3 text-sm sm:col-span-2" />
              <textarea value={openingForm.description} onChange={(e) => setOpeningForm({ ...openingForm, description: e.target.value })} placeholder="Short description" rows={2} className="rounded-xl bg-white border border-gray-100 px-4 py-3 text-sm sm:col-span-2" />
              <textarea value={openingForm.requirements} onChange={(e) => setOpeningForm({ ...openingForm, requirements: e.target.value })} placeholder="Requirements (one per line)" rows={3} className="rounded-xl bg-white border border-gray-100 px-4 py-3 text-sm sm:col-span-2" />
              <button type="submit" className="rounded-xl bg-primary text-white font-bold py-3 sm:col-span-2">Create Opening</button>
            </form>
          )}

          {loading ? (
            <div className="p-10 text-center text-muted">Loading openings…</div>
          ) : openings.length === 0 ? (
            <div className="p-10 text-center text-muted">No openings yet — create one above.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {openings.map((opening) => (
                <div key={opening.id} className="p-6 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-dark">{opening.title}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${opening.status === "Open" ? "bg-green-500/10 text-green-600" : "bg-surface text-muted"}`}>
                        {opening.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-1">{opening.department} · {opening.type} · {opening.location}{opening.salaryRange ? ` · ${opening.salaryRange}` : ""}</p>
                  </div>
                  <button onClick={() => toggleOpening(opening)} className="px-4 py-2 rounded-xl bg-surface text-dark text-sm font-bold hover:bg-surface-strong transition">
                    {opening.status === "Open" ? "Close" : "Reopen"}
                  </button>
                  <button onClick={() => deleteOpening(opening)} className="p-2 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition" aria-label="Delete opening">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CareersModule;
