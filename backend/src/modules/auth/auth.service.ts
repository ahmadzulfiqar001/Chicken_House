import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";
import { db } from "../../core/db";
import { AuthSessionModel, CustomerModel, UserAccountModel } from "../../core/models";
import { isMongoConnected } from "../../core/mongo";

const AUTH_COOKIE_NAME = "chicken_house_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

import type { Permission, UserRole } from "../../core/permissions";
import { hasPermission } from "../../core/permissions";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  staffMemberId?: number;
  memberSince?: string;
  phone?: string;
  customerProfileId?: string;
};

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const hashSessionToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const hashPassword = (password: string) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

export const verifyPassword = (password: string, storedHash: string) => {
  const [salt, hash] = storedHash.split(":");

  if (!salt || !hash) {
    return false;
  }

  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
};

const parseCookies = (header?: string) => {
  if (!header) return {};

  return header.split(";").reduce<Record<string, string>>((acc, part) => {
    const [name, ...rest] = part.trim().split("=");
    if (!name) return acc;
    acc[name] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
};

const getCookieToken = (req: Request) => parseCookies(req.headers.cookie)[AUTH_COOKIE_NAME] ?? "";

const sanitizeUser = (user: Record<string, unknown>): AuthUser => ({
  id: String(user.id ?? ""),
  name: String(user.name ?? "Chicken House Guest"),
  email: String(user.email ?? ""),
  role: (user.role as AuthUser["role"]) ?? "user",
  staffMemberId: Number(user.staffMemberId ?? 0) || undefined,
  memberSince: String(user.memberSince ?? ""),
  phone: String(user.phone ?? ""),
  customerProfileId: String(user.customerProfileId ?? ""),
});

const isSessionExpired = (expiresAt?: string) =>
  !expiresAt || Number.isNaN(Date.parse(expiresAt)) || Date.parse(expiresAt) <= Date.now();

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS,
    path: "/",
  });
};

export const clearAuthCookie = (res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
};

export const getAuthenticatedUser = async (req: Request): Promise<AuthUser | null> => {
  const token = getCookieToken(req);

  if (!token) {
    return null;
  }

  const tokenHash = hashSessionToken(token);

  if (isMongoConnected()) {
    const session = await AuthSessionModel.findOne({
      accessTokenHash: tokenHash,
      isActive: true,
    }).lean();

    if (!session || isSessionExpired(String(session.expiresAt ?? ""))) {
      if (session) {
        await AuthSessionModel.updateOne({ id: session.id }, { isActive: false });
      }
      return null;
    }

    const user = await UserAccountModel.findOne({
      id: session.userId,
      status: "Active",
    }).lean();

    if (!user) {
      return null;
    }

    await AuthSessionModel.updateOne(
      { id: session.id },
      { lastSeenAt: new Date().toISOString() },
    );

    return sanitizeUser(user as Record<string, unknown>);
  }

  const session = db.authSessions.find(
    (item) => item.accessTokenHash === tokenHash && item.isActive,
  );

  if (!session || isSessionExpired(String(session.expiresAt ?? ""))) {
    if (session) {
      session.isActive = false;
    }
    return null;
  }

  const user = db.userAccounts.find((item) => item.id === session.userId && item.status === "Active");

  if (!user) {
    return null;
  }

  session.lastSeenAt = new Date().toISOString();

  return sanitizeUser(user);
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    return res.status(401).json({ message: "Please sign in to continue." });
  }

  (req as Request & { authUser?: AuthUser }).authUser = user;
  return next();
};

export const requireRole = (roles: UserRole[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const user =
      (req as Request & { authUser?: AuthUser }).authUser ?? (await getAuthenticatedUser(req));

    if (!user) {
      return res.status(401).json({ message: "Please sign in to continue." });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: "You do not have permission for this action." });
    }

    (req as Request & { authUser?: AuthUser }).authUser = user;
    return next();
  };

/**
 * Middleware to check if user has specific permission
 */
export const requirePermission = (permission: Permission) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const user =
      (req as Request & { authUser?: AuthUser }).authUser ?? (await getAuthenticatedUser(req));

    if (!user) {
      return res.status(401).json({ message: "Please sign in to continue." });
    }

    if (!hasPermission(user.role, permission)) {
      return res.status(403).json({ 
        message: "You do not have permission for this action.",
        required: permission,
        role: user.role,
      });
    }

    (req as Request & { authUser?: AuthUser }).authUser = user;
    return next();
  };

export const getRequestAuthUser = (req: Request) =>
  (req as Request & { authUser?: AuthUser }).authUser ?? null;

export const createSessionForUser = async (req: Request, user: AuthUser) => {
  const accessToken = crypto.randomBytes(32).toString("hex");
  const sessionRecord = {
    id: `SESSION-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId: user.id,
    email: normalizeEmail(user.email),
    role: user.role,
    provider: "email",
    accessTokenHash: hashSessionToken(accessToken),
    refreshTokenHash: "",
    ipAddress: req.ip ?? "",
    userAgent: req.headers["user-agent"] ?? "",
    deviceLabel: "browser",
    isActive: true,
    lastSeenAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  };

  if (isMongoConnected()) {
    await AuthSessionModel.create(sessionRecord);
    await UserAccountModel.updateOne(
      { id: user.id },
      { lastLoginAt: new Date().toISOString() },
    );
  } else {
    db.authSessions.push(sessionRecord);
    const matchedUser = db.userAccounts.find((item) => item.id === user.id);
    if (matchedUser) {
      matchedUser.lastLoginAt = new Date().toISOString();
    }
  }

  return accessToken;
};

export const deactivateSession = async (req: Request) => {
  const token = getCookieToken(req);

  if (!token) {
    return;
  }

  const tokenHash = hashSessionToken(token);

  if (isMongoConnected()) {
    await AuthSessionModel.updateMany(
      { accessTokenHash: tokenHash, isActive: true },
      { isActive: false },
    );
    return;
  }

  db.authSessions.forEach((session) => {
    if (session.accessTokenHash === tokenHash) {
      session.isActive = false;
    }
  });
};

export const findAccountByEmail = async (email: string) => {
  const normalizedEmail = normalizeEmail(email);

  if (isMongoConnected()) {
    return UserAccountModel.findOne({ email: normalizedEmail }).lean();
  }

  return db.userAccounts.find((item) => item.email.toLowerCase() === normalizedEmail) ?? null;
};

export const createCustomerProfile = async ({
  id,
  name,
  email,
  phone,
}: {
  id: string;
  name: string;
  email: string;
  phone?: string;
}) => {
  const customerProfile = {
    id,
    name,
    email: normalizeEmail(email),
    phone: phone ?? "",
    address: "",
    city: "Renala Khurd",
    memberSince: new Date().getFullYear().toString(),
    loyaltyPoints: 0,
    walletBalance: 0,
    favoriteCategory: "House Specials",
    orderCount: 0,
    avatarInitials: name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    preferences: {
      notifications: true,
      promotions: true,
      orderUpdates: true,
      darkAlerts: false,
    },
    addresses: [],
    wishlist: [],
    walletTransactions: [],
    activity: ["Customer account created."],
  };

  if (isMongoConnected()) {
    await CustomerModel.create(customerProfile);
    return customerProfile.id;
  }

  db.customers.push(customerProfile);
  return customerProfile.id;
};

export const normalizeAccountPayload = (user: Record<string, unknown>) => sanitizeUser(user);
export const normalizeEmailInput = normalizeEmail;
