type OutboundMessage =
  | { type: "text"; text: string }
  | { type: "image"; text: string; imageUrl: string };

const GRAPH_API_VERSION = "v22.0";

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
