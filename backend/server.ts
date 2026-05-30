import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import orderRoutes from "./src/routes/orders";
import inventoryRoutes from "./src/routes/inventory";
import hrRoutes from "./src/routes/hr";
import attendanceRoutes from "./src/routes/attendance";
import leaveRoutes from "./src/routes/leaves";
import payrollRoutes from "./src/routes/payroll";
import shiftRoutes from "./src/routes/shifts";
import performanceRoutes from "./src/routes/performance";
import financeRoutes from "./src/routes/finance";
import menuRoutes from "./src/routes/menu";
import authRoutes from "./src/routes/auth";
import assistantRoutes from "./src/routes/assistant";
import whatsappRoutes from "./src/routes/whatsapp";
import customerRoutes from "./src/routes/customer";
import bookingRoutes from "./src/routes/bookings";
import contactRoutes from "./src/routes/contact";
import usersRoutes from "./src/routes/users";
import staffPanelRoutes from "./src/routes/staff-panel";
import operationsRoutes from "./src/routes/operations";
import { connectToMongo, getMongoHealth, isMongoConnected } from "./src/mongo";

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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
