import express from "express";
import { db } from "../../core/db";
import {
  clearAuthCookie,
  createCustomerProfile,
  createSessionForUser,
  deactivateSession,
  findAccountByEmail,
  getAuthenticatedUser,
  hashPassword,
  normalizeAccountPayload,
  normalizeEmailInput,
  setAuthCookie,
  verifyPassword,
} from "./auth.service";
import { UserAccountModel } from "../../core/models";
import { isMongoConnected } from "../../core/mongo";

const router = express.Router();

router.get("/me", async (req, res) => {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    return res.status(401).json({ message: "No active session." });
  }

  return res.json({ user });
});

router.post("/login", async (req, res) => {
  const email = normalizeEmailInput(String(req.body?.email ?? ""));
  const password = String(req.body?.password ?? "");

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const account = await findAccountByEmail(email);

  if (!account || !verifyPassword(password, String(account.passwordHash ?? ""))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const user = normalizeAccountPayload(account as Record<string, unknown>);
  const token = await createSessionForUser(req, user);
  setAuthCookie(res, token);

  return res.json({ user });
});

router.post("/signup", async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const email = normalizeEmailInput(String(req.body?.email ?? ""));
  const password = String(req.body?.password ?? "");
  const phone = String(req.body?.phone ?? "").trim();

  if (name.length < 2) {
    return res.status(400).json({ message: "Please enter your full name." });
  }

  if (!email.includes("@")) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  const existing = await findAccountByEmail(email);

  if (existing) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const customerProfileId = `customer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const accountRecord = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    email,
    passwordHash: hashPassword(password),
    role: "user" as const,
    provider: "email" as const,
    status: "Active" as const,
    phone,
    memberSince: new Date().getFullYear().toString(),
    emailVerified: false,
    lastLoginAt: "",
    avatarUrl: "",
    avatarInitials: name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    customerProfileId,
    preferences: {
      notifications: true,
      promotions: true,
      orderUpdates: true,
      language: "en",
      theme: "restaurant-dark",
    },
  };

  if (isMongoConnected()) {
    await UserAccountModel.create(accountRecord);
  } else {
    db.userAccounts.push(accountRecord);
  }

  await createCustomerProfile({
    id: customerProfileId,
    name,
    email,
    phone,
  });

  const user = normalizeAccountPayload(accountRecord);
  const token = await createSessionForUser(req, user);
  setAuthCookie(res, token);

  return res.status(201).json({ user });
});

router.post("/logout", async (req, res) => {
  await deactivateSession(req);
  clearAuthCookie(res);
  return res.json({ message: "Logged out successfully." });
});

export default router;
