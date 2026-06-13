import { FormEvent, useEffect, useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, ArrowRight, Chrome, Lock, Mail, Phone, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageMeta from "../components/layout/PageMeta";
import { useAuth } from "../context/AuthContext";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signup, socialSignup } = useAuth();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
    }, 100);

    return () => window.clearTimeout(timeout);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await signup({ name, email, phone, password });
    setIsSubmitting(false);

    if (result.ok === false) {
      setError(result.message);
      return;
    }

    navigate("/login", {
      replace: true,
      state: {
        signupSuccess: result.message,
      },
    });
  };

  const handleSocialSignup = async (provider: "google" | "facebook") => {
    setError("");
    const result = await socialSignup(provider);

    if (result.ok === false) {
      console.warn(result.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#fffdf8_0%,#fff3dc_50%,#1d0f09_50%,#3d170c_100%)] px-4 py-10">
      <PageMeta
        title="Create Account | Chicken House"
        description="Create your Chicken House customer account."
      />

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_28px_90px_rgba(20,10,6,0.22)] lg:grid-cols-[1.08fr_0.92fr]"
      >
        <div className="p-6 sm:p-10">
          <div className="mx-auto max-w-xl">
            <div className="mb-8 flex items-center gap-4">
              <img
                src="/logo.jpg"
                alt="Chicken House"
                className="h-12 w-12 rounded-lg object-cover"
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                  Chicken House
                </p>
                <p className="font-display text-xl font-bold text-dark">Customer Signup</p>
              </div>
            </div>

            <h1 className="text-3xl font-display font-bold text-dark">
              Create customer account
            </h1>
            <p className="mt-3 text-sm leading-7 text-muted">
              After signup, sign in with your email and password to continue.
            </p>

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
                Sign up with Google
              </button>
              <button
                type="button"
                onClick={() => void handleSocialSignup("facebook")}
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-dark transition hover:bg-surface"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1877f2] text-xs font-bold text-white">f</span>
                Sign up with Facebook
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5" autoComplete="off">
              <div className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
                <input type="text" name="username" autoComplete="username" tabIndex={-1} />
                <input type="password" name="password" autoComplete="current-password" tabIndex={-1} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-dark">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input
                    type="text"
                    name="customer_signup_full_name"
                    autoComplete="off"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-transparent bg-surface px-12 py-4 outline-none transition focus:border-primary focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.2em] text-dark">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input
                      type="email"
                      name="customer_signup_email"
                      autoComplete="off"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-transparent bg-surface px-12 py-4 outline-none transition focus:border-primary focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.2em] text-dark">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input
                      type="tel"
                      name="customer_signup_phone"
                      autoComplete="off"
                      placeholder="03XX XXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-lg border border-transparent bg-surface px-12 py-4 outline-none transition focus:border-primary focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-dark">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input
                    type="password"
                    name="customer_signup_new_password"
                    autoComplete="new-password"
                    placeholder="Create password"
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
                {isSubmitting ? "Creating Account..." : "Create Account"}
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-muted">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="relative hidden overflow-hidden bg-dark p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(140deg,rgba(216,168,47,0.14),transparent_36%),linear-gradient(180deg,transparent,rgba(127,18,21,0.16))]" />

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
              <p className="mt-1 font-display text-2xl font-bold">Customer Access</p>
            </div>
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
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/45">
              Chicken House
            </p>
            <h2 className="mt-4 text-4xl font-display font-bold leading-tight">
              Create your customer profile.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/62">
              Save your delivery details, track orders, manage favorites, and keep your Chicken House rewards in one place.
            </p>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default SignupPage;
