import "express-async-errors"; // must load first: routes async throws -> error middleware
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import http from "http";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import orderRoutes from "./src/modules/orders/orders.routes";
import inventoryRoutes from "./src/modules/inventory/inventory.routes";
import hrRoutes from "./src/modules/hr/hr.routes";
import attendanceRoutes from "./src/modules/hr/attendance.routes";
import leaveRoutes from "./src/modules/hr/leaves.routes";
import payrollRoutes from "./src/modules/hr/payroll.routes";
import shiftRoutes from "./src/modules/hr/shifts.routes";
import performanceRoutes from "./src/modules/hr/performance.routes";
import financeRoutes from "./src/modules/finance/finance.routes";
import menuRoutes from "./src/modules/menu/menu.routes";
import authRoutes from "./src/modules/auth/auth.routes";
import assistantRoutes from "./src/modules/assistant/assistant.routes";
import whatsappRoutes from "./src/modules/whatsapp/whatsapp.routes";
import customerRoutes from "./src/modules/customer/customer.routes";
import bookingRoutes from "./src/modules/bookings/bookings.routes";
import contactRoutes from "./src/modules/contact/contact.routes";
import usersRoutes from "./src/modules/users/users.routes";
import staffPanelRoutes from "./src/modules/hr/staff-panel.routes";
import operationsRoutes from "./src/modules/operations/operations.routes";
import reviewRoutes from "./src/modules/reviews/reviews.routes";
import branchRoutes from "./src/modules/branches/branches.routes";
import promotionRoutes from "./src/modules/promotions/promotions.routes";
import notificationRoutes from "./src/modules/notifications/notifications.routes";
import riderRoutes from "./src/modules/riders/riders.routes";
import settingsRoutes from "./src/modules/settings/settings.routes";
import securityRoutes from "./src/modules/security/security.routes";
import newsletterRoutes from "./src/modules/newsletter/newsletter.routes";
import careerRoutes from "./src/modules/careers/careers.routes";
import { connectToMongo, getMongoHealth, isMongoConnected } from "./src/core/mongo";
import { initRealtime, startChangeStreams } from "./src/core/realtime";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const frontendRoot = path.join(projectRoot, "frontend");

// Safety net: a single failing request must never take down the whole server.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

async function startServer() {
  await connectToMongo();

  const app = express();
  const PORT = 3000;
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: frontendRoot,
      configFile: path.join(frontendRoot, "vite.config.ts"),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(frontendRoot, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Realtime: attach Socket.IO to the HTTP server, then open Mongo change streams.
  const server = http.createServer(app);
  initRealtime(server);
  startChangeStreams();

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
