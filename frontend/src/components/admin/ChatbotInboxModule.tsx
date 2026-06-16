import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Bot, MessageSquare, Phone, RefreshCw, User, Wifi } from "lucide-react";

type ConversationMessage = {
  id: string;
  role: "customer" | "assistant" | "admin";
  text: string;
  createdAt: string;
};

type ConversationSession = {
  id: string;
  customerName: string;
  customerNumber: string;
  adminNumber: string;
  channel: string;
  status: string;
  startedAt: string;
  updatedAt: string;
  messages: ConversationMessage[];
};

const formatTime = (value: string) =>
  new Date(value).toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const ChatbotInboxModule = () => {
  const [conversations, setConversations] = useState<ConversationSession[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchConversations = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/assistant/inbox", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Failed to load chatbot inbox.");
      }

      setConversations(data);
      setSelectedId((current) => current || data[0]?.id || "");
    } catch (fetchError) {
      console.error(fetchError);
      setError("The chatbot inbox could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedId) ?? conversations[0],
    [conversations, selectedId],
  );

  const totalMessages = conversations.reduce(
    (count, conversation) => count + conversation.messages.length,
    0,
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Bot size={22} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Bot Sessions</p>
          <p className="text-2xl font-display font-bold text-dark">{conversations.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-600 flex items-center justify-center mb-4">
            <Wifi size={22} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Bot Active</p>
          <p className="text-2xl font-display font-bold text-dark">
            {conversations.filter((item) => item.status === "Bot Active").length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4">
            <MessageSquare size={22} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Total Messages</p>
          <p className="text-2xl font-display font-bold text-dark">{totalMessages}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4">
            <Phone size={22} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Admin Number</p>
          <p className="text-lg font-bold text-dark">+92 345 7493339</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-8">
        <div className="bg-white rounded-[3rem] p-6 shadow-xl shadow-dark/5 border border-gray-50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-dark">Chatbot Inbox</h2>
              <p className="text-sm text-muted">Customer questions visible on admin side</p>
            </div>
            <button
              onClick={fetchConversations}
              className="p-3 rounded-2xl bg-surface text-dark hover:bg-primary hover:text-white transition-all"
              aria-label="Refresh chatbot inbox"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          {loading && <p className="text-muted">Loading chatbot sessions...</p>}
          {!loading && error && <p className="text-red-500">{error}</p>}

          <div className="space-y-4 max-h-[720px] overflow-y-auto pr-2">
            {conversations.map((conversation) => {
              const latestMessage = conversation.messages[conversation.messages.length - 1];
              const isActive = selectedConversation?.id === conversation.id;

              return (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedId(conversation.id)}
                  className={`w-full text-left rounded-[2rem] p-5 border transition-all ${
                    isActive
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-gray-100 bg-surface hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div>
                      <p className="font-bold text-dark">{conversation.customerName}</p>
                      <p className="text-sm text-muted">{conversation.customerNumber}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-bold uppercase tracking-widest">
                      {conversation.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted line-clamp-2">
                    {latestMessage?.text ?? "No messages yet."}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted">
                    <span>{conversation.channel}</span>
                    <span>{formatTime(conversation.updatedAt)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-[3rem] p-8 shadow-xl shadow-dark/5 border border-gray-50 min-h-[400px] md:min-h-[780px]">
          {selectedConversation ? (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-gray-100 mb-8">
                <div>
                  <h3 className="text-3xl font-bold text-dark">{selectedConversation.customerName}</h3>
                  <p className="text-muted mt-1">
                    Customer: {selectedConversation.customerNumber} | Admin: {selectedConversation.adminNumber}
                  </p>
                </div>

                <div className="flex gap-4">
                  <div className="px-5 py-3 rounded-2xl bg-surface">
                    <p className="text-xs text-muted uppercase tracking-widest font-bold mb-1">Started</p>
                    <p className="font-bold text-dark">{formatTime(selectedConversation.startedAt)}</p>
                  </div>
                  <div className="px-5 py-3 rounded-2xl bg-surface">
                    <p className="text-xs text-muted uppercase tracking-widest font-bold mb-1">Last Activity</p>
                    <p className="font-bold text-dark">{formatTime(selectedConversation.updatedAt)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 max-h-[620px] overflow-y-auto pr-2">
                {selectedConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "customer" ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[78%] rounded-[2rem] px-5 py-4 shadow-sm ${
                        message.role === "customer"
                          ? "bg-surface text-dark rounded-tl-md"
                          : message.role === "assistant"
                            ? "bg-primary text-white rounded-tr-md"
                            : "bg-dark text-white rounded-tr-md"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {message.role === "customer" ? (
                          <User size={16} />
                        ) : (
                          <Bot size={16} />
                        )}
                        <span className="text-xs font-bold uppercase tracking-widest opacity-75">
                          {message.role === "customer"
                            ? "Customer"
                            : message.role === "assistant"
                              ? "Chicken House Bot"
                              : "Admin"}
                        </span>
                      </div>
                      <p className="text-sm leading-7 whitespace-pre-line">{message.text}</p>
                      <p className="mt-3 text-[11px] opacity-70">{formatTime(message.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-center text-muted">
              Chatbot sessions appear here once customers start asking questions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatbotInboxModule;
