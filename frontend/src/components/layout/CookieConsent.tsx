import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Cookie } from "lucide-react";
import { Link } from "react-router-dom";
import {
  acceptCookieConsent,
  rejectCookieConsent,
  COOKIE_CONSENT_CHANGED_EVENT,
  hasDecidedCookieConsent,
  syncPendingCookieConsent,
} from "../../lib/cookieConsent";

const OPEN_EVENT = "chicken-house:open-cookie-settings";

/** Re-open the cookie banner from anywhere, such as the footer settings link. */
export const openCookieSettings = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OPEN_EVENT));
  }
};

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setVisible(!hasDecidedCookieConsent());
    void syncPendingCookieConsent();
  }, []);

  useEffect(() => {
    const handler = () => {
      setVisible(true);
    };

    window.addEventListener(OPEN_EVENT, handler);
    return () => window.removeEventListener(OPEN_EVENT, handler);
  }, []);

  useEffect(() => {
    const handler = () => {
      if (hasDecidedCookieConsent()) {
        setVisible(false);
      }
    };

    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handler);
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, handler);
  }, []);

  const decide = async (choice: "accepted" | "rejected") => {
    if (isSaving) return;

    setIsSaving(true);

    if (choice === "accepted") {
      await acceptCookieConsent();
    } else {
      rejectCookieConsent();
    }

    setVisible(false);
    setIsSaving(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-x-0 bottom-0 z-[80] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-6 sm:pb-6"
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
          aria-modal="false"
        >
          <div className="mx-auto flex max-h-[calc(100vh-1.5rem)] w-full max-w-[calc(100vw-1.5rem)] flex-col gap-4 overflow-y-auto rounded-2xl border border-gray-100 bg-white/95 p-4 shadow-2xl shadow-dark/20 backdrop-blur-md sm:max-w-4xl sm:flex-row sm:items-center sm:gap-6 sm:rounded-[1.8rem] sm:p-6">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-12 sm:w-12">
                <Cookie size={22} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-dark">We use cookies</p>
                <p className="mt-1 break-words text-xs leading-5 text-muted sm:text-sm sm:leading-normal">
                  Cookies enable account login, cart memory, and customer sessions. Accept to use these features, or reject and keep browsing.{" "}
                  <Link to="/cookies" className="font-bold text-primary hover:underline">
                    Learn more
                  </Link>
                  .
                </p>
              </div>
            </div>
            <div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:ml-auto sm:flex sm:w-auto sm:shrink-0 sm:gap-3">
              <button
                type="button"
                onClick={() => decide("rejected")}
                disabled={isSaving}
                className="w-full rounded-full border border-gray-200 px-6 py-3 text-sm font-bold text-dark transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => decide("accepted")}
                disabled={isSaving}
                className="w-full rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-75 sm:w-auto"
              >
                {isSaving ? "Saving..." : "Accept"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
