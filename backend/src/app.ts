import "express-async-errors"; // must load first: routes async throws -> error middleware
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import orderRoutes from "./modules/orders/orders.routes";
import inventoryRoutes from "./modules/inventory/inventory.routes";
import hrRoutes from "./modules/hr/hr.routes";
import attendanceRoutes from "./modules/hr/attendance.routes";
import leaveRoutes from "./modules/hr/leaves.routes";
import payrollRoutes from "./modules/hr/payroll.routes";
import shiftRoutes from "./modules/hr/shifts.routes";
import performanceRoutes from "./modules/hr/performance.routes";
import financeRoutes from "./modules/finance/finance.routes";
import menuRoutes from "./modules/menu/menu.routes";
import authRoutes from "./modules/auth/auth.routes";
import assistantRoutes from "./modules/assistant/assistant.routes";
import whatsappRoutes from "./modules/whatsapp/whatsapp.routes";
import customerRoutes from "./modules/customer/customer.routes";
import bookingRoutes from "./modules/bookings/bookings.routes";
import contactRoutes from "./modules/contact/contact.routes";
import usersRoutes from "./modules/users/users.routes";
import staffPanelRoutes from "./modules/hr/staff-panel.routes";
import operationsRoutes from "./modules/operations/operations.routes";
import reviewRoutes from "./modules/reviews/reviews.routes";
import branchRoutes from "./modules/branches/branches.routes";
import promotionRoutes from "./modules/promotions/promotions.routes";
import notificationRoutes from "./modules/notifications/notifications.routes";
import riderRoutes from "./modules/riders/riders.routes";
import settingsRoutes from "./modules/settings/settings.routes";
import securityRoutes from "./modules/security/security.routes";
import newsletterRoutes from "./modules/newsletter/newsletter.routes";
import careerRoutes from "./modules/careers/careers.routes";
import { getMongoHealth, isMongoConnected } from "./core/mongo";

/**
 * Builds the Express application (middleware + all /api routes + error handling).
 * Shared by the long-running server (backend/server.ts, which also attaches Vite,
 * Socket.IO and change streams) and the Vercel serverless function (api/index.ts).
 * It intentionally contains NO listen, NO Mongo connect, NO realtime, NO static/SPA
 * serving — those belong to the host that runs it.
 */
export function createApp() {
  const app = express();
  const isProd = process.env.NODE_ENV === "production";

  // Security headers. CSP/COEP are intentionally left off so the SPA's external
  // assets (menu images, Google Maps embed, fonts) and Vite dev keep working —
  // apply a tuned CSP at the reverse-proxy / CDN layer in production.
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
  // Behind a proxy/CDN in prod so rate-limit & secure cookies see the real IP.
  if (isProd) app.set("trust proxy", 1);

  // Capture the raw body so the WhatsApp webhook can verify its HMAC signature.
  app.use(
    express.json({
      limit: "1mb",
      verify: (req, _res, buf) => {
        (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
      },
    }),
  );

  // Rate limiting: strict on auth (brute-force / credential-stuffing), generous
  // global cap on the API to blunt public-form flooding & email fan-out.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts. Please try again in a few minutes." },
  });
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests. Please slow down." },
  });
  app.use("/api/auth", authLimiter);
  app.use("/api", apiLimiter);

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      message: "Chicken House ERP API is healthy",
      storage: isMongoConnected() ? "mongodb" : "memory",
      mongo: getMongoHealth(),
    });
  });

  // Module Routes
  app.use("/api/orders", orderRoutes);
  app.use("/api/inventory", inventoryRoutes);
  app.use("/api/hr", hrRoutes);
  app.use("/api/attendance", attendanceRoutes);
  app.use("/api/leaves", leaveRoutes);
  app.use("/api/payroll", payrollRoutes);
  app.use("/api/shifts", shiftRoutes);
  app.use("/api/performance", performanceRoutes);
  app.use("/api/finance", financeRoutes);
  app.use("/api/menu", menuRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/customer", customerRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/contact", contactRoutes);
  app.use("/api/assistant", assistantRoutes);
  app.use("/api/whatsapp", whatsappRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/staff-panel", staffPanelRoutes);
  app.use("/api/operations", operationsRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/branches", branchRoutes);
  app.use("/api/promotions", promotionRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/riders", riderRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/security", securityRoutes);
  app.use("/api/newsletter", newsletterRoutes);
  app.use("/api/careers", careerRoutes);

  // Unknown API route -> JSON 404 (don't fall through to the SPA HTML).
  app.use("/api", (_req, res) => {
    res.status(404).json({ message: "Not found." });
  });

  // Central API error handler — clean 500, never leak stack traces to clients.
  app.use(
    "/api",
    (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error("API error:", err?.message ?? err);
      if (res.headersSent) return;
      res.status(500).json({ message: "Something went wrong. Please try again." });
    },
  );

  return app;
}
