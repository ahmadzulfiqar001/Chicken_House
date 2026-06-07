/**
 * Notification delivery service.
 * - Email via the Resend HTTP API (no SDK dependency) when RESEND_API_KEY is set.
 * - WhatsApp / SMS via the existing Meta WhatsApp Cloud sender when configured.
 *
 * Degrades gracefully: a channel that is not configured is reported as `skipped`
 * (mirroring the Groq / WhatsApp graceful-degradation pattern used elsewhere),
 * so the app never crashes just because a key is missing.
 */
import { isWhatsAppCloudConfigured, sendWhatsAppMessages } from "../whatsapp/whatsapp.service";

export type NotifyChannel = "in-app" | "email" | "sms" | "whatsapp";

export type Recipient = { email?: string; phone?: string; name?: string };

export const isResendConfigured = () => Boolean(process.env.RESEND_API_KEY?.trim());

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const sendEmail = async (to: string, subject: string, text: string) => {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { ok: false as const, skipped: true as const };

  const from = process.env.RESEND_FROM?.trim() || "Chicken House <onboarding@resend.dev>";
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#1b1b1b">
    <h2 style="color:#7f1215;margin:0 0 12px">${escapeHtml(subject)}</h2>
    <p>${escapeHtml(text).replace(/\n/g, "<br/>")}</p>
    <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
    <p style="color:#888;font-size:12px">Chicken House, Renala Khurd · You are receiving this because you opted in.</p>
  </div>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data as { message?: string })?.message ?? "Failed to send email via Resend.");
  }
  return { ok: true as const, data };
};

export type DeliverResult = {
  channel: NotifyChannel;
  attempted: number;
  delivered: number;
  skipped: boolean;
  errors: string[];
};

/** Send a notification to a list of recipients over a single channel. */
export const deliverNotification = async (params: {
  channel: NotifyChannel;
  title: string;
  message: string;
  recipients: Recipient[];
}): Promise<DeliverResult> => {
  const { channel, title, message, recipients } = params;
  const result: DeliverResult = { channel, attempted: 0, delivered: 0, skipped: false, errors: [] };

  // In-app notifications are persisted by the caller; count them as delivered
  // so the admin panel does not show a successful in-app notice as "Queued".
  if (channel === "in-app") {
    result.attempted = recipients.length;
    result.delivered = recipients.length;
    return result;
  }

  if (channel === "email") {
    if (!isResendConfigured()) {
      result.skipped = true;
      return result;
    }
    for (const recipient of recipients) {
      if (!recipient.email) continue;
      result.attempted += 1;
      try {
        await sendEmail(recipient.email, title, message);
        result.delivered += 1;
      } catch (error) {
        result.errors.push((error as Error).message);
      }
    }
    return result;
  }

  // SMS currently shares the WhatsApp Cloud channel (no separate SMS gateway wired yet).
  if (channel === "whatsapp" || channel === "sms") {
    if (!isWhatsAppCloudConfigured()) {
      result.skipped = true;
      return result;
    }
    for (const recipient of recipients) {
      if (!recipient.phone) continue;
      result.attempted += 1;
      try {
        await sendWhatsAppMessages(recipient.phone, [{ type: "text", text: `*${title}*\n\n${message}` }]);
        result.delivered += 1;
      } catch (error) {
        result.errors.push((error as Error).message);
      }
    }
    return result;
  }

  result.skipped = true;
  return result;
};
