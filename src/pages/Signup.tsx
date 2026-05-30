import { FormEvent, useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, ArrowRight, Lock, Mail, Phone, ShieldCheck, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageMeta from "../components/PageMeta";
import { useAuth } from "../context/AuthContext";
import { siteConfig } from "../lib/site";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    const result = await signup({ name, email, phone, password });
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#f8dfac_0%,#fff7ea_40%,#fffdf8_100%)]">
      <PageMeta
        title="Create Account | Chicken House"
        description="Create your Chicken House customer account for orders, addresses, booking updates, and order tracking."
      />

      <section className="px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2.5rem] border border-white/60 bg-white/92 p-8 shadow-[0_30px_90px_rgba(127,18,21,0.12)]"
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Customer Signup</p>
            <h1 className="mt-3 text-3xl font-display font-bold text-dark">Create your Chicken House account</h1>
            <p className="mt-3 text-sm leading-7 text-muted">
              Real customer signup for the browser-based ordering platform, with profile and order history ready right after registration.
            </p>

            {error && (
              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.24em] text-dark">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input type="text" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-2xl bg-surface px-12 py-4 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.24em] text-dark">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input type="email" placeholder={siteConfig.email} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl bg-surface px-12 py-4 outline-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.24em] text-dark">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input type="tel" placeholder={siteConfig.phone} value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-2xl bg-surface px-12 py-4 outline-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.24em] text-dark">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input type="password" placeholder="Create a secure password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl bg-surface px-12 py-4 outline-none" />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-bold text-white transition hover:bg-primary-strong disabled:opacity-70">
                {isSubmitting ? "Creating Account..." : "Create Account"}
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-muted">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-primary hover:underline">
                Sign in here
              </Link>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2.5rem] bg-dark p-8 text-white shadow-[0_30px_90px_rgba(10,5,2,0.32)]"
          >
            <img src="/logo.jpg" alt="Chicken House" className="h-18 w-18 rounded-[1.5rem] object-cover shadow-xl shadow-black/20" />
            <h2 className="mt-8 text-4xl font-display font-bold leading-tight">Join the customer side with a real account flow.</h2>
            <p className="mt-4 text-sm leading-8 text-white/68">
              This account connects to your saved addresses, bookings, order history, wishlist, and wallet area so the site behaves like a professional food platform.
            </p>

            <div className="mt-10 space-y-4">
              {[
                "Track active orders from the customer panel",
                "Save addresses for delivery and repeat checkout",
                "Manage wishlist, wallet, and booking history",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[1.8rem] border border-white/10 bg-white/5 px-5 py-4">
                  <ShieldCheck size={18} className="mt-1 shrink-0 text-orange-300" />
                  <span className="text-sm leading-7 text-white/70">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default SignupPage;
