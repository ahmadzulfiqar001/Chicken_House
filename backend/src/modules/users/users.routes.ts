import express from "express";
import { getRequestAuthUser, hashPassword, normalizeEmailInput, requirePermission } from "../auth/auth.service";
import { db } from "../../core/db";
import { CustomerModel, StaffModel, UserAccountModel } from "../../core/models";
import { isMongoConfigured } from "../../core/mongo";
import type { UserRole } from "../../core/permissions";

const router = express.Router();

const staffRoles: UserRole[] = ["manager", "hr", "rider", "staff"];
const managedLoginRoles: UserRole[] = ["manager", "hr", "rider", "staff"];
const primaryAdminEmail = normalizeEmailInput(process.env.PRIMARY_ADMIN_EMAIL ?? "admin@chickenhouse.com");

const roleLabelMap: Record<UserRole, string> = {
  admin: "Admin",
  manager: "Manager / Branch Supervisor",
  hr: "HR / Human Resources",
  rider: "Rider / Delivery Staff",
  staff: "General Staff",
  user: "Customer",
};

const roleDepartmentMap: Record<UserRole, string> = {
  admin: "Administration",
  manager: "Management",
  hr: "Human Resources",
  rider: "Delivery",
  staff: "Operations",
  user: "Customer",
};

const roleShiftMap: Record<UserRole, string> = {
  admin: "Morning",
  manager: "Evening",
  hr: "Morning",
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
const isPrimaryAdminAccount = (account: Record<string, unknown> | null | undefined) =>
  String(account?.role ?? "") === "admin" &&
  String(account?.email ?? "").toLowerCase() === primaryAdminEmail;

const toStaffStatus = (status: string) => {
  if (status === "Suspended") return "Inactive";
  if (status === "Pending") return "Inactive";
  return "Active";
};

const canViewAllottedPasswords = (req: express.Request) =>
  getRequestAuthUser(req)?.role === "admin";

const sanitizeUser = (user: Record<string, unknown>, includeAllottedPassword = false) => {
  const { passwordHash, adminVisiblePassword, ...safeUser } = user;
  return includeAllottedPassword
    ? { ...safeUser, adminVisiblePassword: String(adminVisiblePassword ?? "") }
    : safeUser;
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

const attachLinkedProfile = (
  user: Record<string, unknown>,
  linkedStaffOverride?: Record<string, unknown> | null,
  linkedCustomerOverride?: Record<string, unknown> | null,
  includeAllottedPassword = false,
) => {
  const staffMemberId = Number(user.staffMemberId ?? 0);
  const customerProfileId = String(user.customerProfileId ?? "");
  const linkedStaff =
    linkedStaffOverride !== undefined
      ? linkedStaffOverride
      : staffMemberId > 0
      ? db.staff.find((member) => Number(member.id) === staffMemberId) ?? null
      : null;
  const linkedCustomer =
    linkedCustomerOverride !== undefined
      ? linkedCustomerOverride
      : customerProfileId
      ? db.customers.find((customer) => String(customer.id) === customerProfileId) ?? null
      : null;

  return {
    ...sanitizeUser(user, includeAllottedPassword),
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

const loadMongoLinkedProfile = async (
  user: Record<string, unknown>,
  includeAllottedPassword = false,
) => {
  const staffMemberId = Number(user.staffMemberId ?? 0);
  const customerProfileId = String(user.customerProfileId ?? "");
  const [linkedStaff, linkedCustomer] = await Promise.all([
    staffMemberId > 0 ? StaffModel.findOne({ id: staffMemberId }).lean() : null,
    customerProfileId ? CustomerModel.findOne({ id: customerProfileId }).lean() : null,
  ]);

  return attachLinkedProfile(
    user,
    linkedStaff as Record<string, unknown> | null,
    linkedCustomer as Record<string, unknown> | null,
    includeAllottedPassword,
  );
};

router.get("/", requirePermission("users:view"), async (req, res) => {
  const includeAllottedPassword = canViewAllottedPasswords(req);

  if (isMongoConfigured()) {
    const users = await UserAccountModel.find({ role: { $in: ["admin", ...managedLoginRoles] } })
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .lean();
    const linkedUsers = await Promise.all(
      users.map((user) => loadMongoLinkedProfile(user as Record<string, unknown>, includeAllottedPassword)),
    );
    return res.json(linkedUsers);
  }

  const users = db.userAccounts
    .filter((user) => ["admin", ...managedLoginRoles].includes(user.role as UserRole))
    .map((user) => attachLinkedProfile(user, undefined, undefined, includeAllottedPassword));
  return res.json(users);
});

router.get("/:id", requirePermission("users:view"), async (req, res) => {
  const includeAllottedPassword = canViewAllottedPasswords(req);

  if (isMongoConfigured()) {
    const user = await UserAccountModel.findOne({ id: req.params.id })
      .select("-passwordHash")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(await loadMongoLinkedProfile(user as Record<string, unknown>, includeAllottedPassword));
  }

  const user = db.userAccounts.find((entry) => entry.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json(attachLinkedProfile(user, undefined, undefined, includeAllottedPassword));
});

router.post("/", requirePermission("users:create"), async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const email = normalizeEmailInput(String(req.body?.email ?? ""));
  const role = (String(req.body?.role ?? "staff") as UserRole) || "staff";
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

  if (!managedLoginRoles.includes(role)) {
    return res.status(400).json({
      message: "Admin can create only manager, HR, rider, and staff logins. Customer accounts stay private to customers.",
    });
  }

  const existing = isMongoConfigured()
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
    adminVisiblePassword: password || "changeme123",
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
    if (isMongoConfigured()) {
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

    if (isMongoConfigured()) {
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

  if (isMongoConfigured()) {
    const created = await UserAccountModel.create(nextUser);
    return res.status(201).json(sanitizeUser(created.toObject(), canViewAllottedPasswords(req)));
  }

  db.userAccounts.push(nextUser as typeof db.userAccounts[number]);
  return res.status(201).json(attachLinkedProfile(nextUser, undefined, undefined, canViewAllottedPasswords(req)));
});

router.patch("/:id", requirePermission("users:update"), async (req, res) => {
  const allowedRoles: UserRole[] = managedLoginRoles;

  if (isMongoConfigured()) {
    const user = await UserAccountModel.findOne({ id: req.params.id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = user.toObject() as Record<string, unknown>;
    const nextRole = String(req.body?.role ?? currentUser.role ?? "user") as UserRole;

    if (isPrimaryAdminAccount(currentUser)) {
      if (nextRole !== "admin") {
        return res.status(400).json({ message: "The primary admin role is locked." });
      }
    } else if (!allowedRoles.includes(nextRole)) {
      return res.status(400).json({ message: "Only manager, HR, rider, and staff roles can be assigned here." });
    }

    const nextStatus = String(req.body?.status ?? currentUser.status ?? "Active");
    const nextName = String(req.body?.name ?? currentUser.name ?? "").trim() || String(currentUser.name ?? "");
    const nextPhone = req.body?.phone !== undefined ? String(req.body.phone).trim() : String(currentUser.phone ?? "");
    const nextShift = String(req.body?.shift ?? roleShiftMap[nextRole] ?? "Morning").trim();
    const nextDepartment = String(req.body?.department ?? roleDepartmentMap[nextRole] ?? "").trim();
    const nextSalary = Math.max(0, Number(req.body?.salary ?? 0));
    const nextAddress = String(req.body?.address ?? "").trim();
    const nextEmergencyContact = String(req.body?.emergencyContact ?? "").trim();

    user.name = nextName;
    user.role = nextRole;
    user.status = nextStatus;
    user.phone = nextPhone;
    if (req.body?.password) {
      user.passwordHash = hashPassword(String(req.body.password));
      user.adminVisiblePassword = String(req.body.password);
    }
    user.avatarInitials = buildInitials(nextName);

    if (isStaffRole(nextRole)) {
      if (!Number(user.staffMemberId ?? 0)) {
        const latest = await StaffModel.findOne().sort({ id: -1 }).select("id").lean();
        const staffId = Number(latest?.id ?? 0) + 1;
        await StaffModel.create(
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
        await StaffModel.findOneAndUpdate(
          { id: Number(user.staffMemberId) },
          {
            name: nextName,
            email: String(user.email),
            phone: nextPhone,
            role: roleLabelMap[nextRole],
            status: toStaffStatus(nextStatus),
            shift: nextShift,
            department: nextDepartment,
            salary: nextSalary,
            address: nextAddress,
            emergencyContact: nextEmergencyContact,
            userAccountId: String(user.id),
          },
          { runValidators: true },
        );
      }
    }

    await user.save();
    return res.json(await loadMongoLinkedProfile(
      user.toObject() as Record<string, unknown>,
      canViewAllottedPasswords(req),
    ));
  }

  const user = db.userAccounts.find((entry) => entry.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const nextRole = String(req.body?.role ?? user.role ?? "user") as UserRole;
  if (isPrimaryAdminAccount(user)) {
    if (nextRole !== "admin") {
      return res.status(400).json({ message: "The primary admin role is locked." });
    }
  } else if (!allowedRoles.includes(nextRole)) {
    return res.status(400).json({ message: "Only manager, HR, rider, and staff roles can be assigned here." });
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
    user.adminVisiblePassword = String(req.body.password);
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

  return res.json(attachLinkedProfile(user, undefined, undefined, canViewAllottedPasswords(req)));
});

router.delete("/:id", requirePermission("users:delete"), async (req, res) => {
  if (isMongoConfigured()) {
    const target = await UserAccountModel.findOne({ id: req.params.id }).lean();
    if (isPrimaryAdminAccount(target as Record<string, unknown> | null)) {
      return res.status(400).json({ message: "The primary admin account cannot be deleted." });
    }

    const deleted = await UserAccountModel.findOneAndDelete({ id: req.params.id })
      .select("-passwordHash -adminVisiblePassword")
      .lean();

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    await StaffModel.deleteOne({
      $or: [
        { id: Number(deleted.staffMemberId ?? 0) },
        { userAccountId: String(deleted.id ?? "") },
      ],
    });

    if (String(deleted.customerProfileId ?? "")) {
      await CustomerModel.deleteOne({ id: String(deleted.customerProfileId) });
    }

    return res.json({ message: "User deleted", user: deleted });
  }

  const index = db.userAccounts.findIndex((entry) => entry.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  if (isPrimaryAdminAccount(db.userAccounts[index])) {
    return res.status(400).json({ message: "The primary admin account cannot be deleted." });
  }

  const [deleted] = db.userAccounts.splice(index, 1);

  const staffIndex = db.staff.findIndex(
    (member) =>
      Number(member.id) === Number(deleted.staffMemberId) ||
      String(member.userAccountId ?? "") === String(deleted.id),
  );
  if (staffIndex !== -1) {
    db.staff.splice(staffIndex, 1);
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
