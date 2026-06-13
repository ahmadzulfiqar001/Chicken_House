/**
 * Realtime sync layer.
 * - Socket.IO server attached to the HTTP server (path /socket.io).
 * - MongoDB change streams on the key collections; every insert/update/delete
 *   (from this API or any other client) is broadcast to connected dashboards as
 *   "<collection>:change". Requires a replica set — MongoDB Atlas provides one.
 *   In in-memory mode change streams are unavailable, so routes may also call
 *   emitChange() directly to keep the same event contract.
 */
import type { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
import {
  OrderModel,
  BookingRequestModel,
  InventoryModel,
  ContactMessageModel,
  CustomerModel,
  NotificationModel,
} from "./models";
import { isMongoConnected } from "./mongo";

let io: IOServer | null = null;

const WATCHED: Array<{ name: string; model: { watch: (pipeline?: unknown[], options?: unknown) => any } }> = [
  { name: "orders", model: OrderModel as never },
  { name: "bookings", model: BookingRequestModel as never },
  { name: "inventory", model: InventoryModel as never },
  { name: "customers", model: CustomerModel as never },
  { name: "contactMessages", model: ContactMessageModel as never },
  { name: "notifications", model: NotificationModel as never },
];

export const REALTIME_CHANNELS = WATCHED.map((entry) => entry.name);

export const getIO = (): IOServer | null => io;

/** Broadcast a change event to every connected client. */
export const emitChange = (collection: string, payload: Record<string, unknown> = {}) => {
  if (!io) return;
  io.emit(`${collection}:change`, { collection, ...payload });
};

export const initRealtime = (server: HttpServer): IOServer => {
  io = new IOServer(server, {
    path: "/socket.io",
    cors: {
      // Fail closed in production: if APP_ORIGIN is not configured, allow only
      // same-origin (false) rather than reflecting any origin with credentials.
      origin: process.env.APP_ORIGIN
        ? process.env.APP_ORIGIN.split(",").map((o) => o.trim())
        : process.env.NODE_ENV === "production"
          ? false
          : true,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.emit("realtime:ready", { channels: REALTIME_CHANNELS });
  });

  return io;
};

/** Open MongoDB change streams and pipe them to Socket.IO. Safe to call when not connected. */
export const startChangeStreams = () => {
  if (!isMongoConnected()) {
    console.warn("Realtime: MongoDB not connected — change streams disabled (REST + socket still work).");
    return;
  }

  for (const { name, model } of WATCHED) {
    try {
      const stream = model.watch([]);
      stream.on("change", (change: Record<string, any>) => {
        // Broadcast only a non-sensitive change ping (NO document body / PII).
        // Clients refetch via the access-controlled REST API.
        emitChange(name, {
          operationType: change.operationType,
          documentKey: change.documentKey ?? null,
        });
      });
      stream.on("error", (error: Error) => {
        console.error(`Realtime change stream error (${name}):`, error.message);
      });
    } catch (error) {
      console.error(`Realtime: failed to watch ${name}:`, (error as Error).message);
    }
  }

  console.log(`Realtime: live change streams active for ${REALTIME_CHANNELS.join(", ")}.`);
};
