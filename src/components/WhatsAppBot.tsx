import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bot, Send, X, User, LoaderCircle, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type AssistantMessage =
  | { type: "text"; text: string }
  | { type: "image"; text: string; imageUrl: string }
  | { type: "cta"; text: string; href: string; label: string };

type AssistantPayload = {
  intent: string;
  messages: AssistantMessage[];
  suggestedReplies: string[];
  sessionId?: string;
};

type ChatBubble = {
  id: string;
  role: "customer" | "assistant";
  payload: AssistantMessage;
  time: string;
};

const CHAT_STORAGE_KEY = "chicken_house_web_chat_session";

const readSessionKey = () => {
  if (typeof window === "undefined") return "web-guest";

  const existing = window.localStorage.getItem(CHAT_STORAGE_KEY);
  if (existing) return existing;

  const next = `web-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  window.localStorage.setItem(CHAT_STORAGE_KEY, next);
  return next;
};

const createBubble = (role: ChatBubble["role"], payload: AssistantMessage): ChatBubble => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  role,
  payload,
  time: new Date().toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
  }),
});

const WhatsAppBot = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const [error, setError] = useState("");

  const customerName = user?.name ?? "Website Guest";
  const customerNumber = useMemo(() => readSessionKey(), []);
  const hideWidget = ["/booking", "/cart", "/checkout", "/login", "/signup"].includes(location.pathname);

  useEffect(() => {
    const loadWelcome = async () => {
      setBooting(true);
      setError("");

      try {
        const response = await fetch("/api/assistant/welcome");
        const data = (await response.json()) as AssistantPayload;

        if (!response.ok) {
          throw new Error("Assistant welcome failed.");
        }

        setMessages(data.messages.map((message) => createBubble("assistant", message)));
        setSuggestedReplies(data.suggestedReplies ?? []);
      } catch (welcomeError) {
        console.error(welcomeError);
        setMessages([
          createBubble("assistant", {
            type: "text",
            text: "Chicken House assistant is temporarily unavailable. You can still use WhatsApp for menu, booking, and delivery help.",
          }),
        ]);
        setSuggestedReplies(["Show menu", "Share location", "Book a table"]);
        setError("Assistant is temporarily unavailable.");
      } finally {
        setBooting(false);
      }
    };

    void loadWelcome();
  }, []);

  const sendMessage = async (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed || loading) return;

    const customerBubble = createBubble("customer", {
      type: "text",
      text: trimmed,
    });

    setMessages((prev) => [...prev, customerBubble]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          customerName,
          customerNumber,
          channel: "Website Chatbot",
        }),
      });

      const data = (await response.json()) as AssistantPayload;

      if (!response.ok) {
        throw new Error("Assistant reply failed.");
      }

      setMessages((prev) => [
        ...prev,
        ...data.messages.map((message) => createBubble("assistant", message)),
      ]);
      setSuggestedReplies(data.suggestedReplies ?? []);
    } catch (chatError) {
      console.error(chatError);
      setMessages((prev) => [
        ...prev,
        createBubble("assistant", {
          type: "text",
          text: "The assistant cannot reply right now. Please try again shortly or continue on WhatsApp.",
        }),
      ]);
      setError("Reply temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  if (hideWidget) {
    return null;
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-28 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-primary text-white shadow-2xl shadow-primary/40 sm:bottom-32 sm:right-6 sm:h-16 sm:w-16"
        aria-label="Open Chicken House chatbot"
      >
        <Bot size={26} />
        <div className="absolute -right-1 -top-1 h-4 w-4 animate-pulse rounded-full border-2 border-white bg-green-500" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.7, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.7 }}
            className="fixed bottom-28 right-4 z-[60] flex h-[38rem] w-[92vw] max-w-[430px] flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-white shadow-2xl shadow-black/20 sm:bottom-32 sm:right-6 sm:h-[42rem]"
          >
            <div className="relative overflow-hidden bg-primary p-6 text-white">
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold">Chicken House Assistant</h3>
                    <p className="text-xs uppercase tracking-[0.28em] text-white/70">
                      Live Menu • Booking • Location
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="rounded-xl p-2 transition-colors hover:bg-white/10">
                  <X size={20} />
                </button>
              </div>
              <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-white/10 blur-3xl" />
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto bg-surface p-5">
              {booting ? (
                <div className="flex h-full items-center justify-center">
                  <LoaderCircle size={30} className="animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, x: message.role === "assistant" ? -18 : 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[84%] rounded-[1.8rem] p-4 shadow-sm ${
                          message.role === "assistant"
                            ? "rounded-tl-none bg-white text-dark"
                            : "rounded-tr-none bg-primary text-white"
                        }`}
                      >
                        {message.payload.type === "image" && (
                          <img
                            src={message.payload.imageUrl}
                            alt={message.payload.text}
                            className="mb-3 h-44 w-full rounded-[1.2rem] object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}

                        <p className="text-sm leading-7">{message.payload.text}</p>

                        {message.payload.type === "cta" && (
                          <Link
                            to={message.payload.href}
                            className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-dark"
                          >
                            {message.payload.label}
                            <ChevronRight size={14} />
                          </Link>
                        )}

                        <div
                          className={`mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] ${
                            message.role === "assistant" ? "text-muted" : "text-white/60"
                          }`}
                        >
                          {message.role === "assistant" ? <Bot size={12} /> : <User size={12} />}
                          {message.time}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="rounded-[1.8rem] rounded-tl-none bg-white px-4 py-3 text-muted shadow-sm">
                        <div className="flex items-center gap-2 text-sm">
                          <LoaderCircle size={16} className="animate-spin" />
                          Chicken House is typing...
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="border-t border-gray-100 bg-white p-4">
              {suggestedReplies.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {suggestedReplies.slice(0, 4).map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      onClick={() => void sendMessage(reply)}
                      className="rounded-full border border-primary/10 bg-primary/5 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-primary transition hover:bg-primary hover:text-white"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}

              {error && <p className="mb-3 text-xs font-medium text-red-500">{error}</p>}

              <div className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void sendMessage(input);
                    }
                  }}
                  placeholder="Ask about menu, booking, location, or delivery..."
                  className="flex-1 bg-transparent text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => void sendMessage(input)}
                  disabled={loading}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-primary-strong disabled:opacity-60"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WhatsAppBot;
