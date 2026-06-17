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
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={handleClick}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl shadow-green-500/40 sm:h-16 sm:w-16"
        aria-label={`Chat on WhatsApp at ${siteConfig.phone}`}
      >
        <MessageCircle size={30} fill="currentColor" />
        <span className="absolute inset-0 rounded-full bg-[#25D366]/60 animate-ping opacity-20" />
      </motion.button>
    </motion.div>
  );
};

export default WhatsAppButton;
