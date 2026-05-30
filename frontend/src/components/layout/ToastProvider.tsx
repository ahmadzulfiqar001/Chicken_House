import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showToast: (toast: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const toneStyles: Record<ToastTone, string> = {
  success: "border-green-100 bg-white text-dark",
  error: "border-red-100 bg-white text-dark",
  info: "border-primary/10 bg-white text-dark",
};

const toneIcons: Record<ToastTone, React.ReactNode> = {
  success: <CheckCircle2 size={18} className="text-green-600" />,
  error: <AlertCircle size={18} className="text-red-600" />,
  info: <Info size={18} className="text-primary" />,
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    window.setTimeout(() => dismiss(id), 3800);
  }, [dismiss]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-24 z-[200] flex w-[min(92vw,360px)] flex-col gap-3 sm:right-6">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 24, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.96 }}
              className={`pointer-events-auto rounded-[1.8rem] border p-4 shadow-2xl shadow-dark/10 ${toneStyles[toast.tone]}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{toneIcons[toast.tone]}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{toast.title}</p>
                  {toast.description ? (
                    <p className="mt-1 text-sm leading-6 text-muted">{toast.description}</p>
                  ) : null}
                </div>
                <button onClick={() => dismiss(toast.id)} className="text-muted transition hover:text-dark">
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
};
