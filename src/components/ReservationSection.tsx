import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Users, Send, CheckCircle } from "lucide-react";

const ReservationSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "2",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          eventType: "table-booking",
          zone: "indoor",
          guests: Number(formData.guests),
          package: "custom",
          date: formData.date,
          time: formData.time,
          specialRequests: formData.message,
          source: "homepage-reservation",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Reservation could not be submitted.");
      }

      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        guests: "2",
        message: "",
      });
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (submitError) {
      console.error(submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Reservation could not be submitted right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section className="relative overflow-hidden bg-surface py-32">
      <div className="absolute right-0 top-0 hidden h-full w-1/2 bg-dark lg:block" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-24 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span className="mb-8 block font-mono text-xs uppercase tracking-[0.5em] text-primary">Reservations</span>
            <h2 className="mb-12 text-6xl font-display font-bold leading-[0.9] tracking-tighter text-dark md:text-8xl">
              Book Your <br />
              <span className="text-primary italic">Table</span> Now.
            </h2>
            <p className="mb-12 max-w-xl text-xl font-light leading-relaxed text-muted">
              Reserve a table for family dinners, casual meetups, and planned visits directly from the homepage.
            </p>

            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-primary shadow-xl">
                  <Calendar size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-dark">Live Reservation Request</h4>
                  <p className="text-sm text-muted">Submits directly into the restaurant booking flow</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-accent shadow-xl">
                  <Users size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-dark">Group Friendly</h4>
                  <p className="text-sm text-muted">Suitable for couples, families, and larger gatherings</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative overflow-hidden rounded-[4rem] border border-gray-50 bg-white p-10 shadow-2xl shadow-dark/10 md:p-16"
          >
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle size={48} />
                  </div>
                  <h3 className="mb-4 text-3xl font-bold text-dark">Reservation Received</h3>
                  <p className="mb-8 text-lg text-muted">Your booking request has been saved and the team will confirm your table shortly.</p>
                  <motion.button onClick={() => setIsSubmitted(false)} className="font-bold text-primary hover:underline">
                    Make another reservation
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-8"
                >
                  {error && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="floating-label-group">
                      <input type="text" id="res-name" name="name" placeholder=" " className="w-full rounded-2xl bg-surface px-6 py-4 transition-all focus:ring-2 focus:ring-primary/20" required value={formData.name} onChange={handleChange} />
                      <label htmlFor="res-name" className="floating-label">Full Name</label>
                    </div>
                    <div className="floating-label-group">
                      <input type="email" id="res-email" name="email" placeholder=" " className="w-full rounded-2xl bg-surface px-6 py-4 transition-all focus:ring-2 focus:ring-primary/20" required value={formData.email} onChange={handleChange} />
                      <label htmlFor="res-email" className="floating-label">Email Address</label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="floating-label-group">
                      <input type="tel" id="res-phone" name="phone" placeholder=" " className="w-full rounded-2xl bg-surface px-6 py-4 transition-all focus:ring-2 focus:ring-primary/20" required value={formData.phone} onChange={handleChange} />
                      <label htmlFor="res-phone" className="floating-label">Phone Number</label>
                    </div>
                    <div className="floating-label-group">
                      <input type="date" id="res-date" name="date" className="w-full rounded-2xl bg-surface px-6 py-4 transition-all focus:ring-2 focus:ring-primary/20" required value={formData.date} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="floating-label-group">
                      <input type="time" id="res-time" name="time" className="w-full rounded-2xl bg-surface px-6 py-4 transition-all focus:ring-2 focus:ring-primary/20" required value={formData.time} onChange={handleChange} />
                    </div>
                    <div className="floating-label-group">
                      <select id="res-guests" name="guests" className="w-full appearance-none rounded-2xl bg-surface px-6 py-4 transition-all focus:ring-2 focus:ring-primary/20" required value={formData.guests} onChange={handleChange}>
                        <option value="1">1 Guest</option>
                        <option value="2">2 Guests</option>
                        <option value="4">4 Guests</option>
                        <option value="6">6 Guests</option>
                        <option value="10">10 Guests</option>
                      </select>
                    </div>
                  </div>

                  <div className="floating-label-group">
                    <textarea id="res-message" name="message" rows={4} placeholder=" " className="w-full resize-none rounded-2xl bg-surface px-6 py-4 transition-all focus:ring-2 focus:ring-primary/20" value={formData.message} onChange={handleChange} />
                    <label htmlFor="res-message" className="floating-label">Special Requests</label>
                  </div>

                  <motion.button type="submit" disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-5 font-bold text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary-dark disabled:opacity-70">
                    {isSubmitting ? <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <>Confirm Reservation <Send size={20} /></>}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ReservationSection;
