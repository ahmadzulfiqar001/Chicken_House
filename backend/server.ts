import express from "express";
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
import { connectToMongo, getMongoHealth, isMongoConnected } from "./src/core/mongo";
import { initRealtime, startChangeStreams } from "./src/core/realtime";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const frontendRoot = path.join(projectRoot, "frontend");

async function startServer() {
  await connectToMongo();

  const app = express();
  const PORT = 3000;

  app.use(express.json());

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
