// Source for the Vercel serverless function. This file is BUNDLED (esbuild) into a
// single self-contained `api/index.js` at build time — see `build:api` in package.json.
//
// Why bundle: Vercel transpiles each .ts to .js but keeps extensionless relative
// imports, which Node's native ESM loader can't resolve at runtime
// (ERR_MODULE_NOT_FOUND: Cannot find module '/var/task/backend/src/app'). Bundling
// inlines the whole backend into one file, so there are no relative imports left;
// only bare node_modules imports remain (kept external, resolved from node_modules).
//
// No Socket.IO / change streams / Vite here — realtime uses the client-side polling
// fallback in frontend/src/lib/realtime.ts.

import { createApp } from "./src/app";
import { connectToMongo } from "./src/core/mongo";

type Handler = (req: unknown, res: unknown) => void;

let app: Handler | undefined;
// Cached across warm invocations; concurrent cold-start callers await the same promise.
let ready: Promise<unknown> | undefined;

export default async function handler(req: unknown, res: unknown) {
  try {
    if (!app) app = createApp() as unknown as Handler;
    if (!ready) ready = connectToMongo();
    await ready;
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
