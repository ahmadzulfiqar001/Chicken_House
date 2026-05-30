import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import orderRoutes from "./server/routes/orders";
import inventoryRoutes from "./server/routes/inventory";
import hrRoutes from "./server/routes/hr";
import attendanceRoutes from "./server/routes/attendance";
import leaveRoutes from "./server/routes/leaves";
import payrollRoutes from "./server/routes/payroll";
import shiftRoutes from "./server/routes/shifts";
import performanceRoutes from "./server/routes/performance";
import financeRoutes from "./server/routes/finance";
import menuRoutes from "./server/routes/menu";
import authRoutes from "./server/routes/auth";
import assistantRoutes from "./server/routes/assistant";
import whatsappRoutes from "./server/routes/whatsapp";
import customerRoutes from "./server/routes/customer";
import bookingRoutes from "./server/routes/bookings";
import contactRoutes from "./server/routes/contact";
import usersRoutes from "./server/routes/users";
import staffPanelRoutes from "./server/routes/staff-panel";
import operationsRoutes from "./server/routes/operations";
import { connectToMongo, getMongoHealth, isMongoConnected } from "./server/mongo";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
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
