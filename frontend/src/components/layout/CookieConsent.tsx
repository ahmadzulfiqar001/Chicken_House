import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Cookie } from "lucide-react";
import { Link } from "react-router-dom";
import {
  acceptCookieConsent,
  rejectCookieConsent,
  COOKIE_CONSENT_CHANGED_EVENT,
  hasDecidedCookieConsent,
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

  useEffect(() => {
    setVisible(!hasDecidedCookieConsent());
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

  const decide = (choice: "accepted" | "rejected") => {
    if (choice === "accepted") {
      acceptCookieConsent();
    } else {
      rejectCookieConsent();
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-x-0 bottom-0 z-[80] px-4 pb-4 sm:px-6"
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
        >
          <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-[1.8rem] border border-gray-100 bg-white/95 p-5 shadow-2xl shadow-dark/20 backdrop-blur-md sm:flex-row sm:items-center sm:gap-6 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Cookie size={24} />
              </div>
              <div>
                <p className="font-bold text-dark">We use cookies</p>
                <p className="mt-1 text-sm text-muted">
                  Cookies enable account login, cart memory, and customer sessions. Accept to use these features, or reject and keep browsing.{" "}
                  <Link to="/cookies" className="font-bold text-primary hover:underline">
                    Learn more
                  </Link>
                  .
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-3 sm:ml-auto">
              <button
                type="button"
                onClick={() => decide("rejected")}
                className="flex-1 rounded-full border border-gray-200 px-6 py-3 text-sm font-bold text-dark transition hover:bg-surface sm:flex-none"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => decide("accepted")}
                className="flex-1 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-strong sm:flex-none"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
