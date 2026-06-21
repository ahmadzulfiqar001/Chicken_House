import React, { useState } from "react";
import { motion } from "motion/react";
import { Send, Mail, UserMinus } from "lucide-react";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Subscription failed. Please try again.");
      }

      setSuccess("You're subscribed!");
      setEmail("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Subscription failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnsubscribe = async () => {
    setSuccess("");
    setError("");

    if (!email.trim()) {
      setError("Enter your email address first, then tap Remove my email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Unsubscribe failed. Please try again.");
      }

      setSuccess(data.message ?? "You've been unsubscribed.");
      setEmail("");
    } catch (unsubscribeError) {
      setError(unsubscribeError instanceof Error ? unsubscribeError.message : "Unsubscribe failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="bg-dark rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl"
        >
          {/* Background Accents */}
          <div className="absolute top-0 left-0 w-full h-full atmosphere opacity-30" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />

          <div className="relative z-10 mx-auto max-w-5xl">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-12 text-accent">
              <Mail size={40} />
            </div>
            
            <span className="text-accent font-mono text-xs uppercase tracking-[0.5em] mb-8 block">Stay Updated</span>
            <h2 className="text-5xl md:text-7xl font-display font-bold text-white mb-8 tracking-tighter">
              Join Our <span className="text-primary italic">Flavor</span> Circle.
            </h2>
            <p className="mx-auto mb-10 max-w-[62rem] whitespace-normal text-[clamp(0.95rem,1.55vw,1.25rem)] font-light leading-relaxed text-white/65 lg:mb-12 lg:whitespace-nowrap">
              Be the first to know about our new dishes, special events, and exclusive offers in Renala Khurd.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-8 py-6 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-primary transition-all outline-none text-lg"
                  required
                />
              </div>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-6 rounded-2xl bg-primary text-white font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-60"
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
                <Send size={20} />
              </motion.button>
            </form>

            {success && (
              <p className="mt-6 text-base font-semibold text-accent" aria-live="polite">{success}</p>
            )}
            {error && (
              <p className="mt-6 text-base font-semibold text-red-300" aria-live="polite">{error}</p>
            )}

            <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center justify-center gap-3 text-white/65 sm:flex-row sm:flex-wrap">
              <p className="text-base font-medium sm:text-lg">
                We respect your privacy. Use the same email to unsubscribe anytime.
              </p>
              <button
                type="button"
                onClick={handleUnsubscribe}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold text-accent transition hover:border-accent/60 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Remove my email
                <UserMinus size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;
