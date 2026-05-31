import crypto from "crypto";

type OutboundMessage =
  | { type: "text"; text: string }
  | { type: "image"; text: string; imageUrl: string };

const GRAPH_API_VERSION = "v22.0";

let warnedNoSecret = false;

/**
 * Verify Meta's X-Hub-Signature-256 over the raw request body using the app
 * secret (META_WA_APP_SECRET). If no secret is configured, verification is
 * skipped (dev / not-yet-configured) — set the secret in production.
 */
export const verifyWhatsAppSignature = (rawBody: Buffer | undefined, signature?: string): boolean => {
  const secret = process.env.META_WA_APP_SECRET?.trim();

  if (!secret) {
    if (!warnedNoSecret) {
      console.warn("WhatsApp webhook signature verification disabled — set META_WA_APP_SECRET to enable it.");
      warnedNoSecret = true;
    }
    return true;
  }

  if (!rawBody || !signature) return false;

  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  return sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
};

const getConfig = () => ({
  accessToken: process.env.META_WA_ACCESS_TOKEN,
  phoneNumberId: process.env.META_WA_PHONE_NUMBER_ID,
});

export const isWhatsAppCloudConfigured = () => {
  const { accessToken, phoneNumberId } = getConfig();
  return Boolean(accessToken && phoneNumberId);
};

const sendPayload = async (payload: Record<string, unknown>) => {
  const { accessToken, phoneNumberId } = getConfig();

  if (!accessToken || !phoneNumberId) {
    return { ok: false as const, skipped: true as const };
  }

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error?.message ?? "Failed to send WhatsApp message.");
  }

  return { ok: true as const, data };
};

export const sendWhatsAppMessages = async (
  to: string,
  messages: OutboundMessage[],
) => {
  const normalizedTo = to.replace(/[^\d]/g, "");
  const results = [];

  for (const message of messages) {
    if (message.type === "text") {
      results.push(
        await sendPayload({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: normalizedTo,
          type: "text",
          text: {
            body: message.text,
          },
        }),
      );
      continue;
    }

    results.push(
      await sendPayload({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: normalizedTo,
        type: "image",
        image: {
          link: message.imageUrl,
          caption: message.text,
        },
      }),
    );
  }

  return results;
};
