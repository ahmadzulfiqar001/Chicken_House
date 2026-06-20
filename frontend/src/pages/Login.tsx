import { FormEvent, useEffect, useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, ArrowRight, CheckCircle2, Lock, Mail } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PageMeta from "../components/layout/PageMeta";
import { useAuth, UserRole } from "../context/AuthContext";

type LoginLocationState = {
  from?: string;
  signupSuccess?: string;
};

const BACKOFFICE_ROLES: UserRole[] = ["admin", "manager", "hr", "rider", "staff"];

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

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

  return (
    <div className="relative isolate flex min-h-dvh items-start justify-center overflow-x-hidden overflow-y-auto bg-paper px-3 py-6 sm:px-4 sm:py-10 lg:items-center">
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
        className="relative z-10 grid w-full max-w-md overflow-hidden rounded-[1.15rem] border border-black/10 bg-white shadow-[0_22px_70px_rgba(20,10,6,0.18)] sm:max-w-lg lg:max-w-5xl lg:grid-cols-[0.92fr_1.08fr] lg:rounded-lg lg:shadow-[0_28px_90px_rgba(20,10,6,0.24)]"
      >
        <div className="relative hidden overflow-hidden bg-dark p-10 text-white lg:flex lg:min-h-[34rem] lg:flex-col lg:justify-between">
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(140deg,rgba(216,168,47,0.16),transparent_34%),linear-gradient(22deg,rgba(255,255,255,0.08),transparent_48%),linear-gradient(180deg,transparent,rgba(127,18,21,0.16))]" />
          <div aria-hidden="true" className="absolute right-0 top-0 h-full w-20 bg-gradient-to-b from-accent/10 via-white/5 to-transparent" />
          <Link to="/" className="relative z-10 w-fit font-display text-2xl font-bold">
            Access Portal
          </Link>

          <div className="relative z-10 flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-xs rounded-2xl border border-accent/35 bg-white/[0.07] p-3 shadow-[0_26px_70px_rgba(0,0,0,0.34)]">
              <img
                src="/logo.jpg"
                alt="Chicken House logo"
                className="aspect-[4/3] w-full rounded-xl object-cover"
              />
            </div>
          </div>

          <div className="relative z-10">
            <h1 className="mt-4 max-w-sm text-4xl font-display font-bold leading-tight">
              Secure account login.
            </h1>
          </div>
        </div>

        <div className="p-5 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-md">
            <div className="mb-6 flex items-center gap-3 sm:mb-8 sm:gap-4 lg:hidden">
              <img
                src="/logo.jpg"
                alt="Chicken House"
                className="h-11 w-11 shrink-0 rounded-lg object-cover sm:h-12 sm:w-12"
              />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary sm:text-xs">
                  Chicken House
                </p>
                <p className="font-display text-lg font-bold leading-tight text-dark sm:text-xl">Access Portal</p>
              </div>
            </div>

            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary sm:text-xs">
              Login
            </p>
            <h2 className="mt-2 text-[2.05rem] font-display font-bold leading-[1.08] text-dark sm:mt-3 sm:text-3xl">
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

            <form onSubmit={handleSubmit} className="mt-7 space-y-4 sm:mt-8 sm:space-y-5" autoComplete="off">
              <div className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
                <input type="text" name="username" autoComplete="username" tabIndex={-1} />
                <input type="password" name="password" autoComplete="current-password" tabIndex={-1} />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-dark sm:text-xs">
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
                    className="w-full rounded-lg border border-transparent bg-surface px-11 py-3.5 text-base outline-none transition placeholder:text-muted/75 focus:border-primary focus:bg-white sm:px-12 sm:py-4"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-dark sm:text-xs">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-[11px] font-bold uppercase tracking-[0.1em] text-primary hover:underline sm:text-xs">
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
                    className="w-full rounded-lg border border-transparent bg-surface px-11 py-3.5 text-base outline-none transition placeholder:text-muted/75 focus:border-primary focus:bg-white sm:px-12 sm:py-4"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 font-bold text-white transition hover:bg-primary-strong disabled:opacity-70 sm:py-4"
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted sm:mt-8">
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
