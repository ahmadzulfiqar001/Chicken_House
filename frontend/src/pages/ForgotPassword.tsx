import { FormEvent, useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, ArrowRight, CheckCircle2, Mail, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import PageMeta from "../components/layout/PageMeta";
import { siteConfig } from "../lib/site";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(String(data.message ?? "Unable to send a reset link right now."));
        return;
      }

      setMessage(String(data.message ?? "If an account exists for that email, a reset link has been sent."));
    } catch (requestError) {
      console.error("Forgot password request failed", requestError);
      setError("Unable to send a reset link right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f9e4b7_0%,#fff8ec_38%,#fffdf8_100%)]">
      <PageMeta
        title="Forgot Password | Chicken House"
        description="Request a secure Chicken House account password reset link."
      />

      <section className="px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2.5rem] bg-dark p-8 text-white shadow-[0_30px_90px_rgba(10,5,2,0.32)]"
          >
            <img src="/logo.jpg" alt="Chicken House" className="h-18 w-18 rounded-[1.5rem] object-cover shadow-xl shadow-black/20" />
            <h1 className="mt-8 max-w-md text-4xl font-display font-bold leading-tight">
              Reset your account password.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-8 text-white/68">
              We will email a secure link to the account address if it exists in Chicken House.
            </p>

            <div className="mt-10 rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-orange-300" />
                <p className="text-sm font-bold uppercase tracking-[0.24em]">Secure Link</p>
              </div>
              <p className="mt-3 text-sm leading-7 text-white/65">
                The reset link expires after 60 minutes and can only be used once.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2.5rem] border border-white/60 bg-white/92 p-8 shadow-[0_30px_90px_rgba(127,18,21,0.12)]"
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Password Help</p>
            <h2 className="mt-3 text-3xl font-display font-bold text-dark">Send reset link</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Enter the email address connected to your Chicken House account.
            </p>

            {error ? (
              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
                <AlertCircle size={18} />
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm font-medium text-green-700">
                <CheckCircle2 size={18} />
                {message}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.24em] text-dark">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input
                    type="email"
                    placeholder={siteConfig.email}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-2xl bg-surface px-12 py-4 outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-bold text-white transition hover:bg-primary-strong disabled:opacity-70"
              >
                {isSubmitting ? "Sending Link..." : "Send Reset Link"}
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-muted">
              Remember your password?{" "}
              <Link to="/login" className="font-bold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ForgotPasswordPage;
