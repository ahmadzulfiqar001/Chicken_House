import express from "express";
import { getRequestAuthUser, requireAuth } from "../auth";
import { db } from "../db";

const router = express.Router();

router.use(requireAuth);

router.get("/overview", (req, res) => {
  const authUser = getRequestAuthUser(req);

  if (!authUser || !["admin", "manager"].includes(authUser.role)) {
    return res.status(403).json({ message: "Operations overview is available for admin and manager roles only." });
  }

  const today = new Date().toISOString().slice(0, 10);
  const todayAttendance = db.attendance.filter((record) => record.date === today);
  const presentToday = todayAttendance.filter((record) => ["Present", "Late"].includes(record.status)).length;
  const lateToday = todayAttendance.filter((record) => record.status === "Late").length;
  const absentToday = Math.max(db.staff.length - todayAttendance.length, 0);
  const pendingLeaves = db.leaveRequests.filter((leave) => leave.status === "Pending");
  const pendingRequests = db.staffRequests.filter((request) => request.status === "Pending");
  const activeOrders = db.orders.filter((order) => !["Delivered", "Cancelled"].includes(String(order.status)));
  const lowStock = db.inventory.filter((item) => Number(item.stock ?? 0) <= Number(item.minStock ?? 0) + 5);
  const todayRevenue = db.orders
    .filter((order) => String(order.time ?? "").slice(0, 10) === today && order.status !== "Cancelled")
    .reduce((sum, order) => sum + Number(order.total ?? 0), 0);

  const staffSnapshots = db.staff.map((member) => {
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
    db.staff.reduce<Record<string, number>>((acc, member) => {
      acc[member.role] = (acc[member.role] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([role, count]) => ({ role, count }));

  const orderPulse = {
    pending: db.orders.filter((order) => order.status === "Pending").length,
    preparing: db.orders.filter((order) => order.status === "Preparing").length,
    onRoute: db.orders.filter((order) => order.status === "Out for Delivery").length,
    delivered: db.orders.filter((order) => order.status === "Delivered").length,
    cancelled: db.orders.filter((order) => order.status === "Cancelled").length,
    queue: activeOrders.slice(0, 6).map((order) => ({
      id: order.id,
      customer: order.customer,
      status: order.status,
      total: order.total,
      assignedTo: order.assignedStaffName || "Unassigned",
      assignedRole: order.assignedRole || "Shared Queue",
    })),
  };

  const activityFeed = db.activityLogs.slice(0, 12).map((entry) => ({
    id: entry.id,
    title: entry.action,
    detail: entry.detail,
    actor: entry.staffName,
    createdAt: entry.createdAt,
  }));

  return res.json({
    panelRole: authUser.role,
    stats: {
      totalStaff: db.staff.length,
      activeStaff: db.staff.filter((member) => member.status === "Active").length,
      customerAccounts: db.customers.length,
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

export default router;
