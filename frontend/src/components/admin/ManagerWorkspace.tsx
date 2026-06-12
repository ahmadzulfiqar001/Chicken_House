import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Check,
  ClipboardList,
  Clock3,
  Layers3,
  LogOut,
  Menu,
  Package,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useRealtime } from "../../lib/realtime";

type OverviewPayload = {
  panelRole: string;
  stats: {
    totalStaff: number;
    activeStaff: number;
    customerAccounts: number;
    presentToday: number;
    lateToday: number;
    absentToday: number;
    pendingLeaves: number;
    pendingRequests: number;
    activeOrders: number;
    lowStockCount: number;
    todayRevenue: number;
  };
  roleDistribution: Array<{ role: string; count: number }>;
  topPerformers: Array<{
    id: number;
    name: string;
    role: string;
    department: string;
    shift: string;
    status: string;
    performanceScore: number;
    attendanceStatus: string;
    pendingLeaves: number;
    pendingRequests: number;
    assignedOrders: number;
  }>;
  attentionNeeded: Array<{
    id: number;
    name: string;
    role: string;
    attendanceStatus: string;
    pendingLeaves: number;
    pendingRequests: number;
    assignedOrders: number;
  }>;
  staffSnapshots: Array<{
    id: number;
    name: string;
    role: string;
    department: string;
    shift: string;
    status: string;
    performanceScore: number;
    attendanceStatus: string;
    pendingLeaves: number;
    pendingRequests: number;
    assignedOrders: number;
  }>;
  pendingLeaves: Array<{
    id: string;
    staffName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: string;
  }>;
  pendingRequests: Array<{
    id: string;
    staffName: string;
    category: string;
    subject: string;
    message: string;
    status: string;
  }>;
  inventoryAlerts: Array<{
    id: number;
    name: string;
    stock: number;
    minStock: number;
    unit: string;
    category: string;
  }>;
  orderPulse: {
    pending: number;
    preparing: number;
    onRoute: number;
    delivered: number;
    cancelled: number;
    queue: Array<{
      id: string;
      customer: string;
      status: string;
      total: number;
      assignedTo: string;
      assignedRole: string;
    }>;
  };
  activityFeed: Array<{
    id: string;
    title: string;
    detail: string;
    actor: string;
    createdAt: string;
  }>;
};

type ManagerTab = "overview" | "team" | "requests" | "orders" | "inventory" | "activity";
type DecisionStatus = "Approved" | "Rejected";

const ManagerWorkspace = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ManagerTab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState<OverviewPayload | null>(null);
  const [pendingPayments, setPendingPayments] = useState<Array<Record<string, any>>>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [decisionBusyKey, setDecisionBusyKey] = useState("");

  const tabs = useMemo(
    () => [
      { id: "overview" as const, label: "Overview", icon: <BarChart3 size={18} /> },
      { id: "team" as const, label: "Team Progress", icon: <Users size={18} /> },
      { id: "requests" as const, label: "Requests", icon: <ClipboardList size={18} /> },
      { id: "orders" as const, label: "Orders Pulse", icon: <Layers3 size={18} /> },
      { id: "inventory" as const, label: "Inventory Alerts", icon: <Package size={18} /> },
      { id: "activity" as const, label: "Activity Feed", icon: <Bell size={18} /> },
    ],
    [],
  );

  const loadOverview = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/operations/overview");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(String(data.message ?? "Overview could not be loaded."));
      }

      setOverview(data);
    } catch (loadError) {
      console.error(loadError);
      setError(loadError instanceof Error ? loadError.message : "Overview could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  const loadPendingPayments = async () => {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();
      if (Array.isArray(data)) {
        setPendingPayments(
          data.filter((order: Record<string, any>) => order.paymentStatus === "Pending Verification"),
        );
      }
    } catch (loadError) {
      console.error(loadError);
    }
  };

  const handlePayment = async (orderId: string, action: "verify" | "reject") => {
    try {
      const response = await fetch(`/api/orders/${orderId}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(String(data.message ?? "Payment update failed."));
      }
      await Promise.all([loadPendingPayments(), loadOverview()]);
    } catch (paymentError) {
      console.error(paymentError);
      setError(paymentError instanceof Error ? paymentError.message : "Payment update failed.");
    }
  };

  const decideStaffRequest = async (requestId: string, status: DecisionStatus) => {
    const busyKey = `request:${requestId}`;
    setDecisionBusyKey(busyKey);
    setError("");

    try {
      const response = await fetch(`/api/operations/requests/${requestId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(String(data.message ?? "Request update failed."));
      }

      await loadOverview();
    } catch (decisionError) {
      console.error(decisionError);
      setError(decisionError instanceof Error ? decisionError.message : "Request update failed.");
    } finally {
      setDecisionBusyKey("");
    }
  };

  const decideLeaveRequest = async (leaveId: string, status: DecisionStatus) => {
    const busyKey = `leave:${leaveId}`;
    setDecisionBusyKey(busyKey);
    setError("");

    try {
      const response = await fetch(`/api/operations/leaves/${leaveId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(String(data.message ?? "Leave update failed."));
      }

      await loadOverview();
    } catch (decisionError) {
      console.error(decisionError);
      setError(decisionError instanceof Error ? decisionError.message : "Leave update failed.");
    } finally {
      setDecisionBusyKey("");
    }
  };

  useEffect(() => {
    void loadOverview();
    void loadPendingPayments();
  }, []);

  // Live: refresh overview + pending payments whenever any order changes.
  useRealtime("orders", () => {
    void loadOverview();
    void loadPendingPayments();
  });

  if (loading && !overview) {
    return <div className="min-h-screen bg-surface pt-40 text-center text-muted">Loading manager workspace...</div>;
  }

  if (!overview) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-surface px-4 text-center">
        <p className="max-w-md text-muted">{error || "Unable to open manager workspace."}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => void loadOverview()}
            className="rounded-full bg-primary px-6 py-3 font-bold text-white transition hover:bg-primary-strong"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={() => {
              void logout();
              navigate("/login");
            }}
            className="rounded-full border border-gray-200 px-6 py-3 font-bold text-dark transition hover:bg-white"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[19rem] flex-col overflow-y-auto border-r border-white/10 bg-dark px-5 py-6 text-white shadow-2xl transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="Chicken House" className="h-12 w-12 rounded-2xl border border-white/10 object-cover" />
          <div>
            <p className="text-lg font-display font-bold">Manager Panel</p>
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">Operations Oversight</p>
          </div>
        </div>

        <div className="mt-8 rounded-[1.8rem] border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-bold">{user?.name ?? "Manager"}</p>
          <p className="mt-1 text-xs text-white/60">Daily progress, queue health, and team watch</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-2xl bg-white/6 px-3 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Present</p>
              <p className="mt-2 text-lg font-bold">{overview.stats.presentToday}</p>
            </div>
            <div className="rounded-2xl bg-white/6 px-3 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Requests</p>
              <p className="mt-2 text-lg font-bold">{overview.stats.pendingRequests}</p>
            </div>
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false);
              }}
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

      <main className="ml-0 md:ml-[19rem] flex-1 p-4 md:p-8">
        <header className="sticky top-0 z-20 mb-8 rounded-[2rem] border border-gray-100 bg-white/85 px-6 py-5 shadow-lg shadow-dark/5 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="md:hidden rounded-lg p-2 text-muted hover:bg-gray-100"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">Manager Operations Desk</p>
                <h1 className="mt-2 text-2xl sm:text-3xl font-display font-bold text-dark">
                  {tabs.find((tab) => tab.id === activeTab)?.label}
                </h1>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void loadOverview()}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
          {error ? (
            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}
        </header>

        {pendingPayments.length > 0 && (
          <div className="mb-8 rounded-[2.5rem] border border-amber-200 bg-amber-50/70 p-8 shadow-xl shadow-dark/5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-amber-600" />
              <h2 className="text-xl font-bold text-dark">
                Payments to verify <span className="text-amber-600">({pendingPayments.length})</span>
              </h2>
            </div>
            <p className="mt-1 text-sm text-muted">
              Confirm the bank transfer was received, then verify or reject. The customer is updated live.
            </p>
            <div className="mt-6 space-y-3">
              {pendingPayments.map((order) => (
                <div
                  key={String(order.id)}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-100 bg-white px-5 py-4"
                >
                  <div>
                    <p className="font-bold text-dark">
                      {String(order.id)} · {String(order.customer ?? "")}
                    </p>
                    <p className="text-sm text-muted">
                      Rs. {Number(order.total ?? 0).toLocaleString()} · {String(order.paymentMethod ?? "Bank Transfer")}
                      {order.paymentReference ? (
                        <>
                          {" "}· Ref: <span className="font-mono font-bold text-dark">{String(order.paymentReference)}</span>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => void handlePayment(String(order.id), "verify")}
                      className="rounded-xl bg-green-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-600"
                    >
                      Verify
                    </button>
                    <button
                      type="button"
                      onClick={() => void handlePayment(String(order.id), "reject")}
                      className="rounded-xl bg-red-50 px-5 py-2.5 text-sm font-bold text-red-500 transition hover:bg-red-500 hover:text-white"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "overview" ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
              {[
                { label: "Total Staff", value: overview.stats.totalStaff, icon: <Users size={20} />, tone: "text-primary bg-primary/10" },
                { label: "Present Today", value: overview.stats.presentToday, icon: <ShieldCheck size={20} />, tone: "text-green-600 bg-green-500/10" },
                { label: "Pending Requests", value: overview.stats.pendingRequests, icon: <ClipboardList size={20} />, tone: "text-amber-600 bg-amber-500/10" },
                { label: "Active Orders", value: overview.stats.activeOrders, icon: <Layers3 size={20} />, tone: "text-blue-600 bg-blue-500/10" },
                { label: "Revenue Today", value: `Rs. ${overview.stats.todayRevenue.toLocaleString()}`, icon: <TrendingUp size={20} />, tone: "text-purple-600 bg-purple-500/10" },
              ].map((card) => (
                <div key={card.label} className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-xl shadow-dark/5">
                  <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${card.tone}`}>{card.icon}</div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">{card.label}</p>
                  <p className="mt-2 text-2xl font-display font-bold text-dark">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-dark">Top Performers</h2>
                  <span className="rounded-full bg-surface px-4 py-2 text-xs font-bold text-primary">Best on floor</span>
                </div>
                <div className="mt-6 space-y-4">
                  {overview.topPerformers.map((member) => (
                    <div key={member.id} className="rounded-[1.7rem] border border-gray-100 bg-surface/70 px-5 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-bold text-dark">{member.name}</p>
                          <p className="mt-1 text-sm text-muted">{member.role} | {member.department}</p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-primary">
                          {member.performanceScore.toFixed(1)} / 5
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-muted">Assigned orders: {member.assignedOrders} | Shift: {member.shift}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5">
                <h2 className="text-xl font-bold text-dark">Attention Needed</h2>
                <div className="mt-6 space-y-4">
                  {overview.attentionNeeded.map((member) => (
                    <div key={member.id} className="rounded-[1.6rem] bg-surface px-4 py-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={18} className="mt-1 text-amber-600" />
                        <div>
                          <p className="font-bold text-dark">{member.name}</p>
                          <p className="mt-1 text-sm text-muted">{member.role}</p>
                          <p className="mt-2 text-sm text-muted">
                            Attendance: {member.attendanceStatus} | Leaves: {member.pendingLeaves} | Requests: {member.pendingRequests}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "team" ? (
          <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5">
            <h2 className="text-xl font-bold text-dark">Team Progress Matrix</h2>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-bold uppercase tracking-[0.22em] text-muted">
                    <th className="pb-4">Staff</th>
                    <th className="pb-4">Role</th>
                    <th className="pb-4">Attendance</th>
                    <th className="pb-4">Orders</th>
                    <th className="pb-4">Leaves</th>
                    <th className="pb-4">Requests</th>
                    <th className="pb-4">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {overview.staffSnapshots.map((member) => (
                    <tr key={member.id}>
                      <td className="py-4">
                        <p className="font-bold text-dark">{member.name}</p>
                        <p className="text-xs text-muted">{member.department}</p>
                      </td>
                      <td className="py-4 text-sm text-dark">{member.role}</td>
                      <td className="py-4 text-sm text-muted">{member.attendanceStatus}</td>
                      <td className="py-4 text-sm text-muted">{member.assignedOrders}</td>
                      <td className="py-4 text-sm text-muted">{member.pendingLeaves}</td>
                      <td className="py-4 text-sm text-muted">{member.pendingRequests}</td>
                      <td className="py-4">
                        <span className="rounded-full bg-surface px-3 py-2 text-xs font-bold text-primary">
                          {member.performanceScore.toFixed(1)} / 5
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {activeTab === "requests" ? (
          <div className="grid gap-8 xl:grid-cols-2">
            <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5">
              <h2 className="text-xl font-bold text-dark">Pending Requests</h2>
              <div className="mt-6 space-y-4">
                {overview.pendingRequests.length ? (
                  overview.pendingRequests.map((request) => {
                    const busyKey = `request:${request.id}`;
                    const isBusy = decisionBusyKey === busyKey;

                    return (
                      <div key={request.id} className="rounded-[1.6rem] border border-gray-100 px-5 py-4">
                        <p className="font-bold text-dark">{request.subject}</p>
                        <p className="mt-1 text-sm text-muted">{request.staffName} | {request.category}</p>
                        <p className="mt-3 text-sm text-muted">{request.message}</p>
                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void decideStaffRequest(request.id, "Approved")}
                            className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Check size={16} />
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void decideStaffRequest(request.id, "Rejected")}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-500 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <X size={16} />
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-[1.6rem] border border-dashed border-gray-200 px-5 py-8 text-center text-sm font-medium text-muted">
                    No pending staff requests.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5">
              <h2 className="text-xl font-bold text-dark">Pending Leaves</h2>
              <div className="mt-6 space-y-4">
                {overview.pendingLeaves.length ? (
                  overview.pendingLeaves.map((leave) => {
                    const busyKey = `leave:${leave.id}`;
                    const isBusy = decisionBusyKey === busyKey;

                    return (
                      <div key={leave.id} className="rounded-[1.6rem] border border-gray-100 px-5 py-4">
                        <p className="font-bold text-dark">{leave.staffName}</p>
                        <p className="mt-1 text-sm text-muted">{leave.leaveType} | {leave.startDate} to {leave.endDate}</p>
                        <p className="mt-3 text-sm text-muted">{leave.reason}</p>
                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void decideLeaveRequest(leave.id, "Approved")}
                            className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Check size={16} />
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void decideLeaveRequest(leave.id, "Rejected")}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-500 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <X size={16} />
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-[1.6rem] border border-dashed border-gray-200 px-5 py-8 text-center text-sm font-medium text-muted">
                    No pending leave requests.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "orders" ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
              {[
                { label: "Pending", value: overview.orderPulse.pending, icon: <Clock3 size={18} /> },
                { label: "Preparing", value: overview.orderPulse.preparing, icon: <Layers3 size={18} /> },
                { label: "On Route", value: overview.orderPulse.onRoute, icon: <TrendingUp size={18} /> },
                { label: "Delivered", value: overview.orderPulse.delivered, icon: <ShieldCheck size={18} /> },
                { label: "Cancelled", value: overview.orderPulse.cancelled, icon: <AlertTriangle size={18} /> },
              ].map((item) => (
                <div key={item.label} className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-xl shadow-dark/5">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">{item.icon}</div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">{item.label}</p>
                  <p className="mt-2 text-2xl font-display font-bold text-dark">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5">
              <h2 className="text-xl font-bold text-dark">Live Queue Review</h2>
              <div className="mt-6 space-y-4">
                {overview.orderPulse.queue.map((order) => (
                  <div key={order.id} className="rounded-[1.6rem] border border-gray-100 px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-dark">{order.id}</p>
                        <p className="mt-1 text-sm text-muted">{order.customer} | {order.assignedTo}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">Rs. {order.total.toLocaleString()}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted">{order.status} | {order.assignedRole}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "inventory" ? (
          <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5">
            <h2 className="text-xl font-bold text-dark">Inventory Pressure Board</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {overview.inventoryAlerts.map((item) => (
                <div key={item.id} className="rounded-[1.7rem] border border-gray-100 bg-surface/70 px-5 py-4">
                  <p className="font-bold text-dark">{item.name}</p>
                  <p className="mt-1 text-sm text-muted">{item.category}</p>
                  <p className="mt-3 text-sm text-muted">
                    Current stock: {item.stock} {item.unit} | Minimum: {item.minStock} {item.unit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === "activity" ? (
          <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5">
            <h2 className="text-xl font-bold text-dark">Activity Feed</h2>
            <div className="mt-6 space-y-4">
              {overview.activityFeed.map((entry) => (
                <div key={entry.id} className="rounded-[1.6rem] border border-gray-100 px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-dark">{entry.title}</p>
                      <p className="mt-1 text-sm text-muted">{entry.actor}</p>
                    </div>
                    <span className="rounded-full bg-surface px-3 py-2 text-xs font-bold text-primary">
                      {new Date(entry.createdAt).toLocaleString("en-PK")}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted">{entry.detail}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default ManagerWorkspace;
