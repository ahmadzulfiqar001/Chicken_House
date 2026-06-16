// Source for the Vercel serverless function. This file is BUNDLED (esbuild) into a
// single self-contained `api/index.js` at build time — see `build:api` in package.json.
//
// Why bundle: Vercel transpiles each .ts to .js but keeps the extensionless relative
// imports, which Node's native ESM loader cannot resolve at runtime
// (ERR_MODULE_NOT_FOUND: Cannot find module '/var/task/backend/src/app'). Bundling
// inlines the whole backend into one file, so only bare node_modules imports remain.
//
// No Socket.IO / change streams / Vite here — realtime uses the client-side polling
// fallback in frontend/src/lib/realtime.ts.

import { createApp } from "./src/app";
import { connectToMongo, isMongoConnected } from "./src/core/mongo";

type Handler = (req: unknown, res: unknown) => void;

let app: Handler | undefined;
// Cached across warm invocations; concurrent cold-start callers await the same promise.
let ready: Promise<unknown> | undefined;

// On a cold instance the first Atlas connect can resolve before the socket is actually
// ready (or fail transiently while DNS warms up), which would make that first request
// silently fall back to in-memory demo data. So we wait/retry until the connection is
// genuinely established before serving — cold requests stay slow-but-correct, warm
// requests hit the fast path and return immediately.
async function ensureMongo() {
  if (!process.env.MONGODB_URI) return; // no URI => intentional in-memory mode
  if (isMongoConnected()) return; // warm instance, already connected
  for (let attempt = 0; attempt < 4 && !isMongoConnected(); attempt++) {
    if (!ready) ready = connectToMongo();
    try {
      await ready;
    } catch {
      /* connectToMongo never throws, but guard anyway */
    }
    if (isMongoConnected()) break;
    ready = undefined; // failed/incomplete — allow a fresh attempt
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

export default async function handler(req: unknown, res: unknown) {
  try {
    if (!app) app = createApp() as unknown as Handler;
    await ensureMongo();
    // Do NOT read req.body/query/cookies before Express — express.json({verify})
    // must read the stream first to capture rawBody for the WhatsApp HMAC check.
    return app(req, res);
  } catch (err) {
    app = undefined;
    ready = undefined; // let the next request retry a cold init
    const e = err as { message?: string; stack?: string };
    const r = res as {
      statusCode?: number;
      setHeader?: (k: string, v: string) => void;
      end?: (s: string) => void;
    };
    try {
      r.statusCode = 500;
      r.setHeader?.("content-type", "application/json");
      r.end?.(
        JSON.stringify({
          diagnostic: true,
          message: "Function init failed",
          error: String(e?.message ?? err),
          stack: String(e?.stack ?? "").split("\n").slice(0, 25),
        }),
      );
    } catch {
      /* response already gone */
    }
  }
}
