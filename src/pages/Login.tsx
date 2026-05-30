import { FormEvent, useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, ArrowRight, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PageMeta from "../components/PageMeta";
import { useAuth } from "../context/AuthContext";
import { siteConfig } from "../lib/site";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, demoAccounts } = useAuth();

  // Backoffice roles — ye log /admin pe jaate hain
  const BACKOFFICE_ROLES = ["admin", "manager", "rider", "staff"] as const;

  const routeByRole = (
    role: "admin" | "manager" | "rider" | "staff" | "user",
  ) => {
    const from = (location.state as { from?: string } | null)?.from;

    if ((BACKOFFICE_ROLES as readonly string[]).includes(role)) {
      // Admin/Manager/Staff/Rider hamesha admin dashboard pe
      navigate(from === "/admin" ? from : "/admin");
    } else {
      // Sirf "user" role (customer) profile pe jaayega
      navigate(from === "/profile" ? from : "/profile");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    console.log("Attempting login with:", { email, role: "checking..." });
    const result = await login({ email, password });
    setIsSubmitting(false);

    if (!result.ok) {
      console.error("Login failed:", result.message);
      setError(result.message);
      return;
    }

    console.log("Login successful! User role:", result.user.role);
    routeByRole(result.user.role);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f9e4b7_0%,#fff8ec_38%,#fffdf8_100%)]">
      <PageMeta
        title="Login | Chicken House"
        description="Sign in to your Chicken House account for customer orders, bookings, and admin access."
      />

      <section className="px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2.5rem] bg-dark p-8 text-white shadow-[0_30px_90px_rgba(10,5,2,0.32)]"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.32em] text-orange-300">
              <Sparkles size={14} />
              Chicken House
            </div>

            <img src="/logo.jpg" alt="Chicken House" className="mt-8 h-18 w-18 rounded-[1.5rem] object-cover shadow-xl shadow-black/20" />
            <h1 className="mt-8 max-w-md text-4xl font-display font-bold leading-tight">
              Sign in to your restaurant account.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-8 text-white/68">
              Email login now uses the live browser session, so both customer and admin access work outside AI Studio as a normal web app.
            </p>

            <div className="mt-10 space-y-4">
              <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-orange-300" />
                  <p className="text-sm font-bold uppercase tracking-[0.24em]">Role Access</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/65">
                  Admin goes to the operations dashboard. Customers go to their account area for orders, saved addresses, wishlist, and wallet activity.
                </p>
              </div>

              <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/45">Demo Access</p>
                <div className="mt-4 space-y-3">
                  {demoAccounts.map((account) => (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() => {
                        setEmail(account.email);
                        setPassword(account.password);
                        setError("");
                      }}
                      className="w-full rounded-2xl bg-white/95 px-4 py-4 text-left text-dark transition hover:-translate-y-0.5"
                    >
                      <p className="text-sm font-bold">{account.label}</p>
                      <p className="mt-1 text-xs text-muted">{account.email} / {account.password}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2.5rem] border border-white/60 bg-white/92 p-8 shadow-[0_30px_90px_rgba(127,18,21,0.12)]"
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Login Panel</p>
            <h2 className="mt-3 text-3xl font-display font-bold text-dark">Welcome back</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Secure session-based access for the customer account and admin panel.
            </p>

            {error && (
              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.24em] text-dark">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input type="email" placeholder={siteConfig.email} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl bg-surface px-12 py-4 outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.24em] text-dark">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl bg-surface px-12 py-4 outline-none" />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-bold text-white transition hover:bg-primary-strong disabled:opacity-70">
                {isSubmitting ? "Signing In..." : "Sign In"}
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-muted">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="font-bold text-primary hover:underline">
                Create one now
              </Link>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
