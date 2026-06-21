import express from "express";
import { hashPassword, normalizeEmailInput, requirePermission } from "../auth/auth.service";
import { db } from "../../core/db";
import { StaffModel, UserAccountModel } from "../../core/models";
import { isMongoConfigured } from "../../core/mongo";
import type { UserRole } from "../../core/permissions";

const router = express.Router();

const buildInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.trim()[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

const inferLoginRole = (role: string): UserRole => {
  const normalizedRole = role.toLowerCase();
  if (normalizedRole.includes("manager")) return "manager";
  if (normalizedRole.includes("human resources") || normalizedRole === "hr") return "hr";
  if (normalizedRole.includes("rider") || normalizedRole.includes("delivery")) return "rider";
  return "staff";
};

const toUserStatus = (status: string) => (status === "Inactive" ? "Suspended" : "Active");

type LoginSyncOptions = {
  createLogin?: boolean;
  loginPassword?: string;
};

type LoginSyncResult =
  | { ok: true; userAccountId?: string }
  | { ok: false; status: number; message: string };

const getLoginPassword = (body: Record<string, unknown>) =>
  String(body.loginPassword ?? body.password ?? "").trim();

const wantsLoginAccount = (body: Record<string, unknown>, loginPassword: string) =>
  body.allotLogin === true || body.createLogin === true || Boolean(loginPassword);

const stripLoginFields = (body: Record<string, unknown>) => {
  const { allotLogin, createLogin, loginPassword, password, ...staffFields } = body;
  return staffFields;
};

const buildLoginRecord = (member: Record<string, unknown>, loginPassword: string) => {
  const name = String(member.name ?? "").trim();
  const nowYear = new Date().getFullYear().toString();

  return {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    email: normalizeEmailInput(String(member.email ?? "")),
    passwordHash: hashPassword(loginPassword),
    adminVisiblePassword: loginPassword,
    role: inferLoginRole(String(member.role ?? "")),
    provider: "email",
    status: toUserStatus(String(member.status ?? "Active")),
    phone: String(member.phone ?? ""),
    staffMemberId: Number(member.id ?? 0),
    memberSince: nowYear,
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
};

const syncMongoLinkedLogin = async (
  member: Record<string, unknown>,
  options: LoginSyncOptions = {},
): Promise<LoginSyncResult> => {
  const staffId = Number(member.id ?? 0);
  if (!staffId) return { ok: true };

  const userAccountId = String(member.userAccountId ?? "");
  const staffEmail = normalizeEmailInput(String(member.email ?? ""));
  const account =
    (userAccountId ? await UserAccountModel.findOne({ id: userAccountId }) : null) ??
    (await UserAccountModel.findOne({ staffMemberId: staffId })) ??
    (staffEmail ? await UserAccountModel.findOne({ email: staffEmail }) : null);

  if (account && options.createLogin) {
    const belongsToMember =
      String(account.id ?? "") === userAccountId || Number(account.staffMemberId ?? 0) === staffId;
    if (!belongsToMember) {
      return { ok: false, status: 409, message: "This email is already linked with another login." };
    }
  }

  if (!account) {
    if (!options.createLogin) return { ok: true };
    if (!staffEmail.includes("@")) {
      return { ok: false, status: 400, message: "Staff email is required before allotting login access." };
    }
    if (String(options.loginPassword ?? "").length < 6) {
      return { ok: false, status: 400, message: "Temporary login password must be at least 6 characters." };
    }

    const duplicate = await UserAccountModel.findOne({ email: staffEmail }).lean();
    if (duplicate) {
      return { ok: false, status: 409, message: "This email is already linked with another login." };
    }

    const createdAccount = await UserAccountModel.create(buildLoginRecord(member, String(options.loginPassword)));
    await StaffModel.updateOne({ id: staffId }, { $set: { userAccountId: String(createdAccount.id) } });
    return { ok: true, userAccountId: String(createdAccount.id) };
  }

  if (options.loginPassword && options.loginPassword.length < 6) {
    return { ok: false, status: 400, message: "Temporary login password must be at least 6 characters." };
  }

  if (staffEmail && staffEmail !== String(account.email)) {
    const duplicate = await UserAccountModel.findOne({
      email: staffEmail,
      id: { $ne: String(account.id) },
    }).lean();

    if (duplicate) {
      return { ok: false, status: 409, message: "This email is already linked with another login." };
    }

    account.email = staffEmail;
  }

  const name = String(member.name ?? account.name ?? "").trim();
  account.name = name;
  account.phone = String(member.phone ?? "");
  account.role = inferLoginRole(String(member.role ?? ""));
  account.status = toUserStatus(String(member.status ?? "Active"));
  account.staffMemberId = staffId;
  account.avatarInitials = buildInitials(name);
  if (options.loginPassword) {
    account.passwordHash = hashPassword(options.loginPassword);
    account.adminVisiblePassword = options.loginPassword;
  }
  await account.save();

  if (String(member.userAccountId ?? "") !== String(account.id)) {
    await StaffModel.updateOne({ id: staffId }, { $set: { userAccountId: String(account.id) } });
  }

  return { ok: true, userAccountId: String(account.id) };
};

const syncMemoryLinkedLogin = (
  member: Record<string, unknown>,
  options: LoginSyncOptions = {},
): LoginSyncResult => {
  const staffId = Number(member.id ?? 0);
  if (!staffId) return { ok: true };

  const userAccountId = String(member.userAccountId ?? "");
  const staffEmail = normalizeEmailInput(String(member.email ?? ""));
  const account = db.userAccounts.find(
    (user) =>
      (userAccountId && String(user.id) === userAccountId) ||
      Number(user.staffMemberId ?? 0) === staffId ||
      (staffEmail && String(user.email).toLowerCase() === staffEmail),
  );

  if (account && options.createLogin) {
    const belongsToMember =
      String(account.id ?? "") === userAccountId || Number(account.staffMemberId ?? 0) === staffId;
    if (!belongsToMember) {
      return { ok: false, status: 409, message: "This email is already linked with another login." };
    }
  }

  if (!account) {
    if (!options.createLogin) return { ok: true };
    if (!staffEmail.includes("@")) {
      return { ok: false, status: 400, message: "Staff email is required before allotting login access." };
    }
    if (String(options.loginPassword ?? "").length < 6) {
      return { ok: false, status: 400, message: "Temporary login password must be at least 6 characters." };
    }
    const duplicate = db.userAccounts.find((user) => String(user.email).toLowerCase() === staffEmail);
    if (duplicate) {
      return { ok: false, status: 409, message: "This email is already linked with another login." };
    }

    const record = buildLoginRecord(member, String(options.loginPassword));
    db.userAccounts.push(record as typeof db.userAccounts[number]);
    member.userAccountId = String(record.id);
    return { ok: true, userAccountId: String(record.id) };
  }

  if (options.loginPassword && options.loginPassword.length < 6) {
    return { ok: false, status: 400, message: "Temporary login password must be at least 6 characters." };
  }

  const emailOwner = staffEmail
    ? db.userAccounts.find(
        (user) => String(user.email).toLowerCase() === staffEmail && String(user.id) !== String(account.id),
      )
    : null;
  if (staffEmail) {
    if (emailOwner) {
      return { ok: false, status: 409, message: "This email is already linked with another login." };
    }
    account.email = staffEmail;
  }

  const name = String(member.name ?? account.name ?? "").trim();
  account.name = name;
  account.phone = String(member.phone ?? "");
  account.role = inferLoginRole(String(member.role ?? ""));
  account.status = toUserStatus(String(member.status ?? "Active"));
  account.staffMemberId = staffId;
  account.avatarInitials = buildInitials(name);
  if (options.loginPassword) {
    account.passwordHash = hashPassword(options.loginPassword);
    account.adminVisiblePassword = options.loginPassword;
  }
  member.userAccountId = String(account.id);
  return { ok: true, userAccountId: String(account.id) };
};

router.get("/", requirePermission("hr:view"), async (req, res) => {
  if (isMongoConfigured()) {
    const staff = await StaffModel.find().sort({ id: 1 }).lean();
    return res.json(staff);
  }

  res.json(db.staff);
});

router.post("/", requirePermission("hr:create"), async (req, res) => {
  const loginPassword = getLoginPassword(req.body ?? {});
  const createLogin = wantsLoginAccount(req.body ?? {}, loginPassword);
  const staffBody = stripLoginFields(req.body ?? {});

  if (isMongoConfigured()) {
    const latest = await StaffModel.findOne().sort({ id: -1 }).select("id").lean();
    const newStaff = {
      ...staffBody,
      id: (latest?.id ?? 0) + 1,
      joinDate: req.body.joinDate ?? new Date().toISOString().slice(0, 10),
    };

    const created = await StaffModel.create(newStaff);
    const syncResult = await syncMongoLinkedLogin(created.toObject(), { createLogin, loginPassword });
    if ("status" in syncResult) {
      await StaffModel.deleteOne({ id: Number(created.id) });
      return res.status(syncResult.status).json({ message: syncResult.message });
    }

    return res.status(201).json({
      ...created.toObject(),
      userAccountId: syncResult.userAccountId ?? String(created.userAccountId ?? ""),
    });
  }

  const newStaff = {
    ...staffBody,
    id: db.staff.reduce((max, member) => Math.max(max, Number(member.id) || 0), 0) + 1,
    joinDate: req.body.joinDate ?? new Date().toISOString().slice(0, 10),
  } as Record<string, unknown>;
  db.staff.push(newStaff as typeof db.staff[number]);
  const syncResult = syncMemoryLinkedLogin(newStaff, { createLogin, loginPassword });
  if ("status" in syncResult) {
    const createdIndex = db.staff.findIndex((member) => Number(member.id) === Number(newStaff.id));
    if (createdIndex !== -1) db.staff.splice(createdIndex, 1);
    return res.status(syncResult.status).json({ message: syncResult.message });
  }

  res.status(201).json({ ...newStaff, userAccountId: syncResult.userAccountId ?? String(newStaff.userAccountId ?? "") });
});

router.patch("/:id", requirePermission("hr:update"), async (req, res) => {
  const loginPassword = getLoginPassword(req.body ?? {});
  const createLogin = wantsLoginAccount(req.body ?? {}, loginPassword);
  const staffBody = stripLoginFields(req.body ?? {});

  if (isMongoConfigured()) {
    const updated = await StaffModel.findOneAndUpdate(
      { id: Number(req.params.id) },
      staffBody,
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Staff member not found." });
    }

    const syncResult = await syncMongoLinkedLogin(updated as Record<string, unknown>, { createLogin, loginPassword });
    if ("status" in syncResult) {
      return res.status(syncResult.status).json({ message: syncResult.message });
    }

    return res.json({
      ...updated,
      userAccountId: syncResult.userAccountId ?? String(updated.userAccountId ?? ""),
    });
  }

  const id = Number(req.params.id);
  const index = db.staff.findIndex((member) => Number(member.id) === id);

  if (index === -1) {
    return res.status(404).json({ message: "Staff member not found." });
  }

  db.staff[index] = {
    ...db.staff[index],
    ...staffBody,
    id: db.staff[index].id,
  };
  const syncResult = syncMemoryLinkedLogin(db.staff[index], { createLogin, loginPassword });
  if ("status" in syncResult) {
    return res.status(syncResult.status).json({ message: syncResult.message });
  }

  return res.json({
    ...db.staff[index],
    userAccountId: syncResult.userAccountId ?? String(db.staff[index].userAccountId ?? ""),
  });
});

router.delete("/:id", requirePermission("hr:delete"), async (req, res) => {
  if (isMongoConfigured()) {
    const deleted = await StaffModel.findOneAndDelete({ id: Number(req.params.id) }).lean();

    if (!deleted) {
      return res.status(404).json({ message: "Staff member not found." });
    }

    await UserAccountModel.deleteOne({
      $or: [
        { staffMemberId: Number(deleted.id) },
        { id: String(deleted.userAccountId ?? "") },
      ],
    });

    return res.json({ message: "Staff member deleted.", staff: deleted });
  }

  const id = Number(req.params.id);
  const index = db.staff.findIndex((member) => Number(member.id) === id);

  if (index === -1) {
    return res.status(404).json({ message: "Staff member not found." });
  }

  const [deleted] = db.staff.splice(index, 1);
  const linkedLoginIndex = db.userAccounts.findIndex(
    (user) =>
      Number(user.staffMemberId ?? 0) === Number(deleted.id) ||
      String(user.id) === String(deleted.userAccountId ?? ""),
  );
  if (linkedLoginIndex !== -1) {
    db.userAccounts.splice(linkedLoginIndex, 1);
  }

  return res.json({ message: "Staff member deleted.", staff: deleted });
});

export default router;
