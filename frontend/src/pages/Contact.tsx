import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Calendar, Clock3, MapPin, MessageCircle, Send, ShieldCheck, Store } from "lucide-react";
import { Link } from "react-router-dom";
import PageMeta from "../components/layout/PageMeta";
import { useToast } from "../components/layout/ToastProvider";
import { buildWhatsAppUrl, connectChannels, siteConfig, socialMediaLinks } from "../lib/site";

const normalizePhone = (value: string) => value.replace(/[^\d+]/g, "");

const ContactPage = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);

  const quickStats = useMemo(
    () => [
      {
        icon: Store,
        title: "Visit the Restaurant",
        text: `${siteConfig.addressLine1}, ${siteConfig.addressLine2}, ${siteConfig.city}`,
      },
      {
        icon: Clock3,
        title: "Daily Service Window",
        text: `Open every day from ${siteConfig.hours} for dine-in, takeaway, and delivery.`,
      },
      {
        icon: ShieldCheck,
        title: "Fast Follow-up",
        text: "Contact requests are stored in the system so the team can respond with better continuity.",
      },
    ],
    [],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: name === "phone" ? normalizePhone(value) : value,
    }));
  };

  const validate = () => {
    if (formData.name.trim().length < 2) {
      return "Please enter your full name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (formData.phone && !/^\+?[0-9\s-]{10,16}$/.test(formData.phone.trim())) {
      return "Please enter a valid contact number.";
    }

    if (formData.subject.trim().length < 3) {
      return "Please add a short subject for your message.";
    }

    if (formData.message.trim().length < 10) {
      return "Please add a more detailed message.";
    }

    return "";
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationError = validate();
    setError(validationError);

    if (validationError) {
      showToast({
        tone: "error",
        title: "Message could not be sent",
        description: validationError,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          source: "contact-page",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Unable to send your message.");
      }

      setIsSubmitted(true);
      setError("");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      showToast({
        tone: "success",
        title: "Message sent",
        description: "Your contact request has been added to the restaurant inbox.",
      });
      window.setTimeout(() => setIsSubmitted(false), 5000);
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Unable to send your message right now.";
      setError(message);
      showToast({
        tone: "error",
        title: "Contact request failed",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-paper pt-28">
      <PageMeta
        title="Contact | Chicken House"
        description="Contact Chicken House in Renala Khurd for bookings, delivery support, location guidance, and restaurant inquiries."
      />

      <section className="relative pb-14 pt-4 sm:pt-8">
        <div className="absolute inset-x-0 top-0 h-[25rem] bg-[radial-gradient(circle_at_top_right,rgba(255,170,73,0.18),transparent_38%),radial-gradient(circle_at_top_left,rgba(210,74,21,0.12),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 xl:gap-14">
            <div className="min-w-0 space-y-7">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex max-w-full rounded-full border border-primary/10 bg-primary/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-primary sm:text-xs sm:tracking-[0.32em]"
              >
                Contact Chicken House
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 }}
                className="max-w-2xl text-4xl font-display font-bold leading-tight text-dark sm:text-5xl lg:text-[3.55rem]"
              >
                Clear restaurant contact, fast help channels, and a location customers can reach without confusion.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="max-w-2xl text-lg leading-8 text-muted"
              >
                Use the form for detailed questions, open WhatsApp for quick help, or navigate directly to the
                Chicken House branch near Mitchell&apos;s Fruit Farm and Fair Price Shop on GT Road in Renala Khurd.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="flex flex-wrap gap-4"
              >
                <a
                  href={buildWhatsAppUrl("Hello Chicken House, I need help with menu, booking, delivery, or location.")}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 font-bold text-white shadow-xl shadow-primary/20 transition hover:bg-primary-dark"
                >
                  WhatsApp Support
                  <MessageCircle size={18} />
                </a>
                <a
                  href={siteConfig.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-7 py-4 font-bold text-dark transition hover:border-primary/30 hover:text-primary"
                >
                  Open Google Maps
                  <MapPin size={18} />
                </a>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative mx-auto w-full max-w-xl lg:max-w-none"
            >
              <div className="aspect-[4/3] overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-[0_32px_90px_rgba(27,18,14,0.12)] sm:rounded-[3rem]">
                <img
                  src={siteConfig.contactHeroImage}
                  alt="Chicken House GT Road location"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-4 max-w-xs rounded-[2rem] border border-white/70 bg-white/95 p-5 shadow-2xl shadow-dark/10 backdrop-blur-xl sm:absolute sm:-bottom-7 sm:left-6 sm:mt-0">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Landmark Reference</p>
                <p className="mt-3 text-sm leading-7 text-dark">
                  Near Mitchell&apos;s Fair Price Shop on GT Road, with quick directions available through Google Maps
                  and WhatsApp.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {connectChannels.map((channel, index) => (
              <motion.a
                key={channel.label}
                href={channel.href}
                target={channel.href.startsWith("http") ? "_blank" : undefined}
                rel={channel.href.startsWith("http") ? "noreferrer" : undefined}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true, margin: "-80px" }}
                className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-xl shadow-dark/5 transition duration-300 hover:-translate-y-1 hover:border-primary/15 hover:shadow-2xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <channel.icon size={22} />
                </div>
                <h2 className="mt-5 text-2xl font-bold text-dark">{channel.label}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">{channel.description}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              className="rounded-[3rem] border border-gray-100 bg-white p-8 shadow-[0_30px_90px_rgba(27,18,14,0.08)] md:p-10"
            >
              <div className="mb-8 flex items-start justify-between gap-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Send a Message</p>
                  <h2 className="mt-3 text-3xl font-display font-bold text-dark">Reach the team with full context.</h2>
                </div>
                <div className="hidden rounded-2xl bg-surface px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.22em] text-muted md:block">
                  Response Path
                  <p className="mt-2 text-[11px] tracking-[0.14em] text-dark">Stored in contact inbox</p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="flex min-h-[26rem] flex-col items-center justify-center rounded-[2.5rem] bg-surface p-8 text-center"
                  >
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <Send size={34} />
                    </div>
                    <h3 className="mt-6 text-3xl font-display font-bold text-dark">Message Sent</h3>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
                      Your message has been added to the Chicken House contact queue. The team can now review it from
                      the admin side and follow up through your provided channel.
                    </p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="mt-8 rounded-full border border-gray-200 bg-white px-6 py-3 font-bold text-dark transition hover:border-primary/30 hover:text-primary"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    {error ? (
                      <div className="rounded-[1.8rem] border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
                        {error}
                      </div>
                    ) : null}

                    <div className="grid gap-6 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-muted">Full Name</span>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full rounded-[1.6rem] border border-gray-200 bg-surface px-5 py-4 outline-none transition focus:border-primary/30 focus:bg-white"
                          placeholder="Your full name"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-muted">Email Address</span>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full rounded-[1.6rem] border border-gray-200 bg-surface px-5 py-4 outline-none transition focus:border-primary/30 focus:bg-white"
                          placeholder={siteConfig.email}
                        />
                      </label>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-muted">Phone Number</span>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full rounded-[1.6rem] border border-gray-200 bg-surface px-5 py-4 outline-none transition focus:border-primary/30 focus:bg-white"
                          placeholder={siteConfig.phone}
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-muted">Subject</span>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full rounded-[1.6rem] border border-gray-200 bg-surface px-5 py-4 outline-none transition focus:border-primary/30 focus:bg-white"
                          placeholder="Reservation, delivery, event, or support"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-muted">Message</span>
                      <textarea
                        name="message"
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full resize-none rounded-[1.8rem] border border-gray-200 bg-surface px-5 py-4 outline-none transition focus:border-primary/30 focus:bg-white"
                        placeholder="Share your question, preferred timing, or booking details here."
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-primary px-6 py-4 font-bold text-white shadow-xl shadow-primary/20 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Sending Message
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send size={18} />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                className="rounded-[3rem] border border-gray-100 bg-white p-7 shadow-[0_30px_90px_rgba(27,18,14,0.08)]"
              >
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Restaurant Snapshot</p>
                <div className="mt-5 grid gap-4">
                  {quickStats.map((item) => (
                    <div key={item.title} className="rounded-[1.8rem] bg-surface p-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <item.icon size={20} />
                      </div>
                      <h3 className="mt-4 text-xl font-bold text-dark">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-muted">{item.text}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/booking"
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-dark transition hover:border-primary/30 hover:text-primary"
                  >
                    Book a Table
                    <Calendar size={16} />
                  </Link>
                  <Link
                    to="/menu"
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-dark transition hover:border-primary/30 hover:text-primary"
                  >
                    Browse Menu
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                className="relative overflow-hidden rounded-[3rem] border border-gray-100 bg-white shadow-[0_30px_90px_rgba(27,18,14,0.08)]"
              >
                <div className="relative h-[24rem]">
                  {!mapLoaded ? (
                    <div className="absolute inset-0 flex animate-pulse items-center justify-center bg-[linear-gradient(135deg,#f9f5ef,#f2e6d8,#efe4d2)] text-sm font-bold uppercase tracking-[0.24em] text-muted">
                      Loading map
                    </div>
                  ) : null}
                  <iframe
                    src={siteConfig.googleMapsEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    title="Chicken House location map"
                    onLoad={() => setMapLoaded(true)}
                    className={`h-full w-full transition duration-500 ${mapLoaded ? "opacity-100" : "opacity-0"}`}
                  />
                </div>
                <div className="grid gap-4 p-6 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Address</p>
                    <p className="mt-2 text-sm leading-7 text-dark">
                      {siteConfig.addressLine1}, {siteConfig.addressLine2}, {siteConfig.city}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Social & Support</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {[...socialMediaLinks, { label: "WhatsApp", href: buildWhatsAppUrl("Hello Chicken House, I need assistance.") }].map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-gray-200 bg-surface px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-dark transition hover:border-primary/30 hover:text-primary"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
