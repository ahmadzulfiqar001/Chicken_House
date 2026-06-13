import express from "express";
import { normalizeEmailInput, requirePermission } from "../auth/auth.service";
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

const syncMongoLinkedLogin = async (member: Record<string, unknown>) => {
  const staffId = Number(member.id ?? 0);
  if (!staffId) return;

  const userAccountId = String(member.userAccountId ?? "");
  const staffEmail = normalizeEmailInput(String(member.email ?? ""));
  const account =
    (userAccountId ? await UserAccountModel.findOne({ id: userAccountId }) : null) ??
    (await UserAccountModel.findOne({ staffMemberId: staffId })) ??
    (staffEmail ? await UserAccountModel.findOne({ email: staffEmail }) : null);

  if (!account) return;

  if (staffEmail && staffEmail !== String(account.email)) {
    const duplicate = await UserAccountModel.findOne({
      email: staffEmail,
      id: { $ne: String(account.id) },
    }).lean();

    if (!duplicate) {
      account.email = staffEmail;
    }
  }

  const name = String(member.name ?? account.name ?? "").trim();
  account.name = name;
  account.phone = String(member.phone ?? "");
  account.role = inferLoginRole(String(member.role ?? ""));
  account.status = toUserStatus(String(member.status ?? "Active"));
  account.staffMemberId = staffId;
  account.avatarInitials = buildInitials(name);
  await account.save();

  if (String(member.userAccountId ?? "") !== String(account.id)) {
    await StaffModel.updateOne({ id: staffId }, { $set: { userAccountId: String(account.id) } });
  }
};

const syncMemoryLinkedLogin = (member: Record<string, unknown>) => {
  const staffId = Number(member.id ?? 0);
  if (!staffId) return;

  const userAccountId = String(member.userAccountId ?? "");
  const staffEmail = normalizeEmailInput(String(member.email ?? ""));
  const account = db.userAccounts.find(
    (user) =>
      (userAccountId && String(user.id) === userAccountId) ||
      Number(user.staffMemberId ?? 0) === staffId ||
      (staffEmail && String(user.email).toLowerCase() === staffEmail),
  );

  if (!account) return;

  const emailOwner = staffEmail
    ? db.userAccounts.find(
        (user) => String(user.email).toLowerCase() === staffEmail && String(user.id) !== String(account.id),
      )
    : null;
  if (staffEmail && !emailOwner) {
    account.email = staffEmail;
  }

  const name = String(member.name ?? account.name ?? "").trim();
  account.name = name;
  account.phone = String(member.phone ?? "");
  account.role = inferLoginRole(String(member.role ?? ""));
  account.status = toUserStatus(String(member.status ?? "Active"));
  account.staffMemberId = staffId;
  account.avatarInitials = buildInitials(name);
  member.userAccountId = String(account.id);
};

router.get("/", requirePermission("hr:view"), async (req, res) => {
  if (isMongoConfigured()) {
    const staff = await StaffModel.find().sort({ id: 1 }).lean();
    return res.json(staff);
  }

  res.json(db.staff);
});

router.post("/", requirePermission("hr:create"), async (req, res) => {
  if (isMongoConfigured()) {
    const latest = await StaffModel.findOne().sort({ id: -1 }).select("id").lean();
    const newStaff = {
      ...req.body,
      id: (latest?.id ?? 0) + 1,
      joinDate: req.body.joinDate ?? new Date().toISOString().slice(0, 10),
    };

    const created = await StaffModel.create(newStaff);
    await syncMongoLinkedLogin(created.toObject());
    return res.status(201).json(created.toObject());
  }

  const newStaff = {
    ...req.body,
    id: db.staff.reduce((max, member) => Math.max(max, Number(member.id) || 0), 0) + 1,
    joinDate: req.body.joinDate ?? new Date().toISOString().slice(0, 10),
  };
  db.staff.push(newStaff);
  syncMemoryLinkedLogin(newStaff);
  res.status(201).json(newStaff);
});

router.patch("/:id", requirePermission("hr:update"), async (req, res) => {
  if (isMongoConfigured()) {
    const updated = await StaffModel.findOneAndUpdate(
      { id: Number(req.params.id) },
      req.body,
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Staff member not found." });
    }

    await syncMongoLinkedLogin(updated as Record<string, unknown>);
    return res.json(updated);
  }

  const id = Number(req.params.id);
  const index = db.staff.findIndex((member) => Number(member.id) === id);

  if (index === -1) {
    return res.status(404).json({ message: "Staff member not found." });
  }

  db.staff[index] = {
    ...db.staff[index],
    ...req.body,
    id: db.staff[index].id,
  };
  syncMemoryLinkedLogin(db.staff[index]);

  return res.json(db.staff[index]);
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
