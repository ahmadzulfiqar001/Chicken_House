import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Bell,
  Calendar,
  ClipboardCheck,
  Clock3,
  FileText,
  LogOut,
  Send,
  ShieldAlert,
  User,
  Route,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

type AttendanceRecord = {
  id: string;
  date: string;
  clockIn: string;
  clockOut: string;
  status: string;
  workHours: number;
  adminApproval?: string;
};

type LeaveRecord = {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
};

type ShiftRecord = {
  id: string;
  date: string;
  shiftType: string;
  startTime: string;
  endTime: string;
  notes?: string;
};

type TaskRecord = {
  id: string;
  title: string;
  status: string;
  subtitle: string;
};

type RequestRecord = {
  id: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  targetDate?: string;
};

type NoticeRecord = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  seen: boolean;
};

type SummaryPayload = {
  roleLabel: string;
  staff: {
    id: number;
    name: string;
    role: string;
    shift: string;
    phone?: string;
    email?: string;
    salary?: number;
    joinDate: string;
    address?: string;
    emergencyContact?: string;
    department?: string;
    leaveBalance?: number;
    performanceScore?: number;
  };
  todayAttendance: AttendanceRecord | null;
  attendanceStats: {
    totalRecords: number;
    lateCount: number;
    absentCount: number;
    presentCount: number;
  };
  pendingLeaveCount: number;
  currentShift: ShiftRecord | null;
  latestPayroll: {
    month: string;
    year: number;
    netSalary: number;
    deductions: number;
    bonus: number;
    status: string;
  } | null;
  latestPerformance: {
    reviewPeriod: string;
    overallScore: number;
    strengths: string;
    improvements: string;
  } | null;
  notices: NoticeRecord[];
  requests: RequestRecord[];
  tasks: TaskRecord[];
  activity: Array<{
    id: string;
    action: string;
    detail: string;
    createdAt: string;
  }>;
};

type WorkspaceTab =
  | "dashboard"
  | "attendance"
  | "leave"
  | "schedule"
  | "tasks"
  | "requests"
  | "notices"
  | "profile";

type ProfileFormState = {
  name: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: string;
};

type SnackbarState = {
  tone: "success" | "error";
  message: string;
};

const taskLabelByRole: Record<string, string> = {
  rider: "My Deliveries",
  staff: "My Tasks",
  manager: "My Tasks",
};

const tabIconByRole: Record<string, ReactNode> = {
  rider: <Route size={18} />,
  staff: <ClipboardCheck size={18} />,
  manager: <ClipboardCheck size={18} />,
};

const StaffWorkspace = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const currentRole = user?.role ?? "staff";
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("dashboard");
  const [summary, setSummary] = useState<SummaryPayload | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "Casual",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [requestForm, setRequestForm] = useState({
    category: "Duty Issue",
    subject: "",
    message: "",
  });
  const [correctionForm, setCorrectionForm] = useState({
    targetDate: "",
    subject: "Attendance correction request",
    message: "",
  });
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    name: "",
    email: "",
    phone: "",
    address: "",
    emergencyContact: "",
  });

  const tabs = useMemo(() => {
    const taskLabel = taskLabelByRole[currentRole] ?? "My Tasks";
    const roleTaskIcon = tabIconByRole[currentRole] ?? <ClipboardCheck size={18} />;

    return [
      { id: "dashboard", label: "Dashboard", icon: <ClipboardCheck size={18} /> },
      { id: "attendance", label: "My Attendance", icon: <Clock3 size={18} /> },
      { id: "leave", label: "Apply Leave", icon: <Calendar size={18} /> },
      { id: "schedule", label: "My Schedule", icon: <Calendar size={18} /> },
      { id: "tasks", label: taskLabel, icon: roleTaskIcon },
      { id: "requests", label: "Requests", icon: <Send size={18} /> },
      { id: "notices", label: "Notices", icon: <Bell size={18} /> },
      { id: "profile", label: "My Profile", icon: <User size={18} /> },
    ] as Array<{ id: WorkspaceTab; label: string; icon: ReactNode }>;
  }, [currentRole]);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [summaryRes, attendanceRes, leavesRes, shiftsRes, requestsRes, noticesRes] =
        await Promise.all([
          fetch("/api/staff-panel/summary"),
          fetch("/api/staff-panel/attendance"),
          fetch("/api/staff-panel/leaves"),
          fetch("/api/staff-panel/shifts"),
          fetch("/api/staff-panel/requests"),
          fetch("/api/staff-panel/notices"),
        ]);

      const responses = [summaryRes, attendanceRes, leavesRes, shiftsRes, requestsRes, noticesRes];
      const failed = responses.find((response) => !response.ok);

      if (failed) {
        throw new Error("Staff panel data could not be loaded.");
      }

      const [summaryData, attendanceData, leavesData, shiftsData, requestsData, noticesData] =
        await Promise.all(responses.map((response) => response.json()));

      setSummary(summaryData);
      setAttendance(attendanceData);
      setLeaves(leavesData);
      setShifts(shiftsData);
      setRequests(requestsData);
      setNotices(noticesData);
    } catch (loadError) {
      console.error(loadError);
      setError("Staff workspace is not loading right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (!summary) return;

    setProfileForm({
      name: summary.staff.name ?? "",
      email: summary.staff.email ?? "",
      phone: summary.staff.phone ?? "",
      address: summary.staff.address ?? "",
      emergencyContact: summary.staff.emergencyContact ?? "",
    });
  }, [summary]);

  useEffect(() => {
    if (!snackbar) return;

    const timeout = window.setTimeout(() => setSnackbar(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [snackbar]);

  const postAction = async (
    url: string,
    options?: RequestInit,
    successMessage?: string | ((data: Record<string, unknown>) => string),
  ) => {
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(url, options);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(String(data.message ?? "Action failed."));
      }

      await loadData();
      const nextMessage =
        typeof successMessage === "function"
          ? successMessage(data)
          : successMessage ?? String(data.message ?? "Action completed successfully.");
      setSnackbar({ tone: "success", message: nextMessage });
      return data;
    } catch (actionError) {
      console.error(actionError);
      const nextError = actionError instanceof Error ? actionError.message : "Action failed.";
      setError(nextError);
      setSnackbar({ tone: "error", message: nextError });
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeaveSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await postAction("/api/staff-panel/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leaveForm),
    }, "Leave request sent to admin.");

    if (result) {
      setLeaveForm({ leaveType: "Casual", startDate: "", endDate: "", reason: "" });
    }
  };

  const handleRequestSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await postAction("/api/staff-panel/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestForm),
    }, "Your request was sent to admin.");

    if (result) {
      setRequestForm({ category: "Duty Issue", subject: "", message: "" });
    }
  };

  const handleCorrectionSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await postAction("/api/staff-panel/attendance/corrections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(correctionForm),
    }, "Attendance correction request sent to admin.");

    if (result) {
      setCorrectionForm({ targetDate: "", subject: "Attendance correction request", message: "" });
    }
  };

  const handleProfileSave = async (event: FormEvent) => {
    event.preventDefault();
    const result = await postAction("/api/staff-panel/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileForm),
    }, "Profile updated successfully.");

    if (result) {
      await refreshUser();
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-surface pt-40 text-center text-muted">Loading staff workspace...</div>;
  }

  if (!summary) {
    return <div className="min-h-screen bg-surface pt-40 text-center text-muted">{error || "Unable to open staff workspace."}</div>;
  }

  return (
    <div className="min-h-screen bg-surface flex">
      <aside className="fixed inset-y-0 left-0 z-40 w-[18rem] border-r border-white/10 bg-dark px-5 py-6 text-white shadow-2xl">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="Chicken House" className="h-12 w-12 rounded-2xl object-cover border border-white/10" />
          <div>
            <p className="text-lg font-display font-bold">Staff Panel</p>
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">{summary.roleLabel}</p>
          </div>
        </div>

        <div className="mt-8 rounded-[1.8rem] border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-bold">{summary.staff.name}</p>
          <p className="mt-1 text-xs text-white/60">{summary.staff.role}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.24em] text-white/35">Shift</p>
          <p className="mt-1 text-sm font-bold">{summary.staff.shift}</p>
        </div>

        <nav className="mt-8 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-white/65 hover:bg-white/8 hover:text-white"
              }`}
            >
              {tab.icon}
              <span className="text-sm font-bold">{tab.label}</span>
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => {
            void logout();
            navigate("/login");
          }}
          className="mt-8 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-white/65 transition-all hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={18} />
          <span className="text-sm font-bold">Logout</span>
        </button>
      </aside>

      <main className="ml-[18rem] flex-1 p-8">
        {snackbar ? (
          <div className="fixed right-6 top-6 z-[70] max-w-sm rounded-[1.5rem] border border-white/70 bg-white px-5 py-4 shadow-2xl shadow-dark/15">
            <p className={`text-sm font-bold ${snackbar.tone === "success" ? "text-green-700" : "text-red-700"}`}>
              {snackbar.tone === "success" ? "Action completed" : "Action blocked"}
            </p>
            <p className="mt-1 text-sm text-dark">{snackbar.message}</p>
          </div>
        ) : null}

        <header className="sticky top-0 z-20 mb-8 rounded-[2rem] border border-gray-100 bg-white/85 px-6 py-5 shadow-lg shadow-dark/5 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">{summary.roleLabel}</p>
              <h1 className="mt-2 text-3xl font-display font-bold text-dark">{tabs.find((tab) => tab.id === activeTab)?.label}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-surface px-4 py-3 text-sm font-bold text-dark">
                Today: {summary.todayAttendance ? `${summary.todayAttendance.status} at ${summary.todayAttendance.clockIn}` : "Attendance not marked"}
              </span>
              {!summary.todayAttendance ? (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    void postAction(
                      "/api/staff-panel/attendance/mark",
                      { method: "POST" },
                      (data) => `Attendance marked at ${String(data.clockIn ?? "now")}.`,
                    )
                  }
                  className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-strong disabled:opacity-70"
                >
                  Mark Today Attendance
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="rounded-full bg-gray-100 px-5 py-3 text-sm font-bold text-gray-500"
                >
                  Attendance Already Marked
                </button>
              )}
            </div>
          </div>
          {error ? (
            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}
        </header>

        {activeTab === "dashboard" ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Today Attendance", value: summary.todayAttendance?.status ?? "Pending", icon: <Clock3 size={20} /> },
                { label: "Duty Timing", value: summary.currentShift ? `${summary.currentShift.startTime || "--"} - ${summary.currentShift.endTime || "--"}` : "Not assigned", icon: <Calendar size={20} /> },
                { label: "Pending Leaves", value: String(summary.pendingLeaveCount), icon: <FileText size={20} /> },
                { label: "Assigned Work", value: String(summary.tasks.length), icon: <ClipboardCheck size={20} /> },
              ].map((card) => (
                <div key={card.label} className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-xl shadow-dark/5">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">{card.icon}</div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">{card.label}</p>
                  <p className="mt-2 text-2xl font-display font-bold text-dark">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-dark">Assigned Work</h2>
                  <span className="rounded-full bg-surface px-4 py-2 text-xs font-bold text-primary">{summary.tasks.length} items</span>
                </div>
                <div className="mt-6 space-y-4">
                  {summary.tasks.map((task) => (
                    <div key={task.id} className="rounded-[1.7rem] border border-gray-100 bg-surface/70 px-5 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-bold text-dark">{task.title}</p>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-primary">{task.status}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted">{task.subtitle}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5">
                  <h2 className="text-xl font-bold text-dark">Notices</h2>
                  <div className="mt-6 space-y-4">
                    {summary.notices.slice(0, 3).map((notice) => (
                      <div key={notice.id} className="rounded-[1.6rem] bg-surface px-4 py-4">
                        <p className="font-bold text-dark">{notice.title}</p>
                        <p className="mt-2 text-sm text-muted">{notice.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {summary.latestPayroll ? (
                  <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5">
                    <h2 className="text-xl font-bold text-dark">Salary Snapshot</h2>
                    <p className="mt-4 text-sm text-muted">{summary.latestPayroll.month} {summary.latestPayroll.year}</p>
                    <p className="mt-2 text-3xl font-display font-bold text-primary">Rs. {summary.latestPayroll.netSalary.toLocaleString()}</p>
                    <p className="mt-3 text-sm text-muted">Deductions: Rs. {summary.latestPayroll.deductions.toLocaleString()} | Bonus: Rs. {summary.latestPayroll.bonus.toLocaleString()}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "attendance" ? (
          <div className="grid gap-8 xl:grid-cols-[1fr_0.85fr]">
            <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5">
              <h2 className="text-xl font-bold text-dark">Attendance History</h2>
              <div className="mt-6 space-y-4">
                {attendance.map((record) => (
                  <div key={record.id} className="rounded-[1.6rem] border border-gray-100 px-5 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-dark">{record.date}</p>
                        <p className="mt-1 text-sm text-muted">
                          Check-in {record.clockIn || "--"} | Check-out {record.clockOut || "--"}
                        </p>
                      </div>
                      <span className="rounded-full bg-surface px-3 py-2 text-xs font-bold text-primary">{record.status}</span>
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.22em] text-muted">
                      {record.adminApproval ?? "Locked after submission"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleCorrectionSubmit} className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5">
              <h2 className="text-xl font-bold text-dark">Attendance Correction Request</h2>
              <p className="mt-3 text-sm text-muted">Attendance once submitted stays locked. If something is wrong, send a correction request to admin.</p>
              <div className="mt-6 space-y-4">
                <input
                  type="date"
                  value={correctionForm.targetDate}
                  onChange={(event) => setCorrectionForm((current) => ({ ...current, targetDate: event.target.value }))}
                  className="w-full rounded-2xl bg-surface px-4 py-4 outline-none"
                />
                <input
                  type="text"
                  value={correctionForm.subject}
                  onChange={(event) => setCorrectionForm((current) => ({ ...current, subject: event.target.value }))}
                  className="w-full rounded-2xl bg-surface px-4 py-4 outline-none"
                />
                <textarea
                  rows={5}
                  value={correctionForm.message}
                  onChange={(event) => setCorrectionForm((current) => ({ ...current, message: event.target.value }))}
                  className="w-full resize-none rounded-2xl bg-surface px-4 py-4 outline-none"
                  placeholder="Explain what was wrong in the marked attendance..."
                />
                <button type="submit" disabled={submitting} className="w-full rounded-2xl bg-primary px-5 py-4 font-bold text-white transition hover:bg-primary-strong disabled:opacity-70">
                  Send Correction Request
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {activeTab === "leave" ? (
          <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
            <form onSubmit={handleLeaveSubmit} className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5">
              <h2 className="text-xl font-bold text-dark">Apply Leave</h2>
              <div className="mt-6 space-y-4">
                <select
                  value={leaveForm.leaveType}
                  onChange={(event) => setLeaveForm((current) => ({ ...current, leaveType: event.target.value }))}
                  className="w-full rounded-2xl bg-surface px-4 py-4 outline-none"
                >
                  <option value="Sick">Sick</option>
                  <option value="Casual">Casual</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Half Day">Half Day</option>
                </select>
                <input type="date" value={leaveForm.startDate} onChange={(event) => setLeaveForm((current) => ({ ...current, startDate: event.target.value }))} className="w-full rounded-2xl bg-surface px-4 py-4 outline-none" />
                <input type="date" value={leaveForm.endDate} onChange={(event) => setLeaveForm((current) => ({ ...current, endDate: event.target.value }))} className="w-full rounded-2xl bg-surface px-4 py-4 outline-none" />
                <textarea rows={5} value={leaveForm.reason} onChange={(event) => setLeaveForm((current) => ({ ...current, reason: event.target.value }))} className="w-full resize-none rounded-2xl bg-surface px-4 py-4 outline-none" placeholder="Reason for leave..." />
                <button type="submit" disabled={submitting} className="w-full rounded-2xl bg-primary px-5 py-4 font-bold text-white transition hover:bg-primary-strong disabled:opacity-70">
                  Submit Leave Request
                </button>
              </div>
            </form>

            <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5">
              <h2 className="text-xl font-bold text-dark">Leave History</h2>
              <div className="mt-6 space-y-4">
                {leaves.map((leave) => (
                  <div key={leave.id} className="rounded-[1.6rem] border border-gray-100 px-5 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-dark">{leave.leaveType}</p>
                        <p className="mt-1 text-sm text-muted">{leave.startDate} to {leave.endDate} | {leave.days} day(s)</p>
                      </div>
                      <span className="rounded-full bg-surface px-3 py-2 text-xs font-bold text-primary">{leave.status}</span>
                    </div>
                    <p className="mt-3 text-sm text-muted">{leave.reason}</p>
                    {leave.status === "Pending" ? (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() =>
                          void postAction(
                            `/api/staff-panel/leaves/${leave.id}`,
                            { method: "DELETE" },
                            "Pending leave request cancelled.",
                          )
                        }
                        className="mt-4 rounded-full bg-red-50 px-4 py-2 text-xs font-bold text-red-600"
                      >
                        Cancel Pending Leave
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "schedule" ? (
          <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5">
            <h2 className="text-xl font-bold text-dark">My Duty Schedule</h2>
            <div className="mt-6 space-y-4">
              {shifts.map((shift) => (
                <div key={shift.id} className="rounded-[1.6rem] border border-gray-100 px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-dark">{shift.shiftType}</p>
                      <p className="mt-1 text-sm text-muted">{shift.date}</p>
                    </div>
                    <span className="rounded-full bg-surface px-4 py-2 text-xs font-bold text-primary">
                      {shift.startTime || "--"} - {shift.endTime || "--"}
                    </span>
                  </div>
                  {shift.notes ? <p className="mt-3 text-sm text-muted">{shift.notes}</p> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === "tasks" ? (
          <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5">
            <h2 className="text-xl font-bold text-dark">{taskLabelByRole[currentRole] ?? "My Tasks"}</h2>
            <div className="mt-6 space-y-4">
              {summary.tasks.map((task) => (
                <div key={task.id} className="rounded-[1.6rem] border border-gray-100 px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-dark">{task.title}</p>
                      <p className="mt-1 text-sm text-muted">{task.subtitle}</p>
                    </div>
                    <span className="rounded-full bg-surface px-4 py-2 text-xs font-bold text-primary">{task.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === "requests" ? (
          <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
            <form onSubmit={handleRequestSubmit} className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5">
              <h2 className="text-xl font-bold text-dark">Complaints / Requests</h2>
              <div className="mt-6 space-y-4">
                <select value={requestForm.category} onChange={(event) => setRequestForm((current) => ({ ...current, category: event.target.value }))} className="w-full rounded-2xl bg-surface px-4 py-4 outline-none">
                  <option>Salary Issue</option>
                  <option>Duty Issue</option>
                  <option>Shift Change</option>
                  <option>Equipment Problem</option>
                  <option>Leave Issue</option>
                  <option>Attendance Correction</option>
                  <option>Work Complaint</option>
                </select>
                <input type="text" value={requestForm.subject} onChange={(event) => setRequestForm((current) => ({ ...current, subject: event.target.value }))} className="w-full rounded-2xl bg-surface px-4 py-4 outline-none" placeholder="Subject" />
                <textarea rows={5} value={requestForm.message} onChange={(event) => setRequestForm((current) => ({ ...current, message: event.target.value }))} className="w-full resize-none rounded-2xl bg-surface px-4 py-4 outline-none" placeholder="Explain your request..." />
                <button type="submit" disabled={submitting} className="w-full rounded-2xl bg-primary px-5 py-4 font-bold text-white transition hover:bg-primary-strong disabled:opacity-70">
                  Submit Request
                </button>
              </div>
            </form>

            <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5">
              <h2 className="text-xl font-bold text-dark">Request History</h2>
              <div className="mt-6 space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="rounded-[1.6rem] border border-gray-100 px-5 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-dark">{request.subject}</p>
                        <p className="mt-1 text-sm text-muted">{request.category}</p>
                      </div>
                      <span className="rounded-full bg-surface px-4 py-2 text-xs font-bold text-primary">{request.status}</span>
                    </div>
                    <p className="mt-3 text-sm text-muted">{request.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "notices" ? (
          <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5">
            <h2 className="text-xl font-bold text-dark">Notices / Announcements</h2>
            <div className="mt-6 space-y-4">
              {notices.map((notice) => (
                <div key={notice.id} className="rounded-[1.8rem] border border-gray-100 px-5 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-dark">{notice.title}</p>
                      <p className="mt-2 text-sm leading-7 text-muted">{notice.message}</p>
                    </div>
                    {!notice.seen ? (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() =>
                          void postAction(
                            `/api/staff-panel/notices/${notice.id}/seen`,
                            { method: "POST" },
                            "Notice marked as seen.",
                          )
                        }
                        className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-white"
                      >
                        Mark Seen
                      </button>
                    ) : (
                      <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-bold text-green-700">Seen</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === "profile" ? (
          <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
            <form onSubmit={handleProfileSave} className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5">
              <h2 className="text-xl font-bold text-dark">Edit My Profile</h2>
              <p className="mt-3 text-sm text-muted">Name, email, phone, address, and emergency contact can now be updated directly from your panel.</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Name", key: "name", type: "text", placeholder: "Enter full name" },
                  { label: "Email", key: "email", type: "email", placeholder: "Enter email address" },
                  { label: "Phone", key: "phone", type: "text", placeholder: "Enter phone number" },
                  { label: "Emergency Contact", key: "emergencyContact", type: "text", placeholder: "Enter emergency contact" },
                ].map((field) => (
                  <label key={field.key} className="block rounded-[1.5rem] bg-surface px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">{field.label}</p>
                    <input
                      type={field.type}
                      value={profileForm[field.key as keyof ProfileFormState]}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }))
                      }
                      placeholder={field.placeholder}
                      className="mt-3 w-full bg-transparent text-sm font-bold text-dark outline-none"
                    />
                  </label>
                ))}
              </div>

              <label className="mt-4 block rounded-[1.5rem] bg-surface px-4 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">Address</p>
                <textarea
                  rows={4}
                  value={profileForm.address}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      address: event.target.value,
                    }))
                  }
                  placeholder="Enter your address"
                  className="mt-3 w-full resize-none bg-transparent text-sm font-bold text-dark outline-none"
                />
              </label>

              <button type="submit" disabled={submitting} className="mt-6 w-full rounded-2xl bg-primary px-5 py-4 font-bold text-white transition hover:bg-primary-strong disabled:opacity-70">
                Save Profile Changes
              </button>
            </form>

            <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5">
              <h2 className="text-xl font-bold text-dark">Profile Summary</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  ["Role", summary.staff.role],
                  ["Joining Date", summary.staff.joinDate],
                  ["Department", summary.staff.department ?? "--"],
                  ["Shift", summary.staff.shift],
                  ["Leave Balance", String(summary.staff.leaveBalance ?? 0)],
                  ["Salary", summary.staff.salary ? `Rs. ${summary.staff.salary.toLocaleString()}` : "--"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[1.5rem] bg-surface px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">{label}</p>
                    <p className="mt-2 text-sm font-bold text-dark">{value}</p>
                  </div>
                ))}
              </div>

              {summary.latestPerformance ? (
                <div className="mt-8 rounded-[1.8rem] border border-gray-100 bg-white px-5 py-5">
                  <div className="flex items-center gap-3 text-primary">
                    <ShieldAlert size={18} />
                    <p className="font-bold">Performance Snapshot</p>
                  </div>
                  <p className="mt-3 text-sm text-muted">{summary.latestPerformance.reviewPeriod}</p>
                  <p className="mt-2 text-2xl font-display font-bold text-dark">{summary.latestPerformance.overallScore.toFixed(1)} / 5</p>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default StaffWorkspace;
