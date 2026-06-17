import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, ShoppingCart, Home, Utensils, Calendar, Image, Phone, Shield, Info, Briefcase } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { cartItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [compact, setCompact] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      setIsScrolled(y > 50);
      // Direction-aware: shrink ("close") on scroll down, widen on scroll up.
      if (y < 80) setCompact(false);
      else if (y > lastY + 4) setCompact(true);
      else if (y < lastY - 4) setCompact(false);
      lastY = y;
      ticking = false;
    };
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: "Home", icon: <Home size={18} />, href: "/" },
    { name: "Menu", icon: <Utensils size={18} />, href: "/menu" },
    { name: "About", icon: <Info size={18} />, href: "/about" },
    { name: "Gallery", icon: <Image size={18} />, href: "/gallery" },
    { name: "Booking", icon: <Calendar size={18} />, href: "/booking" },
    { name: "Careers", icon: <Briefcase size={18} />, href: "/careers" },
    { name: "Contact", icon: <Phone size={18} />, href: "/contact" },
  ];

  const isHome = location.pathname === "/";
  const navbarShellClass = isScrolled
    ? "bg-[linear-gradient(135deg,rgba(20,10,6,0.96),rgba(78,24,11,0.92),rgba(173,70,22,0.86))] border-white/20 shadow-[0_22px_70px_rgba(16,8,5,0.45)] px-8 py-3 backdrop-blur-2xl"
    : isHome
      ? "bg-[linear-gradient(135deg,rgba(18,12,8,0.78),rgba(89,35,15,0.7),rgba(199,88,17,0.52))] border-white/10 shadow-[0_18px_55px_rgba(16,8,5,0.3)] px-6 py-3 backdrop-blur-xl"
      : "bg-[linear-gradient(135deg,rgba(20,10,6,0.92),rgba(88,30,13,0.82),rgba(173,70,22,0.72))] border-white/15 shadow-[0_18px_55px_rgba(16,8,5,0.28)] px-8 py-3 backdrop-blur-xl";

  const isBackofficeUser = user ? user.role !== "user" : false;
  const panelHref = isBackofficeUser ? "/admin" : "/profile";
  const panelLabel = isBackofficeUser ? (user?.role === "admin" ? "Admin Panel" : "Work Panel") : "My Account";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isScrolled
          ? compact
            ? "py-2 px-3"
            : "py-4 px-4"
          : "py-8 px-8"
      }`}
    >
      <div
        className={`mx-auto transition-all duration-500 ease-out rounded-full border ${navbarShellClass} ${
          compact ? "max-w-[1080px] scale-[0.97]" : "max-w-[1800px] scale-100"
        }`}
      >
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="group">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="overflow-hidden rounded-full border-2 border-white/20 shadow-2xl transition-transform duration-500 group-hover:rotate-6">
                <img
                  src="/logo.jpg"
                  alt="Chicken House"
                  className="h-12 w-12 object-cover"
                />
              </div>
              <span className="hidden font-anton text-[1.7rem] uppercase tracking-tighter text-white drop-shadow-[0_0_7px_rgba(255,214,132,0.24)] sm:block lg:text-3xl">
                Chicken House
              </span>
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-9 xl:gap-11">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`font-mono text-[11px] font-bold uppercase tracking-[0.24em] transition-all duration-500 relative group px-4 py-2 rounded-full ${
                    isActive 
                      ? "text-dark bg-accent shadow-[0_12px_30px_rgba(255,171,73,0.35)]" 
                      : "text-white/88 hover:text-white hover:bg-white/12"
                  }`}
                >
                  {link.name}
                  <span className={`absolute -bottom-2 left-0 h-[1px] bg-accent transition-all duration-500 ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`} />
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6">
            <Link to="/cart">
              <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-full transition-all duration-500 border border-white/15 bg-white/8 text-white hover:border-accent hover:bg-accent/10 hover:text-accent relative"
              >
                <ShoppingCart size={20} />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                    {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                )}
              </motion.button>
            </Link>
            {isAuthenticated ? (
              <div className="hidden items-center gap-3 sm:flex">
                <Link to={panelHref}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-full bg-accent text-dark font-bold text-sm uppercase tracking-widest hover:bg-white transition-all duration-500"
                  >
                    {panelLabel}
                  </motion.button>
                </Link>
                <button
                  onClick={() => {
                    void logout();
                  }}
                  className="px-5 py-3 rounded-full border border-white/15 bg-white/8 text-white text-sm font-bold uppercase tracking-widest hover:bg-white/12 transition-all duration-500"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:block">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 rounded-full bg-accent text-dark font-bold text-sm uppercase tracking-widest hover:bg-white transition-all duration-500"
                >
                  Login
                </motion.button>
              </Link>
            )}
            <button
              className="lg:hidden p-3 rounded-full border border-white/15 bg-white/8 text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="lg:hidden fixed inset-x-4 top-24 z-40 overflow-hidden rounded-[3rem] border border-white/15 bg-[linear-gradient(180deg,rgba(18,12,8,0.96),rgba(73,28,14,0.93),rgba(145,62,20,0.88))] shadow-2xl backdrop-blur-2xl"
          >
            <div className="max-h-[calc(100vh-7rem)] overflow-y-auto p-10 space-y-8 sm:p-12">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="flex items-center gap-6 text-white/78 hover:text-accent font-anton text-4xl uppercase tracking-tighter transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-accent font-mono text-xs">{link.icon}</span>
                  {link.name}
                </Link>
              ))}
              <div className="pt-8 border-t border-white/10">
                {isAuthenticated ? (
                  <div className="space-y-4">
                    <Link to={panelHref} onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="w-full py-6 rounded-3xl bg-accent text-dark font-bold text-xl uppercase tracking-widest flex items-center justify-center gap-3">
                        {isBackofficeUser ? <Shield size={22} /> : null}
                        {panelLabel}
                      </button>
                    </Link>
                    <button
                      onClick={() => {
                        void logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-5 rounded-3xl border border-white/10 bg-white/8 text-white font-bold text-lg uppercase tracking-widest"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full py-6 rounded-3xl bg-accent text-dark font-bold text-xl uppercase tracking-widest">
                      Login Account
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
