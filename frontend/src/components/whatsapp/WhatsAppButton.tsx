import { motion } from "motion/react";
import { MessageCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { buildWhatsAppUrl, siteConfig } from "../../lib/site";

const WhatsAppButton = () => {
  const location = useLocation();
  const message =
    "Hello Chicken House! Please help me with the menu, order placement, booking, location, or order tracking.";

  if (["/booking", "/cart", "/checkout", "/login", "/signup"].includes(location.pathname)) {
    return null;
  }

  const handleClick = () => {
    const url = buildWhatsAppUrl(message);
    window.open(url, "_blank");
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed bottom-4 right-4 z-50 sm:bottom-8 sm:right-6"
    >
      <motion.button
        whileHover={{ scale: 1.04, x: -4 }}
        whileTap={{ scale: 0.96 }}
        onClick={handleClick}
        className="group flex items-center gap-3 rounded-full border border-white/15 bg-[#25D366] px-4 py-3 text-white shadow-2xl shadow-green-500/30"
        aria-label={`Chat on WhatsApp at ${siteConfig.phone}`}
      >
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#25D366] shadow-lg sm:h-14 sm:w-14">
          <MessageCircle size={30} fill="currentColor" />
          <span className="absolute inset-0 rounded-full bg-white/70 animate-ping opacity-20" />
        </div>

        <div className="hidden text-left sm:block">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/80">
            WhatsApp Chat
          </p>
          <p className="text-base font-bold leading-6">{siteConfig.phone}</p>
        </div>
      </motion.button>
    </motion.div>
  );
};

export default WhatsAppButton;
