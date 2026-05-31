import express from "express";
import { requireRole } from "../auth/auth.service";
import { loadAll } from "../../core/store";

const router = express.Router();

// Admin: security overview — active sessions, recent activity, and account metrics.
// Built from real data (auth sessions + activity logs + user accounts); no secrets
// (token hashes) are ever returned.
router.get("/", requireRole(["admin"]), async (_req, res) => {
  const now = Date.now();

  const sessions = (await loadAll("authSessions"))
    .filter((session) => {
      if (!session.isActive) return false;
      const expires = Date.parse(String(session.expiresAt ?? ""));
      return Number.isNaN(expires) || expires > now;
    })
    .map((session) => ({
      id: session.id,
      email: session.email,
      role: session.role,
      ipAddress: session.ipAddress || "—",
      userAgent: session.userAgent || "Unknown device",
      deviceLabel: session.deviceLabel || "browser",
      lastSeenAt: session.lastSeenAt,
      expiresAt: session.expiresAt,
    }))
    .sort((a, b) => Date.parse(String(b.lastSeenAt ?? 0)) - Date.parse(String(a.lastSeenAt ?? 0)));

  const activity = (await loadAll("activityLogs"))
    .slice()
    .sort((a, b) => Date.parse(String(b.createdAt ?? 0)) - Date.parse(String(a.createdAt ?? 0)))
    .slice(0, 25);

  const accounts = await loadAll("userAccounts");
  const lastLoginAt = accounts.reduce((latest, account) => {
    const value = Date.parse(String(account.lastLoginAt ?? ""));
    return Number.isFinite(value) && value > latest ? value : latest;
  }, 0);

  const uniqueIps = new Set(sessions.map((session) => session.ipAddress).filter((ip) => ip && ip !== "—"));

  const metrics = {
    activeSessions: sessions.length,
    uniqueActiveUsers: new Set(sessions.map((session) => session.email)).size,
    uniqueIps: uniqueIps.size,
    totalAccounts: accounts.length,
    suspendedAccounts: accounts.filter((account) => account.status === "Suspended").length,
    lastLoginAt: lastLoginAt ? new Date(lastLoginAt).toISOString() : "",
  };

  return res.json({ sessions, activity, metrics });
});

export default router;
