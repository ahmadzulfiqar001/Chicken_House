import { db } from "../../core/db";
import { AssistantConversationModel, MenuModel, OrderModel } from "../../core/models";
import { isMongoConnected } from "../../core/mongo";

export type AssistantMessage =
  | { type: "text"; text: string }
  | { type: "image"; text: string; imageUrl: string }
  | { type: "cta"; text: string; href: string; label: string };

export type AssistantResponse = {
  intent: string;
  messages: AssistantMessage[];
  suggestedReplies: string[];
};

const LOCATION_TEXT =
  "Chicken House is located near Mitchell's Fair Price Shop, GT Road, Renala Khurd, Okara, Punjab, Pakistan.";
const HOURS_TEXT =
  "We are open 7 days a week from 11:00 AM to 12:00 AM.";
const WHATSAPP_TEXT = "For WhatsApp, call or chat at +92 333 4880840.";

const normalize = (value: string) => value.toLowerCase().trim();

const getMenuItems = async () => {
  if (isMongoConnected()) {
    return MenuModel.find().lean();
  }

  return db.menu;
};

const getOrders = async () => {
  if (isMongoConnected()) {
    return OrderModel.find().lean();
  }

  return db.orders;
};

const getAssistantSessions = async () => {
  if (isMongoConnected()) {
    return AssistantConversationModel.find().sort({ updatedAt: -1 }).lean();
  }

  return [...db.assistantConversations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
};

const topRecommendations = (menuItems: any[]) =>
  menuItems.filter((item) => item.status === "Active" && item.recommended).slice(0, 4);

const featuredImages = (menuItems: any[]) =>
  [
    menuItems.find((item) => item.name === "Chicken Karahi"),
    menuItems.find((item) => item.name === "Chicken Biryani"),
    menuItems.find((item) => item.name === "Chicken Tikka"),
    menuItems.find((item) => item.name === "BBQ Chicken Pizza"),
  ].filter(Boolean);

const menuCategorySummary = (menuItems: any[]) =>
  Array.from(new Set(menuItems.filter((item) => item.status === "Active").map((item) => item.category)))
    .slice(0, 8)
    .join(", ");

const recommendationText = (menuItems: any[]) =>
  topRecommendations(menuItems)
    .map((item) => `${item.name} - from PKR ${Math.min(...item.variants.map((variant: any) => variant.price))}`)
    .join(", ");

const buildWelcomeResponse = (menuItems: any[]): AssistantResponse => ({
  intent: "welcome",
  messages: [
    {
      type: "text",
      text:
        "Assalam o Alaikum. Welcome to Chicken House. I can guide you with our location, menu, food pictures, platter suggestions, booking, timings, and order help.",
    },
    {
      type: "text",
      text: `${LOCATION_TEXT} ${HOURS_TEXT}`,
    },
    {
      type: "text",
      text:
        `Our active menu covers ${menuCategorySummary(menuItems)}. If you want, I can show menu categories first or directly share food pictures and recommendations.`,
    },
    ...featuredImages(menuItems).slice(0, 3).map((item) => ({
      type: "image" as const,
      text: `${item.name} - one of our highlighted picks at Chicken House.`,
      imageUrl: item.image,
    })),
    {
      type: "text",
      text:
        `Recommended right now: ${recommendationText(menuItems)}. Would you like to make your own platter for 2 persons, 4 persons, or family size?`,
    },
    {
      type: "cta",
      text: "You can also browse the live Chicken House menu on the website.",
      label: "Open Menu",
      href: "/menu",
    },
  ],
  suggestedReplies: [
    "Show menu",
    "Send food pictures",
    "Make my own platter",
    "Share location",
    "Book a table",
  ],
});

const buildLocationResponse = (): AssistantResponse => ({
  intent: "location",
  messages: [
    { type: "text", text: LOCATION_TEXT },
    { type: "text", text: HOURS_TEXT },
    {
      type: "cta",
      text: "Open the contact page for map and details.",
      label: "Open Contact",
      href: "/contact",
    },
  ],
  suggestedReplies: ["Send menu", "Book a table", "WhatsApp number"],
});

const buildMenuResponse = (menuItems: any[]): AssistantResponse => ({
  intent: "menu",
  messages: [
    {
      type: "text",
      text:
        `Our menu includes ${menuCategorySummary(menuItems)}. If you tell me your mood like desi, BBQ, burgers, pizza, pasta, or drinks, I can narrow it down for you.`,
    },
    {
      type: "text",
      text: `Top recommendations: ${recommendationText(menuItems)}.`,
    },
    ...featuredImages(menuItems).map((item) => ({
      type: "image" as const,
      text: `${item.name} - Chicken House featured item.`,
      imageUrl: item.image,
    })),
    {
      type: "text",
      text:
        "Would you like to make your own platter? I can suggest a custom platter with kebabs, tikka, karahi, biryani, fries, dips, and drinks.",
    },
    {
      type: "cta",
      text: "Browse the full live menu with prices.",
      label: "Open Full Menu",
      href: "/menu",
    },
  ],
  suggestedReplies: [
    "Recommend desi items",
    "Recommend BBQ platter",
    "Show burger options",
    "Make my own platter",
  ],
});

const buildPictureResponse = (menuItems: any[]): AssistantResponse => ({
  intent: "pictures",
  messages: [
    ...featuredImages(menuItems).map((item) => ({
      type: "image" as const,
      text: `${item.name} - Chicken House menu visual.`,
      imageUrl: item.image,
    })),
    {
      type: "text",
      text:
        "If you want, I can now recommend a platter around these items according to your budget or group size.",
    },
  ],
  suggestedReplies: ["Make my own platter", "Budget platter", "Family platter"],
});

const buildPlatterResponse = (): AssistantResponse => ({
  intent: "platter",
  messages: [
    {
      type: "text",
      text:
        "Yes, you can make your own Chicken House platter. Here are three easy starting options.",
    },
    {
      type: "text",
      text:
        "2 Person Platter: Chicken Tikka, Chicken Biryani, Fries, Mint Chutney, 2 Drinks.",
    },
    {
      type: "text",
      text:
        "4 Person Platter: Mixed BBQ Platter, Special Biryani, Green Salad, Fries, Raita, 4 Drinks.",
    },
    {
      type: "text",
      text:
        "Family Platter: Mixed BBQ Platter, Special Karahi, Chicken Biryani, Salad, Sauces, Drinks.",
    },
    {
      type: "text",
      text:
        "I also recommend adding Mint Margarita, Fries, Raita, or BBQ Sauce with any platter for a better combo.",
    },
    {
      type: "cta",
      text: "Open the menu to build your order.",
      label: "Build From Menu",
      href: "/menu",
    },
  ],
  suggestedReplies: ["2 person platter", "4 person platter", "Family platter", "Add drinks"],
});

const buildPicturesAndPlatterResponse = (menuItems: any[]): AssistantResponse => ({
  intent: "pictures_platter",
  messages: [
    ...featuredImages(menuItems).map((item) => ({
      type: "image" as const,
      text: `${item.name} - Chicken House menu visual.`,
      imageUrl: item.image,
    })),
    {
      type: "text",
      text:
        "If you want to make your own platter, my best starting recommendation is: Chicken Tikka, Special Biryani, Fries, Mint Chutney, and Drinks.",
    },
    {
      type: "text",
      text:
        "For 4 persons, I recommend Mixed BBQ Platter, Special Karahi or Special Biryani, Salad, Raita, and Mint Margarita.",
    },
    {
      type: "text",
      text:
        "Would you like a budget platter, premium platter, or family platter suggestion next?",
    },
  ],
  suggestedReplies: ["Budget platter", "Premium platter", "Family platter", "Book a table"],
});

const buildRecommendationResponse = (menuItems: any[]): AssistantResponse => ({
  intent: "recommendations",
  messages: [
    {
      type: "text",
      text: `My current Chicken House recommendations are: ${recommendationText(menuItems)}.`,
    },
    {
      type: "text",
      text:
        "If you like desi flavors, go for Chicken Karahi or Special Biryani. If you want grilled flavor, choose Chicken Tikka or Mixed BBQ Platter. If you want something casual, try BBQ Chicken Pizza or a BBQ Chicken Burger.",
    },
  ],
  suggestedReplies: ["Recommend desi", "Recommend BBQ", "Recommend burgers", "Send food pictures"],
});

const buildBookingResponse = (): AssistantResponse => ({
  intent: "booking",
  messages: [
    {
      type: "text",
      text:
        "For table booking, I can guide you to our booking flow. You can book for dine-in, events, rooftop, indoor hall, or outdoor garden.",
    },
    {
      type: "text",
      text: `${HOURS_TEXT} For large gatherings, I recommend booking in advance.`,
    },
    {
      type: "cta",
      text: "Open the Chicken House booking page.",
      label: "Book A Table",
      href: "/booking",
    },
  ],
  suggestedReplies: ["Share location", "Event booking", "Family booking"],
});

const buildOrderTrackingResponse = (message: string, orders: any[]): AssistantResponse => {
  const orderId = message.toUpperCase().match(/ORD-\d+/)?.[0];

  if (orderId) {
    const order = orders.find((item) => item.id === orderId);

    if (order) {
      return {
        intent: "order_tracking",
        messages: [
          {
            type: "text",
            text: `Order ${order.id} for ${order.customer} is currently ${order.status}. Total: PKR ${order.total}. Type: ${order.type}.`,
          },
          {
            type: "text",
            text: `Order time: ${new Date(order.time).toLocaleString("en-PK", {
              dateStyle: "medium",
              timeStyle: "short",
            })}`,
          },
        ],
        suggestedReplies: ["Show menu", "WhatsApp number", "Book a table"],
      };
    }
  }

  return {
    intent: "order_tracking",
    messages: [
      {
        type: "text",
        text:
          "Please share your order ID like ORD-1001 and I will check its current status for you.",
      },
    ],
    suggestedReplies: ["ORD-1001", "Show menu", "WhatsApp number"],
  };
};

const buildContactResponse = (): AssistantResponse => ({
  intent: "contact",
  messages: [
    { type: "text", text: WHATSAPP_TEXT },
    { type: "text", text: LOCATION_TEXT },
    { type: "text", text: HOURS_TEXT },
    {
      type: "cta",
      text: "Open the Chicken House contact page.",
      label: "Open Contact",
      href: "/contact",
    },
  ],
  suggestedReplies: ["Show menu", "Book a table", "Order tracking"],
});

const buildFallbackResponse = (): AssistantResponse => ({
  intent: "fallback",
  messages: [
    {
      type: "text",
      text:
        "I can help with Chicken House menu, recommendations, location, timings, platter building, booking, WhatsApp contact, and order tracking.",
    },
    {
      type: "text",
      text:
        "Try asking something like: show menu, send food pictures, make my own platter, share location, or book a table.",
    },
  ],
  suggestedReplies: [
    "Show menu",
    "Send food pictures",
    "Make my own platter",
    "Share location",
  ],
});

export const getChickenHouseAssistantReply = async (rawMessage = ""): Promise<AssistantResponse> => {
  const message = normalize(rawMessage);
  const menuItems = await getMenuItems();

  if (!message || /(hi|hello|salam|assalam|aoa|hey)/.test(message)) {
    return buildWelcomeResponse(menuItems);
  }

  if (/(how are you|kia haal|kaise ho|kese ho|what's up|whats up)/.test(message)) {
    return {
      intent: "small_talk",
      messages: [
        {
          type: "text",
          text:
            "Alhamdulillah, Chicken House assistant is ready to help. If you're hungry, I can recommend something desi, BBQ, burgers, pizza, or build a platter for you.",
        },
      ],
      suggestedReplies: ["Recommend desi", "Recommend BBQ", "Show menu", "Make my own platter"],
    };
  }

  if (/(where|location|map|address|kidhar|kahaan|visit)/.test(message)) {
    return buildLocationResponse();
  }

  if (/(time|timing|hours|open|close)/.test(message)) {
    return {
      intent: "hours",
      messages: [{ type: "text", text: HOURS_TEXT }],
      suggestedReplies: ["Share location", "Show menu", "Book a table"],
    };
  }

  if (/(track|status|order id|ord-)/.test(message)) {
    return buildOrderTrackingResponse(rawMessage, await getOrders());
  }

  if (/(book|booking|table|reservation|event)/.test(message)) {
    return buildBookingResponse();
  }

  if (/(picture|photo|pic|image)/.test(message) && /(platter|custom|combo|family deal|make my own)/.test(message)) {
    return buildPicturesAndPlatterResponse(menuItems);
  }

  if (/(picture|photo|pic|image)/.test(message)) {
    return buildPictureResponse(menuItems);
  }

  if (/(platter|custom|combo|family deal|make my own)/.test(message)) {
    return buildPlatterResponse();
  }

  if (/(recommend|suggest|best|special)/.test(message)) {
    return buildRecommendationResponse(menuItems);
  }

  if (/(menu|food|prices|price|biryani|karahi|bbq|burger|pizza|pasta|drinks)/.test(message)) {
    return buildMenuResponse(menuItems);
  }

  if (/(whatsapp|phone|contact|number|call)/.test(message)) {
    return buildContactResponse();
  }

  if (/(thanks|thank you|shukriya|jazak)/.test(message)) {
    return {
      intent: "thanks",
      messages: [
        {
          type: "text",
          text:
            "You're welcome. If you want, I can still help you with menu recommendations, platter building, booking, or location.",
        },
      ],
      suggestedReplies: ["Show menu", "Make my own platter", "Book a table"],
    };
  }

  return buildFallbackResponse();
};

export const getChickenHouseWelcomePack = async () => buildWelcomeResponse(await getMenuItems());

type ConversationMessage = {
  id: string;
  role: "customer" | "assistant" | "admin";
  text: string;
  createdAt: string;
};

const createMessage = (
  role: ConversationMessage["role"],
  text: string,
): ConversationMessage => ({
  id: `MSG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  role,
  text,
  createdAt: new Date().toISOString(),
});

export const logAssistantConversation = async ({
  customerName,
  customerNumber,
  adminNumber,
  channel = "WhatsApp",
  customerMessage,
  assistantReply,
}: {
  customerName?: string;
  customerNumber?: string;
  adminNumber?: string;
  channel?: string;
  customerMessage: string;
  assistantReply: AssistantResponse;
}) => {
  const normalizedCustomerNumber = customerNumber?.trim() || "unknown-customer";
  const normalizedAdminNumber = adminNumber?.trim() || "+92 333 4880840";

  if (isMongoConnected()) {
    let session = await AssistantConversationModel.findOne({
      customerNumber: normalizedCustomerNumber,
      adminNumber: normalizedAdminNumber,
    });

    if (!session) {
      session = await AssistantConversationModel.create({
        id: `CHAT-${Date.now()}`,
        customerName: customerName?.trim() || "Walk-in Customer",
        customerNumber: normalizedCustomerNumber,
        adminNumber: normalizedAdminNumber,
        channel,
        status: "Bot Active",
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      });
    }

    session.customerName = customerName?.trim() || session.customerName;
    session.updatedAt = new Date().toISOString();
    session.messages.push(createMessage("customer", customerMessage));

    assistantReply.messages.forEach((message) => {
      const payload =
        message.type === "text"
          ? message.text
          : message.type === "image"
            ? `${message.text} | Image: ${message.imageUrl}`
            : `${message.text} | CTA: ${message.label} (${message.href})`;

      session!.messages.push(createMessage("assistant", payload));
    });

    await session.save();
    return session.toObject();
  }

  let session = db.assistantConversations.find(
    (entry) =>
      entry.customerNumber === normalizedCustomerNumber &&
      entry.adminNumber === normalizedAdminNumber,
  );

  if (!session) {
    session = {
      id: `CHAT-${Date.now()}`,
      customerName: customerName?.trim() || "Walk-in Customer",
      customerNumber: normalizedCustomerNumber,
      adminNumber: normalizedAdminNumber,
      channel,
      status: "Bot Active",
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };

    db.assistantConversations.unshift(session);
  }

  session.customerName = customerName?.trim() || session.customerName;
  session.updatedAt = new Date().toISOString();
  session.messages.push(createMessage("customer", customerMessage));

  assistantReply.messages.forEach((message) => {
    const payload =
      message.type === "text"
        ? message.text
        : message.type === "image"
          ? `${message.text} | Image: ${message.imageUrl}`
          : `${message.text} | CTA: ${message.label} (${message.href})`;

    session!.messages.push(createMessage("assistant", payload));
  });

  return session;
};

export const getAssistantConversations = async () => getAssistantSessions();
