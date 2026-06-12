import express from "express";
import { getRequestAuthUser, requireAuth } from "../auth/auth.service";
import { findOne, insertDoc, loadAll, updateDoc } from "../../core/store";

const router = express.Router();

router.use(requireAuth);

const ensureOperationsAccess = (req: express.Request, res: express.Response) => {
  const authUser = getRequestAuthUser(req);

  if (!authUser || !["admin", "manager"].includes(authUser.role)) {
    res.status(403).json({ message: "Operations access is available for admin and manager roles only." });
    return null;
  }

  return authUser;
};

const addActivityLog = async ({
  staffId,
  staffName,
  role,
  action,
  detail,
}: {
  staffId?: number;
  staffName?: string;
  role: string;
  action: string;
  detail: string;
}) => {
  await insertDoc("activityLogs", {
    id: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    staffId: staffId ?? 0,
    staffName: staffName ?? "",
    role,
    action,
    detail,
    createdAt: new Date().toISOString(),
  });
};

router.get("/overview", async (req, res) => {
  const authUser = ensureOperationsAccess(req, res);
  if (!authUser) return;

  const [staff, attendanceAll, leavesAll, requestsAll, ordersAll, inventoryAll, customersAll, activityAll] =
    await Promise.all([
      loadAll("staff"),
      loadAll("attendance"),
      loadAll("leaveRequests"),
      loadAll("staffRequests"),
      loadAll("orders"),
      loadAll("inventory"),
      loadAll("customers"),
      loadAll("activityLogs"),
    ]);

  const today = new Date().toISOString().slice(0, 10);
  const todayAttendance = attendanceAll.filter((record) => record.date === today);
  const presentToday = todayAttendance.filter((record) => ["Present", "Late"].includes(record.status)).length;
  const lateToday = todayAttendance.filter((record) => record.status === "Late").length;
  const absentToday = Math.max(staff.length - todayAttendance.length, 0);
  const pendingLeaves = leavesAll.filter((leave) => leave.status === "Pending");
  const pendingRequests = requestsAll.filter((request) => request.status === "Pending");
  const activeOrders = ordersAll.filter((order) => !["Delivered", "Cancelled"].includes(String(order.status)));
  const lowStock = inventoryAll.filter((item) => Number(item.stock ?? 0) <= Number(item.minStock ?? 0) + 5);
  const todayRevenue = ordersAll
    .filter((order) => String(order.time ?? "").slice(0, 10) === today && order.status !== "Cancelled")
    .reduce((sum, order) => sum + Number(order.total ?? 0), 0);

  const staffSnapshots = staff.map((member) => {
    const attendance = todayAttendance.find((record) => Number(record.staffId) === Number(member.id));
    const memberLeaves = pendingLeaves.filter((leave) => Number(leave.staffId) === Number(member.id)).length;
    const memberRequests = pendingRequests.filter((request) => Number(request.staffId) === Number(member.id)).length;
    const assignedOrders = activeOrders.filter((order) => Number(order.assignedStaffId ?? 0) === Number(member.id)).length;

    return {
      id: member.id,
      name: member.name,
      role: member.role,
      department: member.department,
      shift: member.shift,
      status: member.status,
      performanceScore: Number(member.performanceScore ?? 0),
      attendanceStatus: attendance?.status ?? "Not Marked",
      pendingLeaves: memberLeaves,
      pendingRequests: memberRequests,
      assignedOrders,
    };
  });

  const topPerformers = [...staffSnapshots]
    .sort((left, right) => Number(right.performanceScore) - Number(left.performanceScore))
    .slice(0, 4);

  const attentionNeeded = staffSnapshots
    .filter((member) => member.pendingLeaves > 0 || member.pendingRequests > 0 || member.attendanceStatus === "Late")
    .slice(0, 6);

  const roleDistribution = Object.entries(
    staff.reduce<Record<string, number>>((acc, member) => {
      acc[member.role] = (acc[member.role] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([role, count]) => ({ role, count }));

  const orderPulse = {
    pending: ordersAll.filter((order) => order.status === "Pending").length,
    preparing: ordersAll.filter((order) => order.status === "Preparing").length,
    onRoute: ordersAll.filter((order) => order.status === "Out for Delivery").length,
    delivered: ordersAll.filter((order) => order.status === "Delivered").length,
    cancelled: ordersAll.filter((order) => order.status === "Cancelled").length,
    queue: activeOrders.slice(0, 6).map((order) => ({
      id: order.id,
      customer: order.customer,
      status: order.status,
      total: order.total,
      assignedTo: order.assignedStaffName || "Unassigned",
      assignedRole: order.assignedRole || "Shared Queue",
    })),
  };

  const activityFeed = [...activityAll]
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
    .slice(0, 12)
    .map((entry) => ({
      id: entry.id,
      title: entry.action,
      detail: entry.detail,
      actor: entry.staffName,
      createdAt: entry.createdAt,
    }));

  return res.json({
    panelRole: authUser.role,
    stats: {
      totalStaff: staff.length,
      activeStaff: staff.filter((member) => member.status === "Active").length,
      customerAccounts: customersAll.length,
      presentToday,
      lateToday,
      absentToday,
      pendingLeaves: pendingLeaves.length,
      pendingRequests: pendingRequests.length,
      activeOrders: activeOrders.length,
      lowStockCount: lowStock.length,
      todayRevenue,
    },
    roleDistribution,
    topPerformers,
    attentionNeeded,
    staffSnapshots,
    pendingLeaves: pendingLeaves.slice(0, 8),
    pendingRequests: pendingRequests.slice(0, 8),
    inventoryAlerts: lowStock.slice(0, 8).map((item) => ({
      id: item.id,
      name: item.name,
      stock: item.stock,
      minStock: item.minStock,
      unit: item.unit,
      category: item.category,
    })),
    orderPulse,
    activityFeed,
  });
});

router.patch("/leaves/:id/status", async (req, res) => {
  const authUser = ensureOperationsAccess(req, res);
  if (!authUser) return;

  const status = String(req.body?.status ?? "").trim();
  const rejectionReason = String(req.body?.rejectionReason ?? req.body?.reason ?? "").trim();

  if (status !== "Approved" && status !== "Rejected") {
    return res.status(400).json({ message: "Leave status must be Approved or Rejected." });
  }

  const leave = await findOne("leaveRequests", { id: req.params.id });

  if (!leave) {
    return res.status(404).json({ message: "Leave request not found." });
  }

  const wasApproved = leave.status === "Approved";
  const now = new Date().toISOString();
  const patch = {
    status,
    approvedBy: authUser.name || authUser.email,
    approvedAt: status === "Approved" ? now : "",
    rejectionReason: status === "Rejected" ? rejectionReason : "",
  };

  await updateDoc("leaveRequests", { id: req.params.id }, patch);

  if (status === "Approved" && !wasApproved) {
    const staffId = Number(leave.staffId);
    const staff = await findOne("staff", { id: staffId });

    if (staff) {
      const nextBalance = Math.max(0, Number(staff.leaveBalance ?? 20) - Number(leave.days ?? 0));
      await updateDoc("staff", { id: staffId }, { leaveBalance: nextBalance });
    }
  }

  await addActivityLog({
    staffId: Number(leave.staffId ?? 0),
    staffName: String(leave.staffName ?? ""),
    role: authUser.role,
    action: `Leave ${status.toLowerCase()}`,
    detail: `${authUser.name} ${status.toLowerCase()} leave ${leave.id} for ${leave.staffName}.`,
  });

  return res.json({ ...leave, ...patch });
});

router.patch("/requests/:id/status", async (req, res) => {
  const authUser = ensureOperationsAccess(req, res);
  if (!authUser) return;

  const status = String(req.body?.status ?? "").trim();
  const allowedStatuses = ["Approved", "Rejected", "Resolved"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Request status must be Approved, Rejected, or Resolved." });
  }

  const request = await findOne("staffRequests", { id: req.params.id });

  if (!request) {
    return res.status(404).json({ message: "Staff request not found." });
  }

  const patch = {
    status,
    resolvedAt: new Date().toISOString(),
  };

  await updateDoc("staffRequests", { id: req.params.id }, patch);
  await addActivityLog({
    staffId: Number(request.staffId ?? 0),
    staffName: String(request.staffName ?? ""),
    role: authUser.role,
    action: `Request ${status.toLowerCase()}`,
    detail: `${authUser.name} ${status.toLowerCase()} request ${request.id} from ${request.staffName}.`,
  });

  return res.json({ ...request, ...patch });
});

export default router;
