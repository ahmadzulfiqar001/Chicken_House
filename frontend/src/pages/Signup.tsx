import { FormEvent, useEffect, useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, ArrowRight, Lock, Mail, Phone, User } from "lucide-react";
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
  const { signup } = useAuth();

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

  return (
    <div className="relative isolate flex min-h-dvh items-start justify-center overflow-x-hidden overflow-y-auto bg-[linear-gradient(135deg,#fff7ec_0_48%,rgba(181,101,29,0.7)_48%_100%)] px-3 py-5 sm:px-4 sm:py-10 lg:items-center lg:bg-[linear-gradient(135deg,#fffdf8_0%,#fff3dc_50%,#1d0f09_50%,#3d170c_100%)]">
      <PageMeta
        title="Create Account | Chicken House"
        description="Create your Chicken House customer account."
      />

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 grid w-full max-w-md overflow-hidden rounded-[1.15rem] border border-black/10 bg-white shadow-[0_22px_70px_rgba(20,10,6,0.18)] sm:max-w-lg lg:max-w-5xl lg:grid-cols-[1.08fr_0.92fr] lg:rounded-lg lg:shadow-[0_28px_90px_rgba(20,10,6,0.22)]"
      >
        <div className="p-5 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-md md:max-w-xl">
            <div className="mb-6 flex items-center gap-3 sm:mb-8 sm:gap-4">
              <img
                src="/logo.jpg"
                alt="Chicken House"
                className="h-11 w-11 shrink-0 rounded-lg object-cover sm:h-12 sm:w-12"
              />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary sm:text-xs">
                  Chicken House
                </p>
                <p className="font-display text-lg font-bold leading-tight text-dark sm:text-xl">Customer Signup</p>
              </div>
            </div>

            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary sm:text-xs">
              Customer Signup
            </p>
            <h1 className="mt-2 text-[2.05rem] font-display font-bold leading-[1.08] text-dark sm:mt-3 sm:text-3xl">
              Create customer account
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted sm:leading-7">
              After signup, sign in with your email and password to continue.
            </p>

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
                    className="w-full rounded-lg border border-transparent bg-surface px-11 py-3.5 text-base outline-none transition placeholder:text-muted/75 focus:border-primary focus:bg-white sm:px-12 sm:py-4"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-dark sm:text-xs">
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
                      className="w-full rounded-lg border border-transparent bg-surface px-11 py-3.5 text-base outline-none transition placeholder:text-muted/75 focus:border-primary focus:bg-white sm:px-12 sm:py-4"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-dark sm:text-xs">
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
                      className="w-full rounded-lg border border-transparent bg-surface px-11 py-3.5 text-base outline-none transition placeholder:text-muted/75 focus:border-primary focus:bg-white sm:px-12 sm:py-4"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-dark sm:text-xs">
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
                {isSubmitting ? "Creating Account..." : "Create Account"}
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted sm:mt-8">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="relative hidden overflow-hidden bg-dark p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(140deg,rgba(216,168,47,0.14),transparent_36%),linear-gradient(180deg,transparent,rgba(127,18,21,0.16))]" />

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
            <h2 className="mt-4 text-4xl font-display font-bold leading-tight">
              Secure account login.
            </h2>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default SignupPage;
