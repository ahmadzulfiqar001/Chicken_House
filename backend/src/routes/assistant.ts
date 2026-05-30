import express from "express";
import {
  getAssistantConversations,
  getChickenHouseAssistantReply,
  getChickenHouseWelcomePack,
  logAssistantConversation,
} from "../chicken-house-assistant";

const router = express.Router();

router.get("/welcome", async (req, res) => {
  res.json(await getChickenHouseWelcomePack());
});

router.get("/conversations", async (req, res) => {
  res.json(await getAssistantConversations());
});

router.post("/inbox", async (req, res) => {
  res.json(await getAssistantConversations());
});

router.post("/chat", async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message : "";
  const assistantReply = await getChickenHouseAssistantReply(message);

  const session = await logAssistantConversation({
    customerMessage: message || "Welcome flow requested",
    assistantReply,
    customerName: req.body?.customerName,
    customerNumber: req.body?.customerNumber,
    adminNumber: req.body?.adminNumber,
    channel: req.body?.channel,
  });

  res.json({
    ...assistantReply,
    sessionId: session.id,
    conversationCount: (await getAssistantConversations()).length,
  });
});

export default router;
