import express from "express";
import { getRequestAuthUser, normalizeEmailInput, requireAuth } from "../auth/auth.service";
import { findOne, insertDoc, loadAll, removeDoc, updateDoc, updateManyDocs } from "../../core/store";
import { emitChange } from "../../core/realtime";

const router = express.Router();

router.use(requireAuth);

const staffOnlyRoles = new Set(["manager", "rider", "staff"]);

const roleLabels: Record<string, string> = {
  manager: "Manager / Branch Supervisor",
  rider: "Rider / Delivery Staff",
  staff: "General Staff",
};

type Doc = Record<string, any>;

const resolveStaffMember = async (
  authUser: ReturnType<typeof getRequestAuthUser>,
): Promise<Doc | null> => {
  if (!authUser) return null;

  const staff = await loadAll("staff");

  if (authUser.staffMemberId) {
    return staff.find((member) => Number(member.id) === Number(authUser.staffMemberId)) ?? null;
  }

  return (
    staff.find((member) => String(member.email ?? "").toLowerCase() === authUser.email.toLowerCase()) ??
    null
  );
};

const ensureStaffAccess = async (req: express.Request, res: express.Response) => {
  const authUser = getRequestAuthUser(req);

  if (!authUser || !staffOnlyRoles.has(authUser.role)) {
    res.status(403).json({ message: "This panel is available only for staff roles." });
    return null;
  }

  const staffMember = await resolveStaffMember(authUser);

  if (!staffMember) {
    res.status(404).json({ message: "Linked staff profile was not found." });
    return null;
  }

  return { authUser, staffMember };
};

const addActivityLog = async (
  staffMember: Doc,
  role: string,
  action: string,
  detail: string,
) => {
  await insertDoc("activityLogs", {
    id: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    staffId: staffMember.id,
    staffName: staffMember.name,
    role,
    action,
    detail,
    createdAt: new Date().toISOString(),
  });
};

const buildInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.trim()[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

const syncStaffNameAcrossRecords = async (staffId: number, nextName: string) => {
  const collections = [
    "attendance",
    "leaveRequests",
    "payroll",
    "shiftSchedules",
    "performanceReviews",
    "staffRequests",
    "activityLogs",
  ];

  await Promise.all(
    collections.map((name) => updateManyDocs(name, { staffId }, { staffName: nextName })),
  );
};

const todayDate = () => new Date().toISOString().slice(0, 10);

const deriveAttendanceStatus = (staffMember: { shift?: string }, checkInTime: string) => {
  const shiftStartMap: Record<string, string> = {
    Morning: "09:00",
    Evening: "14:00",
    Night: "22:00",
  };

  const shiftStart = shiftStartMap[String(staffMember.shift ?? "")] ?? "09:00";
  const [shiftHour, shiftMinute] = shiftStart.split(":").map(Number);
  const [inHour, inMinute] = checkInTime.split(":").map(Number);
  const shiftTotal = shiftHour * 60 + shiftMinute;
  const inTotal = inHour * 60 + inMinute;

  return inTotal > shiftTotal + 5 ? "Late" : "Present";
};

const toDateValue = (value: unknown) => {
  const parsed = Date.parse(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const getNotificationSeenBy = (notification: Doc) => {
  const seenBy = notification.metadata?.seenByStaffIds;
  return Array.isArray(seenBy) ? seenBy.map(Number) : [];
};

const isStaffNotificationVisible = (notification: Doc) => {
  const audience = String(notification.audience ?? "all");
  const status = String(notification.status ?? "");

  return ["staff", "all"].includes(audience) && status !== "Draft" && status !== "Failed";
};

const getVisibleNotices = async (role: string, staffMemberId: number) => {
  const canSeeAllNotices = role === "manager";
  const [notices, notifications] = await Promise.all([
    loadAll("staffNotices"),
    loadAll("notifications"),
  ]);

  const staffNotices: Doc[] = notices
    .filter(
      (notice) =>
        canSeeAllNotices ||
        (notice.audience ?? []).includes(role) ||
        (notice.audience ?? []).includes("staff"),
    )
    .map((notice) => ({
      ...notice,
      seen: (notice.seenBy ?? []).includes(staffMemberId),
    }));

  const notificationNotices: Doc[] = notifications
    .filter(isStaffNotificationVisible)
    .map((notification) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      createdAt: notification.sentAt || notification.createdAt,
      seen: getNotificationSeenBy(notification).includes(staffMemberId),
      source: "notification",
    }));

  return [...staffNotices, ...notificationNotices].sort(
    (left: Doc, right: Doc) => toDateValue(right.createdAt) - toDateValue(left.createdAt),
  );
};

const buildRoleTasks = async (role: string, staffMemberId: number) => {
  if (role === "rider") {
    const orders = await loadAll("orders");
    return orders
      .filter((order) => {
        const assignedStaffId = Number(order.assignedStaffId ?? 0);
        const isAssigned =
          assignedStaffId === Number(staffMemberId) ||
          (!assignedStaffId && String(order.assignedRole ?? "") === "rider");
        const isOpen = !Number(order.acceptedByStaffId ?? 0);
        return isAssigned && isOpen && !["Delivered", "Cancelled"].includes(String(order.status ?? ""));
      })
      .slice(0, 8)
      .map((order) => ({
        id: order.id,
        title: order.customer,
        status: order.status,
        subtitle: order.deliveryAddress || "Delivery address pending",
      }));
  }

  if (role === "staff") {
    const orders = await loadAll("orders");
    return orders
      .filter((order) => {
        const assignedToCurrent =
          Number(order.assignedStaffId ?? 0) === Number(staffMemberId) ||
          (String(order.assignedRole ?? "") === "staff" && !Number(order.assignedStaffId ?? 0));
        const isOpen = !Number(order.acceptedByStaffId ?? 0);

        return assignedToCurrent && isOpen && order.status !== "Delivered" && order.status !== "Cancelled";
      })
      .slice(0, 8)
      .map((order) => ({
        id: order.id,
        title: order.items,
        status: order.status,
        subtitle: `${order.customer} | ${order.type}`,
      }));
  }

  const shiftSchedules = await loadAll("shiftSchedules");
  return shiftSchedules
    .filter((shift) => Number(shift.staffId) === Number(staffMemberId))
    .slice(0, 5)
    .map((shift) => ({
      id: shift.id,
      title: shift.shiftType,
      status: shift.date,
      subtitle: `${shift.startTime || "--"} - ${shift.endTime || "--"}`,
    }));
};

const canAcceptOrderTask = (order: Doc, role: string, staffMemberId: number) => {
  if (!["rider", "staff"].includes(role)) return false;

  const assignedStaffId = Number(order.assignedStaffId ?? 0);
  const assignedRole = String(order.assignedRole ?? "").toLowerCase();
  const status = String(order.status ?? "");

  if (["Delivered", "Cancelled"].includes(status)) return false;
  if (Number(order.acceptedByStaffId ?? 0)) return false;

  return assignedStaffId === staffMemberId || (!assignedStaffId && assignedRole === role);
};

router.get("/summary", async (req, res) => {
  const context = await ensureStaffAccess(req, res);
  if (!context) return;

  const { authUser, staffMember } = context;
  const staffId = Number(staffMember.id);

  const [allAttendance, allLeaves, allShifts, allPayroll, allReviews, allRequests, allActivity] =
    await Promise.all([
      loadAll("attendance"),
      loadAll("leaveRequests"),
      loadAll("shiftSchedules"),
      loadAll("payroll"),
      loadAll("performanceReviews"),
      loadAll("staffRequests"),
      loadAll("activityLogs"),
    ]);

  const attendance = allAttendance
    .filter((record) => Number(record.staffId) === staffId)
    .sort((left, right) => String(right.date).localeCompare(String(left.date)));
  const todayAttendance = attendance.find((record) => record.date === todayDate()) ?? null;
  const leaves = allLeaves
    .filter((leave) => Number(leave.staffId) === staffId)
    .sort((left, right) => String(right.startDate).localeCompare(String(left.startDate)));
  const shifts = allShifts
    .filter((shift) => Number(shift.staffId) === staffId)
    .sort((left, right) => String(left.date).localeCompare(String(right.date)));
  const payroll = allPayroll
    .filter((entry) => Number(entry.staffId) === staffId)
    .sort((left, right) => Number(right.year) - Number(left.year));
  const reviews = allReviews
    .filter((entry) => Number(entry.staffId) === staffId)
    .sort((left, right) => String(right.reviewDate).localeCompare(String(left.reviewDate)));
  const notices = await getVisibleNotices(authUser.role, staffId);
  const requests = allRequests
    .filter((request) => Number(request.staffId) === staffId)
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
  const activity = allActivity
    .filter((entry) => Number(entry.staffId) === staffId)
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
    .slice(0, 10);
  const tasks = await buildRoleTasks(authUser.role, staffId);
  const lateCount = attendance.filter((record) => record.status === "Late").length;
  const absentCount = attendance.filter((record) => record.status === "Absent").length;

  return res.json({
    roleLabel: roleLabels[authUser.role] ?? "Staff",
    staff: staffMember,
    todayAttendance,
    attendanceStats: {
      totalRecords: attendance.length,
      lateCount,
      absentCount,
      presentCount: attendance.filter((record) => ["Present", "Late"].includes(record.status)).length,
    },
    pendingLeaveCount: leaves.filter((leave) => leave.status === "Pending").length,
    currentShift: shifts.find((shift) => shift.date >= todayDate()) ?? shifts[0] ?? null,
    latestPayroll: payroll[0] ?? null,
    latestPerformance: reviews[0] ?? null,
    notices,
    requests,
    tasks,
    activity,
  });
});

router.get("/attendance", async (req, res) => {
  const context = await ensureStaffAccess(req, res);
  if (!context) return;

  const all = await loadAll("attendance");
  const records = all
    .filter((record) => Number(record.staffId) === Number(context.staffMember.id))
    .sort((left, right) => String(right.date).localeCompare(String(left.date)));

  return res.json(records);
});

router.post("/attendance/mark", async (req, res) => {
  const context = await ensureStaffAccess(req, res);
  if (!context) return;

  const { authUser, staffMember } = context;
  const existing = await findOne("attendance", { staffId: Number(staffMember.id), date: todayDate() });

  if (existing) {
    return res.status(400).json({ message: "Attendance once submitted is locked for today." });
  }

  const currentTime = new Date().toTimeString().slice(0, 5);
  const status = deriveAttendanceStatus(staffMember, currentTime);
  const record = {
    id: `ATT-${Date.now()}`,
    staffId: Number(staffMember.id),
    staffName: staffMember.name,
    date: todayDate(),
    clockIn: currentTime,
    clockOut: "",
    status,
    workHours: 0,
    notes: "",
    location: String(req.ip ?? ""),
    edited: false,
    adminApproval: "Locked",
  };

  await insertDoc("attendance", record);
  await addActivityLog(staffMember as Doc, authUser.role, "Attendance marked", `${staffMember.name} marked attendance at ${currentTime}.`);

  return res.status(201).json(record);
});

router.post("/attendance/corrections", async (req, res) => {
  const context = await ensureStaffAccess(req, res);
  if (!context) return;

  const { authUser, staffMember } = context;
  const request = {
    id: `REQ-${Date.now()}`,
    staffId: Number(staffMember.id),
    staffName: staffMember.name,
    category: "Attendance Correction",
    subject: String(req.body?.subject ?? "Attendance correction request"),
    message: String(req.body?.message ?? "").trim(),
    targetDate: String(req.body?.targetDate ?? todayDate()),
    status: "Pending",
    createdAt: new Date().toISOString(),
    resolvedAt: "",
  };

  await insertDoc("staffRequests", request);
  await addActivityLog(staffMember as Doc, authUser.role, "Request sent", `${staffMember.name} requested attendance correction for ${request.targetDate}.`);

  return res.status(201).json(request);
});

router.get("/leaves", async (req, res) => {
  const context = await ensureStaffAccess(req, res);
  if (!context) return;

  const all = await loadAll("leaveRequests");
  const leaves = all
    .filter((leave) => Number(leave.staffId) === Number(context.staffMember.id))
    .sort((left, right) => String(right.startDate).localeCompare(String(left.startDate)));

  return res.json(leaves);
});

router.post("/leaves", async (req, res) => {
  const context = await ensureStaffAccess(req, res);
  if (!context) return;

  const { authUser, staffMember } = context;
  const fromDate = String(req.body?.startDate ?? "");
  const toDate = String(req.body?.endDate ?? fromDate);
  const oneDay = 1000 * 60 * 60 * 24;
  const days = Math.max(1, Math.round((Date.parse(toDate) - Date.parse(fromDate)) / oneDay) + 1);

  const leave = {
    id: `LV-${Date.now()}`,
    staffId: Number(staffMember.id),
    staffName: staffMember.name,
    leaveType: String(req.body?.leaveType ?? "Casual"),
    startDate: fromDate,
    endDate: toDate,
    days,
    reason: String(req.body?.reason ?? "").trim(),
    attachment: String(req.body?.attachment ?? ""),
    status: "Pending",
    approvedBy: "",
    approvedAt: "",
    rejectionReason: "",
  };

  await insertDoc("leaveRequests", leave);
  await addActivityLog(staffMember as Doc, authUser.role, "Leave applied", `${staffMember.name} applied for ${leave.leaveType} leave from ${fromDate} to ${toDate}.`);

  return res.status(201).json(leave);
});

router.delete("/leaves/:id", async (req, res) => {
  const context = await ensureStaffAccess(req, res);
  if (!context) return;

  const match = {
    id: req.params.id,
    staffId: Number(context.staffMember.id),
    status: "Pending",
  };
  const target = await findOne("leaveRequests", match);

  if (!target) {
    return res.status(404).json({ message: "Pending leave request not found." });
  }

  await removeDoc("leaveRequests", match);
  await addActivityLog(context.staffMember as Doc, context.authUser.role, "Leave cancelled", `${context.staffMember.name} cancelled pending leave ${target.id}.`);
  return res.json({ message: "Pending leave request cancelled.", leave: target });
});

router.get("/shifts", async (req, res) => {
  const context = await ensureStaffAccess(req, res);
  if (!context) return;

  const all = await loadAll("shiftSchedules");
  const shifts = all
    .filter((shift) => Number(shift.staffId) === Number(context.staffMember.id))
    .sort((left, right) => String(left.date).localeCompare(String(right.date)));

  return res.json(shifts);
});

router.get("/tasks", async (req, res) => {
  const context = await ensureStaffAccess(req, res);
  if (!context) return;

  return res.json(await buildRoleTasks(context.authUser.role, Number(context.staffMember.id)));
});

router.post("/tasks/:id/accept", async (req, res) => {
  const context = await ensureStaffAccess(req, res);
  if (!context) return;

  const staffId = Number(context.staffMember.id);
  const order = await findOne("orders", { id: req.params.id });

  if (!order) {
    return res.status(404).json({ message: "Assigned work was not found." });
  }

  if (!canAcceptOrderTask(order, context.authUser.role, staffId)) {
    return res.status(403).json({ message: "This work is no longer available for your account." });
  }

  const now = new Date().toISOString();
  const patch = {
    assignedStaffId: staffId,
    assignedStaffName: String(context.staffMember.name ?? ""),
    assignedRole: context.authUser.role,
    acceptedByStaffId: staffId,
    acceptedByStaffName: String(context.staffMember.name ?? ""),
    acceptedAt: now,
    workStatus: "Accepted",
  };

  await updateDoc("orders", { id: String(order.id) }, patch);
  await addActivityLog(
    context.staffMember as Doc,
    context.authUser.role,
    "Work accepted",
    `${context.staffMember.name} accepted ${order.id} for ${order.customer ?? order.items ?? "assigned work"}.`,
  );
  emitChange("orders", { operationType: "update", orderId: String(order.id) });
  emitChange("notifications", { operationType: "update" });

  return res.json({
    message: "Work accepted and moved to your record.",
    task: { ...order, ...patch },
  });
});

router.get("/requests", async (req, res) => {
  const context = await ensureStaffAccess(req, res);
  if (!context) return;

  const all = await loadAll("staffRequests");
  return res.json(
    all
      .filter((request) => Number(request.staffId) === Number(context.staffMember.id))
      .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt))),
  );
});

router.post("/requests", async (req, res) => {
  const context = await ensureStaffAccess(req, res);
  if (!context) return;

  const request = {
    id: `REQ-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    staffId: Number(context.staffMember.id),
    staffName: context.staffMember.name,
    category: String(req.body?.category ?? "General Request"),
    subject: String(req.body?.subject ?? "Staff request"),
    message: String(req.body?.message ?? "").trim(),
    targetDate: "",
    status: "Pending",
    createdAt: new Date().toISOString(),
    resolvedAt: "",
  };

  await insertDoc("staffRequests", request);
  await addActivityLog(context.staffMember as Doc, context.authUser.role, "Request sent", `${context.staffMember.name} submitted a ${request.category} request.`);

  return res.status(201).json(request);
});

router.get("/notices", async (req, res) => {
  const context = await ensureStaffAccess(req, res);
  if (!context) return;

  return res.json(await getVisibleNotices(context.authUser.role, Number(context.staffMember.id)));
});

router.post("/notices/:id/seen", async (req, res) => {
  const context = await ensureStaffAccess(req, res);
  if (!context) return;

  const notice = await findOne("staffNotices", { id: req.params.id });

  const staffId = Number(context.staffMember.id);

  if (notice) {
    const seenBy: number[] = Array.isArray(notice.seenBy) ? notice.seenBy.map(Number) : [];

    if (!seenBy.includes(staffId)) {
      await updateDoc("staffNotices", { id: notice.id }, { seenBy: [...seenBy, staffId] });
      await addActivityLog(context.staffMember as Doc, context.authUser.role, "Notice seen", `${context.staffMember.name} viewed notice ${notice.title}.`);
    }

    return res.json({ message: "Notice marked as seen." });
  }

  const notification = await findOne("notifications", { id: req.params.id });

  if (!notification || !isStaffNotificationVisible(notification)) {
    return res.status(404).json({ message: "Notice not found." });
  }

  const seenByStaffIds = getNotificationSeenBy(notification);

  if (!seenByStaffIds.includes(staffId)) {
    await updateDoc("notifications", { id: notification.id }, {
      metadata: {
        ...(notification.metadata ?? {}),
        seenByStaffIds: [...seenByStaffIds, staffId],
      },
    });
    emitChange("notifications", { operationType: "update" });
    await addActivityLog(context.staffMember as Doc, context.authUser.role, "Notice seen", `${context.staffMember.name} viewed notice ${notification.title}.`);
  }

  return res.json({ message: "Notice marked as seen." });
});

router.get("/profile", async (req, res) => {
  const context = await ensureStaffAccess(req, res);
  if (!context) return;

  const staffId = Number(context.staffMember.id);
  const [allPayroll, allReviews] = await Promise.all([
    loadAll("payroll"),
    loadAll("performanceReviews"),
  ]);

  const latestPayroll =
    allPayroll
      .filter((entry) => Number(entry.staffId) === staffId)
      .sort((left, right) => Number(right.year) - Number(left.year))[0] ?? null;
  const latestReview =
    allReviews
      .filter((entry) => Number(entry.staffId) === staffId)
      .sort((left, right) => String(right.reviewDate).localeCompare(String(left.reviewDate)))[0] ?? null;

  return res.json({
    staff: context.staffMember,
    latestPayroll,
    latestReview,
  });
});

router.patch("/profile", async (req, res) => {
  const context = await ensureStaffAccess(req, res);
  if (!context) return;

  const name = String(req.body?.name ?? "").trim();
  const email = normalizeEmailInput(String(req.body?.email ?? ""));
  const phone = String(req.body?.phone ?? "").trim();
  const address = String(req.body?.address ?? "").trim();
  const emergencyContact = String(req.body?.emergencyContact ?? "").trim();

  if (name.length < 2) {
    return res.status(400).json({ message: "Please enter a valid name." });
  }

  if (!email.includes("@")) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  const accounts = await loadAll("userAccounts");
  const duplicateAccount = accounts.find(
    (account) =>
      account.id !== context.authUser.id &&
      String(account.email ?? "").toLowerCase() === email,
  );

  if (duplicateAccount) {
    return res.status(409).json({ message: "This email is already linked with another account." });
  }

  const staffId = Number(context.staffMember.id);
  const staffPatch = { name, email, phone, address, emergencyContact };
  await updateDoc("staff", { id: staffId }, staffPatch);
  Object.assign(context.staffMember, staffPatch);

  await updateDoc(
    "userAccounts",
    { id: context.authUser.id },
    { name, email, phone, avatarInitials: buildInitials(name) },
  );

  await syncStaffNameAcrossRecords(staffId, name);
  await addActivityLog(context.staffMember as Doc, context.authUser.role, "Profile updated", `${name} updated his profile details.`);

  return res.json({
    message: "Profile updated successfully.",
    staff: context.staffMember,
  });
});

export default router;
