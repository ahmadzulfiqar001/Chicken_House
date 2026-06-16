// Vercel serverless entry. Imports are LAZY (inside the handler) so that:
//  (1) api/index.ts itself always loads cleanly (no top-level cross-dir import
//      that could fail to resolve in Vercel's bundled ESM runtime), and
//  (2) any init error (module load, Mongo connect, etc.) is CAUGHT and surfaced
//      in the response instead of an opaque FUNCTION_INVOCATION_FAILED.
// No Socket.IO / change streams / Vite here — realtime uses the client polling
// fallback in frontend/src/lib/realtime.ts.

type Handler = (req: unknown, res: unknown) => void;

// Cached across warm invocations; concurrent cold-start callers await the same promise.
let appPromise: Promise<Handler> | undefined;

async function buildApp(): Promise<Handler> {
  const { createApp } = await import("../backend/src/app");
  const { connectToMongo } = await import("../backend/src/core/mongo");
  const app = createApp() as unknown as Handler;
  await connectToMongo();
  return app;
}

export default async function handler(req: unknown, res: unknown) {
  try {
    if (!appPromise) appPromise = buildApp();
    const app = await appPromise;
    // Do NOT read req.body/query/cookies before Express — express.json({verify})
    // must read the stream first to capture rawBody for the WhatsApp HMAC check.
    return app(req, res);
  } catch (err) {
    appPromise = undefined; // let the next request retry a cold init
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
