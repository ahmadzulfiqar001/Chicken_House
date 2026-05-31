import express from "express";
import {
  AssistantResponse,
  getRuleBasedReply,
  logAssistantConversation,
} from "../assistant/assistant.engine";
import {
  isWhatsAppCloudConfigured,
  sendWhatsAppMessages,
  verifyWhatsAppSignature,
} from "./whatsapp.service";

const router = express.Router();

const mapAssistantMessagesToWhatsApp = (
  reply: AssistantResponse,
) =>
  reply.messages
    .map((message) => {
      if (message.type === "text") {
        return { type: "text" as const, text: message.text };
      }

      if (message.type === "image") {
        return {
          type: "image" as const,
          text: message.text,
          imageUrl: message.imageUrl,
        };
      }

      return {
        type: "text" as const,
        text: `${message.text}\n${message.label}: ${message.href}`,
      };
    })
    .slice(0, 8);

router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (
    mode === "subscribe" &&
    token === process.env.META_WA_VERIFY_TOKEN
  ) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

router.post("/webhook", async (req, res) => {
  // Reject forged webhooks: verify Meta's HMAC signature over the raw body.
  const signature = req.headers["x-hub-signature-256"] as string | undefined;
  if (!verifyWhatsAppSignature((req as express.Request & { rawBody?: Buffer }).rawBody, signature)) {
    return res.sendStatus(401);
  }

  try {
    const entries = req.body?.entry ?? [];
    const adminNumber = process.env.META_WA_ADMIN_NUMBER || "+92 333 4880840";

    for (const entry of entries) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        const inboundMessages = value?.messages ?? [];
        const contacts = value?.contacts ?? [];

        for (const inboundMessage of inboundMessages) {
          if (inboundMessage.type !== "text") continue;

          const from = inboundMessage.from;
          const customerText = inboundMessage.text?.body ?? "";
          const customerName =
            contacts.find((contact: any) => contact.wa_id === from)?.profile?.name ||
            "WhatsApp Customer";

          const assistantReply = await getRuleBasedReply(customerText);

          await logAssistantConversation({
            customerMessage: customerText,
            assistantReply,
            customerName,
            customerNumber: from,
            adminNumber,
            channel: "WhatsApp",
          });

          if (isWhatsAppCloudConfigured()) {
            await sendWhatsAppMessages(from, mapAssistantMessagesToWhatsApp(assistantReply));
          }
        }
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("WhatsApp webhook error", error);
    return res.status(500).json({ message: "WhatsApp webhook processing failed." });
  }
});

router.get("/status", (req, res) => {
  res.json({
    configured: isWhatsAppCloudConfigured(),
    adminNumber: process.env.META_WA_ADMIN_NUMBER || "+92 333 4880840",
    verifyTokenConfigured: Boolean(process.env.META_WA_VERIFY_TOKEN),
  });
});

export default router;
