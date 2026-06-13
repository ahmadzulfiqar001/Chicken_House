import { FormEvent, useEffect, useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, ArrowRight, CheckCircle2, Chrome, Lock, Mail } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PageMeta from "../components/layout/PageMeta";
import { useAuth, UserRole } from "../context/AuthContext";

type LoginLocationState = {
  from?: string;
  signupSuccess?: string;
};

const BACKOFFICE_ROLES: UserRole[] = ["admin", "manager", "hr", "rider", "staff"];

const portalHighlights = [
  { icon: CheckCircle2, label: "Orders", detail: "Live queue" },
  { icon: Lock, label: "Access", detail: "Role based" },
  { icon: Mail, label: "Support", detail: "Inbox ready" },
];

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, socialSignup } = useAuth();

  const locationState = location.state as LoginLocationState | null;
  const signupSuccess = locationState?.signupSuccess ?? "";

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setEmail("");
      setPassword("");
    }, 100);

    return () => window.clearTimeout(timeout);
  }, []);

  const routeByRole = (role: UserRole) => {
    const from = locationState?.from;

    if (BACKOFFICE_ROLES.includes(role)) {
      navigate(from === "/admin" ? from : "/admin");
      return;
    }

    navigate(from === "/profile" ? from : "/profile");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await login({ email, password });
    setIsSubmitting(false);

    if (result.ok === false) {
      setError(result.message);
      return;
    }

    routeByRole(result.user.role);
  };

  const handleSocialSignup = async (provider: "google" | "facebook") => {
    setError("");
    const result = await socialSignup(provider);

    if (result.ok === false) {
      console.warn(result.message);
    }
  };

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-paper px-4 py-10">
      <PageMeta
        title="Login | Chicken House"
        description="Sign in to Chicken House."
      />

      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #fff7ec 0 48%, rgba(181, 101, 29, 0.7) 48% 100%)",
        }}
      />

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_28px_90px_rgba(20,10,6,0.24)] lg:grid-cols-[0.92fr_1.08fr]"
      >
        <div className="relative hidden overflow-hidden bg-dark p-10 text-white lg:flex lg:min-h-[34rem] lg:flex-col">
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(140deg,rgba(216,168,47,0.16),transparent_34%),linear-gradient(22deg,rgba(255,255,255,0.08),transparent_48%),linear-gradient(180deg,transparent,rgba(127,18,21,0.16))]" />
          <div aria-hidden="true" className="absolute right-0 top-0 h-full w-20 bg-gradient-to-b from-accent/10 via-white/5 to-transparent" />
          <div aria-hidden="true" className="absolute bottom-20 left-10 font-anton text-[8rem] uppercase leading-none text-white/[0.035]">
            CH
          </div>

          <Link to="/" className="relative z-10 flex items-center gap-4">
            <img
              src="/logo.jpg"
              alt="Chicken House"
              className="h-14 w-14 rounded-lg object-cover"
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-300">
                Chicken House
              </p>
              <p className="mt-1 font-display text-2xl font-bold">Access Portal</p>
            </div>
          </Link>

          <div className="relative z-10 my-8 rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-accent">Portal Flow</p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {portalHighlights.map((item) => {
                const HighlightIcon = item.icon;

                return (
                  <div key={item.label} className="rounded-xl border border-white/10 bg-black/18 p-3">
                    <HighlightIcon size={18} className="text-accent" />
                    <p className="mt-3 font-anton text-lg uppercase tracking-tight">{item.label}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/52">{item.detail}</p>
                  </div>
                );
              })}
            </div>
            <p className="mt-5 text-sm leading-7 text-white/62">
              Orders, bookings, staff work, and customer messages stay ready inside one protected workspace.
            </p>
          </div>

          <div className="relative z-10 mt-auto">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/45">
              Authorized access
            </p>
            <h1 className="mt-4 max-w-sm text-4xl font-display font-bold leading-tight">
              Secure account login.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/62">
              Sign in with the login details assigned to your account.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mx-auto max-w-md">
            <div className="mb-8 flex items-center gap-4 lg:hidden">
              <img
                src="/logo.jpg"
                alt="Chicken House"
                className="h-12 w-12 rounded-lg object-cover"
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                  Chicken House
                </p>
                <p className="font-display text-xl font-bold text-dark">Access Portal</p>
              </div>
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">
              Login
            </p>
            <h2 className="mt-3 text-3xl font-display font-bold text-dark">
              Enter your credentials
            </h2>

            {signupSuccess && (
              <div className="mt-6 flex items-start gap-3 rounded-lg border border-green-100 bg-green-50 p-4 text-sm font-medium text-green-700">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <span>{signupSuccess}</span>
              </div>
            )}

            {error && (
              <div className="mt-6 flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => void handleSocialSignup("google")}
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-dark transition hover:bg-surface"
              >
                <Chrome size={17} />
                Google
              </button>
              <button
                type="button"
                onClick={() => void handleSocialSignup("facebook")}
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-dark transition hover:bg-surface"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1877f2] text-xs font-bold text-white">f</span>
                Facebook
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5" autoComplete="off">
              <div className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
                <input type="text" name="username" autoComplete="username" tabIndex={-1} />
                <input type="password" name="password" autoComplete="current-password" tabIndex={-1} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-dark">
                  Email / Login ID
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input
                    type="email"
                    name="login-id-manual"
                    autoComplete="off"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-transparent bg-surface px-12 py-4 outline-none transition focus:border-primary focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-bold uppercase tracking-[0.2em] text-dark">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs font-bold uppercase tracking-[0.14em] text-primary hover:underline">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input
                    type="password"
                    name="login-pass-manual"
                    autoComplete="new-password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-transparent bg-surface px-12 py-4 outline-none transition focus:border-primary focus:bg-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 font-bold text-white transition hover:bg-primary-strong disabled:opacity-70"
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-muted">
              New customer?{" "}
              <Link to="/signup" className="font-bold text-primary hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default LoginPage;
