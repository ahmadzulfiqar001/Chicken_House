import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MenuPreview from "./components/MenuPreview";
import Features from "./components/Features";
import AboutUs from "./components/AboutUs";
import Services from "./components/Services";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import WhatsAppBot from "./components/WhatsAppBot";
import MenuPage from "./pages/Menu";
import BookingPage from "./pages/Booking";
import OrderTrackingPage from "./pages/OrderTracking";
import AdminDashboard from "./pages/AdminDashboard";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import CartPage from "./pages/Cart";
import CheckoutPage from "./pages/Checkout";
import ProfilePage from "./pages/Profile";
import GalleryPage from "./pages/Gallery";
import ServicesPage from "./pages/Services";
import ContactPage from "./pages/Contact";
import AboutPage from "./pages/About";
import PrivacyPolicyPage from "./pages/PrivacyPolicy";
import TermsPage from "./pages/Terms";
import CookiesPage from "./pages/Cookies";
import NotFoundPage from "./pages/NotFound";
import USPSection from "./components/USPSection";
import WelcomeSection from "./components/WelcomeSection";
import SpecialtiesSection from "./components/SpecialtiesSection";
import TestimonialsSection from "./components/TestimonialsSection";
import BestSellersSection from "./components/BestSellersSection";
import StatsSection from "./components/StatsSection";
import ChefsSection from "./components/ChefsSection";
import ReservationSection from "./components/ReservationSection";
import NewsletterSection from "./components/NewsletterSection";
import RecommendationsSection from "./components/RecommendationsSection";
import PageMeta from "./components/PageMeta";

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider } from "./components/ToastProvider";

const Home = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
  >
    <PageMeta
      title="Chicken House | Restaurant & ERP Platform"
      description="Chicken House restaurant website for menu browsing, secure checkout, bookings, and customer account access in Renala Khurd."
    />
    <Hero />
    <WelcomeSection />
    <USPSection />
    <SpecialtiesSection />
    <AboutUs />
    <MenuPreview />
    <RecommendationsSection />
    <BestSellersSection />
    <StatsSection />
    <ChefsSection />
    <Services />
    <TestimonialsSection />
    <ReservationSection />
    <NewsletterSection />
    <Features />
  </motion.div>
);

const RouteMetaFallback = () => {
  const location = useLocation();

  if (location.pathname === "/gallery") {
    return <PageMeta title="Gallery | Chicken House" description="Browse Chicken House food, ambiance, and restaurant visuals." />;
  }

  if (location.pathname === "/services") {
    return <PageMeta title="Services | Chicken House" description="Explore Chicken House dining, delivery, event, and restaurant services." />;
  }

  return null;
};

const PublicLayout = () => (
  <>
    <RouteMetaFallback />
    <Navbar />
    <main>
      <Outlet />
    </main>
    <Footer />
    <WhatsAppBot />
    <WhatsAppButton />
  </>
);

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <Router>
            <div className="relative min-h-screen">
              <Routes>
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/menu" element={<MenuPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/booking" element={<BookingPage />} />
                  <Route path="/track" element={<OrderTrackingPage />} />
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/cookies" element={<CookiesPage />} />
                  {/* Customer Dashboard — sirf "user" role ke liye (wallet, orders, wishlist) */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute allow={["user"]}>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* Backoffice Dashboard — admin, manager, staff, rider ke liye */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allow={["admin", "manager", "rider", "staff"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </Router>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
