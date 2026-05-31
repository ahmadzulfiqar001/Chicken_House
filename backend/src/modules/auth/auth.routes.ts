import express from "express";
import { db } from "../../core/db";
import {
  clearAuthCookie,
  completePasswordReset,
  createCustomerProfile,
  createPasswordResetToken,
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
import { isMongoConfigured } from "../../core/mongo";
import { deliverNotification } from "../notifications/notify.service";

const router = express.Router();

const getRequestOrigin = (req: express.Request) => {
  const configuredOrigin = process.env.APP_ORIGIN?.split(",")[0]?.trim();
  if (configuredOrigin) return configuredOrigin.replace(/\/$/, "");
  return `${req.protocol}://${req.get("host")}`;
};

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

router.post("/forgot-password", async (req, res) => {
  const email = normalizeEmailInput(String(req.body?.email ?? ""));

  if (!email.includes("@")) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  const account = await findAccountByEmail(email);

  if (account && String(account.status ?? "Active") === "Active") {
    const { token, expiresAt } = await createPasswordResetToken(account as Record<string, unknown>);
    const resetUrl = `${getRequestOrigin(req)}/reset-password?token=${encodeURIComponent(token)}`;
    const name = String(account.name ?? "Chicken House customer");

    try {
      const delivery = await deliverNotification({
        channel: "email",
        title: "Reset your Chicken House password",
        message:
          `Hi ${name},\n\nWe received a request to reset your Chicken House account password. ` +
          `Use this secure link within 60 minutes:\n\n${resetUrl}\n\n` +
          `This link expires at ${new Date(expiresAt).toLocaleString("en-PK", {
            dateStyle: "medium",
            timeStyle: "short",
          })}. If you did not request this, you can safely ignore this email.`,
        recipients: [{ email, name }],
      });

      if (delivery.skipped) {
        console.warn("Password reset email was not sent because Resend is not configured.");
      }
      if (delivery.errors.length) {
        console.error("Password reset email delivery failed:", delivery.errors.join("; "));
      }
    } catch (error) {
      console.error("Password reset email delivery failed:", (error as Error).message);
    }
  }

  return res.json({
    message: "If an account exists for that email, a password reset link has been sent.",
  });
});

router.post("/reset-password", async (req, res) => {
  const token = String(req.body?.token ?? "").trim();
  const password = String(req.body?.password ?? "");

  if (token.length < 20) {
    return res.status(400).json({ message: "Reset link is invalid." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  const result = await completePasswordReset(token, password);

  if (!result.ok) {
    return res.status(400).json({ message: result.message });
  }

  return res.json({ message: "Password reset successfully. Please sign in with your new password." });
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

  if (isMongoConfigured()) {
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
