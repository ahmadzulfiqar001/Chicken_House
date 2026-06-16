import { createApp } from "../backend/src/app";
import { connectToMongo } from "../backend/src/core/mongo";

// Build the Express app once per warm instance (no Socket.IO / change streams /
// Vite here — Vercel serves the SPA statically and pushes realtime is replaced by
// the client-side polling fallback in frontend/src/lib/realtime.ts).
const app = createApp();

// Cache the Mongo connect attempt at module scope so concurrent cold-start
// invocations await the same promise instead of opening a connection storm.
let ready: Promise<unknown> | undefined;

export default async function handler(req: unknown, res: unknown) {
  ready ??= connectToMongo();
  await ready;
  // Hand the raw req/res to Express. Do NOT read req.body / req.query / req.cookies
  // here — express.json({ verify }) must read the stream first to capture rawBody
  // for the WhatsApp webhook HMAC check.
  return (app as unknown as (req: unknown, res: unknown) => void)(req, res);
}
