import { FormEvent, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, CheckCircle, Clock, Pencil, RefreshCw, Search, Trash2, UserPlus, Users,
  ClipboardList, DollarSign, CalendarClock, TrendingUp, LogIn, LogOut, FileText,
  Award, X, Filter, Download
} from "lucide-react";

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
  department?: string;
  leaveBalance?: number;
  performanceScore?: number;
};

type Attendance = {
  id: string;
  staffId: number;
  staffName: string;
  date: string;
  clockIn: string;
  clockOut: string;
  status: string;
  workHours: number;
  notes: string;
};

type LeaveRequest = {
  id: string;
  staffId: number;
  staffName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
};

type Payroll = {
  id: string;
  staffId: number;
  staffName: string;
  month: string;
  year: number;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  status: string;
  paidAt?: string;
  paymentMethod: string;
  notes: string;
};

type ShiftSchedule = {
  id: string;
  staffId: number;
  staffName: string;
  date: string;
  shiftType: string;
  startTime: string;
  endTime: string;
  notes: string;
};

type PerformanceReview = {
  id: string;
  staffId: number;
  staffName: string;
  reviewDate: string;
  reviewPeriod: string;
  punctuality: number;
  quality: number;
  teamwork: number;
  communication: number;
  overallScore: number;
  strengths: string;
  improvements: string;
  reviewedBy: string;
  notes: string;
};

const HRManagementComplete = () => {
  const [activeTab, setActiveTab] = useState("staff");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [shifts, setShifts] = useState<ShiftSchedule[]>([]);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [staffRes, attendanceRes, leavesRes, payrollRes, shiftsRes, reviewsRes] = await Promise.all([
        fetch("/api/hr"),
        fetch("/api/attendance"),
        fetch("/api/leaves"),
        fetch("/api/payroll"),
        fetch("/api/shifts"),
        fetch("/api/performance"),
      ]);

      const [staffData, attendanceData, leavesData, payrollData, shiftsData, reviewsData] = await Promise.all([
        staffRes.json(),
        attendanceRes.json(),
        leavesRes.json(),
        payrollRes.json(),
        shiftsRes.json(),
        reviewsRes.json(),
      ]);

      setStaff(staffData);
      setAttendance(attendanceData);
      setLeaves(leavesData);
      setPayroll(payrollData);
      setShifts(shiftsData);
      setReviews(reviewsData);
    } catch (err) {
      console.error(err);
      setError("Failed to load HR data");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: string, staffMember?: StaffMember) => {
    setModalType(type);
    setSelectedStaff(staffMember || null);
    setShowModal(true);
  };

  const handleClockIn = async (staffId: number, staffName: string) => {
    try {
      const res = await fetch("/api/attendance/clock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId, staffName }),
      });
      if (!res.ok) throw new Error("Clock in failed");
      await fetchAllData();
    } catch (err) {
      console.error(err);
      alert("Clock in failed");
    }
  };

  const handleClockOut = async (staffId: number) => {
    try {
      const res = await fetch("/api/attendance/clock-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId }),
      });
      if (!res.ok) throw new Error("Clock out failed");
      await fetchAllData();
    } catch (err) {
      console.error(err);
      alert("Clock out failed");
    }
  };

  const handleLeaveApproval = async (leaveId: string, status: string, approvedBy: string) => {
    try {
      const res = await fetch(`/api/leaves/${leaveId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, approvedBy }),
      });
      if (!res.ok) throw new Error("Leave approval failed");
      await fetchAllData();
    } catch (err) {
      console.error(err);
      alert("Leave approval failed");
    }
  };

  const handlePayrollPay = async (payrollId: string) => {
    try {
      const res = await fetch(`/api/payroll/${payrollId}/pay`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: "Bank Transfer" }),
      });
      if (!res.ok) throw new Error("Payment failed");
      await fetchAllData();
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    }
  };

  const tabs = [
    { id: "staff", label: "Staff Directory", icon: Users },
    { id: "attendance", label: "Attendance", icon: ClipboardList },
    { id: "leaves", label: "Leave Requests", icon: Calendar },
    { id: "payroll", label: "Payroll", icon: DollarSign },
    { id: "shifts", label: "Shift Schedule", icon: CalendarClock },
    { id: "performance", label: "Performance", icon: TrendingUp },
  ];

  const todayAttendance = attendance.filter(a => a.date === new Date().toISOString().slice(0, 10));
  const presentToday = todayAttendance.filter(a => a.status === "Present" || a.status === "Late").length;
  const pendingLeaves = leaves.filter(l => l.status === "Pending").length;
  const pendingPayroll = payroll.filter(p => p.status === "Pending").length;

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Users size={24} /></div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Total Staff</p>
          <p className="text-2xl font-display font-bold text-dark">{staff.length}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-500"><CheckCircle size={24} /></div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Present Today</p>
          <p className="text-2xl font-display font-bold text-dark">{presentToday}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-500"><Calendar size={24} /></div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Pending Leaves</p>
          <p className="text-2xl font-display font-bold text-dark">{pendingLeaves}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500"><DollarSign size={24} /></div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Pending Payroll</p>
          <p className="text-2xl font-display font-bold text-dark">{pendingPayroll}</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="rounded-[3rem] border border-gray-50 bg-white p-10 shadow-xl shadow-dark/5">
        <div className="mb-8 flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 rounded-2xl px-6 py-3 font-bold transition-all ${activeTab === tab.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-surface text-dark hover:bg-surface-strong"}`}>
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {error && <p className="mb-4 text-sm font-medium text-red-500">{error}</p>}

        {/* Staff Directory Tab */}
        {activeTab === "staff" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input type="text" placeholder="Search staff..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-xl bg-surface py-3 pr-4 pl-12 text-sm outline-none" />
              </div>
              <button onClick={fetchAllData} className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-strong text-dark transition hover:bg-primary hover:text-white">
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-bold uppercase tracking-widest text-muted">
                    <th className="pb-6">Employee</th>
                    <th className="pb-6">Role</th>
                    <th className="pb-6">Department</th>
                    <th className="pb-6">Status</th>
                    <th className="pb-6">Salary</th>
                    <th className="pb-6">Leave Balance</th>
                    <th className="pb-6">Performance</th>
                    <th className="pb-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {staff.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((member) => (
                    <tr key={member.id} className="group hover:bg-surface transition-colors">
                      <td className="py-6">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-strong font-bold text-dark">{member.name.split(" ").map((n) => n[0]).join("")}</div>
                          <div>
                            <span className="block font-bold text-dark">{member.name}</span>
                            <span className="text-xs text-muted">{member.email || "No email"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 font-medium text-dark">{member.role}</td>
                      <td className="py-6 text-sm text-muted">{member.department || "N/A"}</td>
                      <td className="py-6">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${member.status === "Active" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>{member.status}</span>
                      </td>
                      <td className="py-6 text-sm font-bold text-dark">Rs. {Number(member.salary ?? 0).toLocaleString()}</td>
                      <td className="py-6 text-sm text-dark">{member.leaveBalance || 0} days</td>
                      <td className="py-6">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 rounded-full bg-surface overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${((member.performanceScore || 0) / 5) * 100}%` }} />
                          </div>
                          <span className="text-xs font-bold">{member.performanceScore?.toFixed(1) || "N/A"}</span>
                        </div>
                      </td>
                      <td className="py-6">
                        <div className="flex gap-2">
                          <button onClick={() => handleClockIn(member.id, member.name)} className="rounded-lg bg-green-500/10 p-2 text-green-500 transition hover:bg-green-500 hover:text-white" title="Clock In">
                            <LogIn size={16} />
                          </button>
                          <button onClick={() => handleClockOut(member.id)} className="rounded-lg bg-red-500/10 p-2 text-red-500 transition hover:bg-red-500 hover:text-white" title="Clock Out">
                            <LogOut size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === "attendance" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-dark">Today's Attendance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-bold uppercase tracking-widest text-muted">
                    <th className="pb-6">Employee</th>
                    <th className="pb-6">Date</th>
                    <th className="pb-6">Clock In</th>
                    <th className="pb-6">Clock Out</th>
                    <th className="pb-6">Work Hours</th>
                    <th className="pb-6">Status</th>
                    <th className="pb-6">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {attendance.slice(0, 20).map((record) => (
                    <tr key={record.id} className="hover:bg-surface transition-colors">
                      <td className="py-6 font-medium text-dark">{record.staffName}</td>
                      <td className="py-6 text-sm text-muted">{record.date}</td>
                      <td className="py-6 text-sm text-dark">{record.clockIn || "N/A"}</td>
                      <td className="py-6 text-sm text-dark">{record.clockOut || "N/A"}</td>
                      <td className="py-6 text-sm font-bold text-dark">{record.workHours.toFixed(2)}h</td>
                      <td className="py-6">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${record.status === "Present" ? "bg-green-500/10 text-green-500" : record.status === "Late" ? "bg-yellow-500/10 text-yellow-500" : record.status === "Absent" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"}`}>{record.status}</span>
                      </td>
                      <td className="py-6 text-sm text-muted">{record.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Leave Requests Tab */}
        {activeTab === "leaves" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-dark">Leave Requests</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-bold uppercase tracking-widest text-muted">
                    <th className="pb-6">Employee</th>
                    <th className="pb-6">Type</th>
                    <th className="pb-6">Start Date</th>
                    <th className="pb-6">End Date</th>
                    <th className="pb-6">Days</th>
                    <th className="pb-6">Reason</th>
                    <th className="pb-6">Status</th>
                    <th className="pb-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {leaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-surface transition-colors">
                      <td className="py-6 font-medium text-dark">{leave.staffName}</td>
                      <td className="py-6 text-sm text-muted">{leave.leaveType}</td>
                      <td className="py-6 text-sm text-dark">{leave.startDate}</td>
                      <td className="py-6 text-sm text-dark">{leave.endDate}</td>
                      <td className="py-6 text-sm font-bold text-dark">{leave.days}</td>
                      <td className="py-6 text-sm text-muted max-w-xs truncate">{leave.reason}</td>
                      <td className="py-6">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${leave.status === "Approved" ? "bg-green-500/10 text-green-500" : leave.status === "Rejected" ? "bg-red-500/10 text-red-500" : "bg-yellow-500/10 text-yellow-500"}`}>{leave.status}</span>
                      </td>
                      <td className="py-6">
                        {leave.status === "Pending" && (
                          <div className="flex gap-2">
                            <button onClick={() => handleLeaveApproval(leave.id, "Approved", "Admin")} className="rounded-lg bg-green-500/10 px-3 py-1 text-xs font-bold text-green-500 transition hover:bg-green-500 hover:text-white">Approve</button>
                            <button onClick={() => handleLeaveApproval(leave.id, "Rejected", "Admin")} className="rounded-lg bg-red-500/10 px-3 py-1 text-xs font-bold text-red-500 transition hover:bg-red-500 hover:text-white">Reject</button>
                          </div>
                        )}
                        {leave.status !== "Pending" && <span className="text-xs text-muted">{leave.approvedBy}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!["staff", "attendance", "leaves"].includes(activeTab) && (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-surface p-8 text-center">
            <p className="text-lg font-bold text-dark">This HR section is almost ready.</p>
            <p className="mt-2 text-sm text-muted">
              {tabs.find((tab) => tab.id === activeTab)?.label} will appear here once its dashboard panel is completed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HRManagementComplete;
