import { FormEvent, useMemo, useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, ArrowRight, CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import PageMeta from "../components/layout/PageMeta";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Reset link is missing or invalid.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(String(data.message ?? "Unable to reset your password."));
        return;
      }

      setPassword("");
      setConfirmPassword("");
      setMessage(String(data.message ?? "Password reset successfully."));
    } catch (requestError) {
      console.error("Reset password request failed", requestError);
      setError("Unable to reset your password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#f8dfac_0%,#fff7ea_40%,#fffdf8_100%)]">
      <PageMeta
        title="Reset Password | Chicken House"
        description="Set a new password for your Chicken House account."
      />

      <section className="px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2.5rem] border border-white/60 bg-white/92 p-8 shadow-[0_30px_90px_rgba(127,18,21,0.12)]"
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Account Security</p>
            <h1 className="mt-3 text-3xl font-display font-bold text-dark">Create a new password</h1>
            <p className="mt-3 text-sm leading-7 text-muted">
              Choose a new password for your Chicken House account.
            </p>

            {!token ? (
              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
                <AlertCircle size={18} />
                Reset link is missing or invalid.
              </div>
            ) : null}

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
                <label className="text-xs font-bold uppercase tracking-[0.24em] text-dark">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input
                    type="password"
                    placeholder="Enter a new password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl bg-surface px-12 py-4 outline-none"
                    disabled={!token || Boolean(message)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.24em] text-dark">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input
                    type="password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-2xl bg-surface px-12 py-4 outline-none"
                    disabled={!token || Boolean(message)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !token || Boolean(message)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-bold text-white transition hover:bg-primary-strong disabled:opacity-70"
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-muted">
              {message ? "Ready to continue?" : "Need a new link?"}{" "}
              <Link to={message ? "/login" : "/forgot-password"} className="font-bold text-primary hover:underline">
                {message ? "Sign in" : "Request reset link"}
              </Link>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2.5rem] bg-dark p-8 text-white shadow-[0_30px_90px_rgba(10,5,2,0.32)]"
          >
            <img src="/logo.jpg" alt="Chicken House" className="h-18 w-18 rounded-[1.5rem] object-cover shadow-xl shadow-black/20" />
            <h2 className="mt-8 text-4xl font-display font-bold leading-tight">One secure link. One new password.</h2>
            <p className="mt-4 text-sm leading-8 text-white/68">
              After your password changes, existing sessions are signed out so your next login starts fresh.
            </p>

            <div className="mt-10 rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-orange-300" />
                <p className="text-sm font-bold uppercase tracking-[0.24em]">Protected Reset</p>
              </div>
              <p className="mt-3 text-sm leading-7 text-white/65">
                Expired or already used links are rejected automatically.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ResetPasswordPage;
