import express from "express";
import { hashPassword, normalizeEmailInput, requirePermission } from "../auth/auth.service";
import { db } from "../../core/db";
import { CustomerModel, StaffModel, UserAccountModel } from "../../core/models";
import { isMongoConnected } from "../../core/mongo";
import type { UserRole } from "../../core/permissions";

const router = express.Router();

const staffRoles: UserRole[] = ["manager", "rider", "staff"];

const roleLabelMap: Record<UserRole, string> = {
  admin: "Admin",
  manager: "Manager / Branch Supervisor",
  rider: "Rider / Delivery Staff",
  staff: "General Staff",
  user: "Customer",
};

const roleDepartmentMap: Record<UserRole, string> = {
  admin: "Administration",
  manager: "Management",
  rider: "Delivery",
  staff: "Operations",
  user: "Customer",
};

const roleShiftMap: Record<UserRole, string> = {
  admin: "Morning",
  manager: "Evening",
  rider: "Night",
  staff: "Evening",
  user: "Morning",
};

const buildInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.trim()[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

const isStaffRole = (role: UserRole) => staffRoles.includes(role);

const toStaffStatus = (status: string) => {
  if (status === "Suspended") return "Inactive";
  if (status === "Pending") return "Inactive";
  return "Active";
};

const sanitizeUser = (user: Record<string, unknown>) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

const buildCustomerRecord = ({
  id,
  name,
  email,
  phone,
}: {
  id: string;
  name: string;
  email: string;
  phone: string;
}) => ({
  id,
  name,
  email,
  phone,
  address: "",
  city: "Renala Khurd",
  memberSince: new Date().getFullYear().toString(),
  loyaltyPoints: 0,
  walletBalance: 0,
  favoriteCategory: "House Specials",
  orderCount: 0,
  avatarInitials: buildInitials(name),
  preferences: {
    notifications: true,
    promotions: true,
    orderUpdates: true,
    darkAlerts: false,
  },
  addresses: [],
  wishlist: [],
  walletTransactions: [],
  activity: ["Customer account created by admin."],
});

const buildStaffRecord = ({
  id,
  userAccountId,
  name,
  email,
  phone,
  role,
  status,
  shift,
  department,
  salary,
  address,
  emergencyContact,
}: {
  id: number;
  userAccountId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: string;
  shift: string;
  department: string;
  salary: number;
  address: string;
  emergencyContact: string;
}) => ({
  id,
  userAccountId,
  name,
  role: roleLabelMap[role],
  status: toStaffStatus(status),
  shift,
  salary,
  joinDate: new Date().toISOString().slice(0, 10),
  email,
  phone,
  address,
  emergencyContact,
  department,
  leaveBalance: 20,
  performanceScore: 4.0,
});

const attachLinkedProfile = (user: Record<string, unknown>) => {
  const staffMemberId = Number(user.staffMemberId ?? 0);
  const customerProfileId = String(user.customerProfileId ?? "");
  const linkedStaff =
    staffMemberId > 0
      ? db.staff.find((member) => Number(member.id) === staffMemberId) ?? null
      : null;
  const linkedCustomer =
    customerProfileId
      ? db.customers.find((customer) => String(customer.id) === customerProfileId) ?? null
      : null;

  return {
    ...sanitizeUser(user),
    linkedProfile: linkedStaff
      ? {
          type: "staff",
          shift: linkedStaff.shift,
          department: linkedStaff.department,
          address: linkedStaff.address,
          emergencyContact: linkedStaff.emergencyContact,
          salary: linkedStaff.salary,
          title: linkedStaff.role,
        }
      : linkedCustomer
        ? {
            type: "customer",
            city: linkedCustomer.city,
            address: linkedCustomer.address,
            orderCount: linkedCustomer.orderCount,
            loyaltyPoints: linkedCustomer.loyaltyPoints,
          }
        : null,
  };
};

router.get("/", requirePermission("users:view"), async (req, res) => {
  if (isMongoConnected()) {
    const users = await UserAccountModel.find()
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .lean();
    return res.json(users);
  }

  const users = db.userAccounts.map((user) => attachLinkedProfile(user));
  return res.json(users);
});

router.get("/:id", requirePermission("users:view"), async (req, res) => {
  if (isMongoConnected()) {
    const user = await UserAccountModel.findOne({ id: req.params.id })
      .select("-passwordHash")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  }

  const user = db.userAccounts.find((entry) => entry.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json(attachLinkedProfile(user));
});

router.post("/", requirePermission("users:create"), async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const email = normalizeEmailInput(String(req.body?.email ?? ""));
  const role = (String(req.body?.role ?? "user") as UserRole) || "user";
  const status = String(req.body?.status ?? "Active");
  const phone = String(req.body?.phone ?? "").trim();
  const password = String(req.body?.password ?? "").trim();
  const shift = String(req.body?.shift ?? roleShiftMap[role] ?? "Morning").trim();
  const department = String(req.body?.department ?? roleDepartmentMap[role] ?? "").trim();
  const salary = Math.max(0, Number(req.body?.salary ?? 0));
  const address = String(req.body?.address ?? "").trim();
  const emergencyContact = String(req.body?.emergencyContact ?? "").trim();

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  if (!["admin", "manager", "rider", "staff", "user"].includes(role)) {
    return res.status(400).json({ message: "Invalid role selected." });
  }

  const existing = isMongoConnected()
    ? await UserAccountModel.findOne({ email }).lean()
    : db.userAccounts.find((entry) => String(entry.email).toLowerCase() === email);

  if (existing) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const userId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const nextUser: Record<string, unknown> = {
    id: userId,
    name,
    email,
    passwordHash: hashPassword(password || "changeme123"),
    role,
    provider: "email",
    status,
    phone,
    staffMemberId: 0,
    memberSince: new Date().getFullYear().toString(),
    emailVerified: false,
    lastLoginAt: "",
    avatarUrl: "",
    avatarInitials: buildInitials(name),
    customerProfileId: "",
    preferences: {
      notifications: true,
      promotions: true,
      orderUpdates: true,
      language: "en",
      theme: "restaurant-dark",
    },
  };

  if (isStaffRole(role)) {
    if (isMongoConnected()) {
      const latest = await StaffModel.findOne().sort({ id: -1 }).select("id").lean();
      const staffId = Number(latest?.id ?? 0) + 1;
      await StaffModel.create(
        buildStaffRecord({
          id: staffId,
          userAccountId: userId,
          name,
          email,
          phone,
          role,
          status,
          shift,
          department,
          salary,
          address,
          emergencyContact,
        }),
      );
      nextUser.staffMemberId = staffId;
    } else {
      const staffId =
        db.staff.reduce((max, member) => Math.max(max, Number(member.id) || 0), 0) + 1;
      db.staff.push(
        buildStaffRecord({
          id: staffId,
          userAccountId: userId,
          name,
          email,
          phone,
          role,
          status,
          shift,
          department,
          salary,
          address,
          emergencyContact,
        }),
      );
      nextUser.staffMemberId = staffId;
    }
  }

  if (role === "user") {
    const customerProfileId = `customer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    nextUser.customerProfileId = customerProfileId;

    if (isMongoConnected()) {
      await CustomerModel.create(
        buildCustomerRecord({
          id: customerProfileId,
          name,
          email,
          phone,
        }),
      );
    } else {
      db.customers.push(
        buildCustomerRecord({
          id: customerProfileId,
          name,
          email,
          phone,
        }),
      );
    }
  }

  if (isMongoConnected()) {
    const created = await UserAccountModel.create(nextUser);
    return res.status(201).json(sanitizeUser(created.toObject()));
  }

  db.userAccounts.push(nextUser as typeof db.userAccounts[number]);
  return res.status(201).json(attachLinkedProfile(nextUser));
});

router.patch("/:id", requirePermission("users:update"), async (req, res) => {
  const allowedRoles: UserRole[] = ["admin", "manager", "rider", "staff", "user"];

  if (isMongoConnected()) {
    const user = await UserAccountModel.findOne({ id: req.params.id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.body?.name) user.name = String(req.body.name).trim();
    if (req.body?.role) {
      const nextRole = String(req.body.role) as UserRole;
      if (!allowedRoles.includes(nextRole)) {
        return res.status(400).json({ message: "Invalid role selected." });
      }
      user.role = nextRole;
    }
    if (req.body?.status) user.status = String(req.body.status);
    if (req.body?.phone !== undefined) user.phone = String(req.body.phone).trim();
    if (req.body?.password) user.passwordHash = hashPassword(String(req.body.password));
    user.avatarInitials = buildInitials(String(user.name));

    await user.save();
    return res.json(sanitizeUser(user.toObject()));
  }

  const user = db.userAccounts.find((entry) => entry.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const nextRole = String(req.body?.role ?? user.role ?? "user") as UserRole;
  if (!allowedRoles.includes(nextRole)) {
    return res.status(400).json({ message: "Invalid role selected." });
  }
  const nextStatus = String(req.body?.status ?? user.status);
  const nextName = String(req.body?.name ?? user.name).trim() || user.name;
  const nextPhone = req.body?.phone !== undefined ? String(req.body.phone).trim() : user.phone;
  const nextShift = String(req.body?.shift ?? roleShiftMap[nextRole] ?? "Morning").trim();
  const nextDepartment = String(req.body?.department ?? roleDepartmentMap[nextRole] ?? "").trim();
  const nextSalary = Math.max(0, Number(req.body?.salary ?? 0));
  const nextAddress = String(req.body?.address ?? "").trim();
  const nextEmergencyContact = String(req.body?.emergencyContact ?? "").trim();

  user.name = nextName;
  user.role = nextRole;
  user.status = nextStatus;
  user.phone = nextPhone;
  user.avatarInitials = buildInitials(nextName);

  if (req.body?.password) {
    user.passwordHash = hashPassword(String(req.body.password));
  }

  if (isStaffRole(nextRole)) {
    if (!Number(user.staffMemberId ?? 0)) {
      const staffId =
        db.staff.reduce((max, member) => Math.max(max, Number(member.id) || 0), 0) + 1;
      db.staff.push(
        buildStaffRecord({
          id: staffId,
          userAccountId: String(user.id),
          name: nextName,
          email: String(user.email),
          phone: nextPhone,
          role: nextRole,
          status: nextStatus,
          shift: nextShift,
          department: nextDepartment,
          salary: nextSalary,
          address: nextAddress,
          emergencyContact: nextEmergencyContact,
        }),
      );
      user.staffMemberId = staffId;
    } else {
      const linkedStaff = db.staff.find((member) => Number(member.id) === Number(user.staffMemberId));
      if (linkedStaff) {
        linkedStaff.name = nextName;
        linkedStaff.email = String(user.email);
        linkedStaff.phone = nextPhone;
        linkedStaff.role = roleLabelMap[nextRole];
        linkedStaff.status = toStaffStatus(nextStatus);
        linkedStaff.shift = nextShift;
        linkedStaff.department = nextDepartment;
        linkedStaff.salary = nextSalary;
        linkedStaff.address = nextAddress;
        linkedStaff.emergencyContact = nextEmergencyContact;
      }
    }
  }

  if (nextRole === "user") {
    if (!String(user.customerProfileId ?? "")) {
      const customerProfileId = `customer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      user.customerProfileId = customerProfileId;
      db.customers.push(
        buildCustomerRecord({
          id: customerProfileId,
          name: nextName,
          email: String(user.email),
          phone: nextPhone,
        }),
      );
    } else {
      const linkedCustomer = db.customers.find(
        (customer) => String(customer.id) === String(user.customerProfileId),
      );
      if (linkedCustomer) {
        linkedCustomer.name = nextName;
        linkedCustomer.phone = nextPhone;
        linkedCustomer.avatarInitials = buildInitials(nextName);
      }
    }
  }

  return res.json(attachLinkedProfile(user));
});

router.delete("/:id", requirePermission("users:delete"), async (req, res) => {
  if (isMongoConnected()) {
    const deleted = await UserAccountModel.findOneAndDelete({ id: req.params.id })
      .select("-passwordHash")
      .lean();

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User deleted", user: deleted });
  }

  const index = db.userAccounts.findIndex((entry) => entry.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  const [deleted] = db.userAccounts.splice(index, 1);

  if (Number(deleted.staffMemberId ?? 0)) {
    const staffIndex = db.staff.findIndex(
      (member) => Number(member.id) === Number(deleted.staffMemberId),
    );
    if (staffIndex !== -1) {
      db.staff.splice(staffIndex, 1);
    }
  }

  if (String(deleted.customerProfileId ?? "")) {
    const customerIndex = db.customers.findIndex(
      (customer) => String(customer.id) === String(deleted.customerProfileId),
    );
    if (customerIndex !== -1) {
      db.customers.splice(customerIndex, 1);
    }
  }

  return res.json({ message: "User deleted", user: sanitizeUser(deleted) });
});

export default router;
