import { useEffect, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { Briefcase, MapPin, Clock3, Wallet, CheckCircle2, ArrowRight, Send, AlertCircle } from "lucide-react";
import PageMeta from "../components/layout/PageMeta";
import { siteConfig } from "../lib/site";

const emptyForm = {
  jobId: "",
  name: "",
  email: "",
  phone: "",
  experience: "",
  coverLetter: "",
  resumeUrl: "",
};

const CareerPage = () => {
  const [openings, setOpenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const fetchOpenings = async () => {
      try {
        const response = await fetch("/api/careers/openings");
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          setOpenings(data);
        }
      } catch (error) {
        console.error("Failed to load job openings", error);
      } finally {
        setLoading(false);
      }
    };
    void fetchOpenings();
  }, []);

  const applyTo = (opening) => {
    setForm((prev) => ({ ...prev, jobId: opening.id }));
    setFeedback(null);
    const formEl = document.getElementById("application-form");
    if (formEl) formEl.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleChange = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    if (form.name.trim().length < 2) {
      setFeedback({ type: "error", message: "Please enter your full name." });
      return;
    }
    if (!form.email.includes("@")) {
      setFeedback({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/careers/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        setFeedback({ type: "error", message: data?.message || "Could not submit your application. Please try again." });
        return;
      }

      setFeedback({ type: "success", message: data?.message || "Application submitted! We'll be in touch by email." });
      setForm(emptyForm);
    } catch (error) {
      console.error("Application submit failed", error);
      setFeedback({ type: "error", message: "Could not submit your application. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedOpening = openings.find((opening) => opening.id === form.jobId);

  return (
    <div className="min-h-screen bg-paper">
      <PageMeta
        title="Careers | Chicken House"
        description="Join the Chicken House team in Renala Khurd. View open positions and apply online — chefs, riders, cashiers, and more."
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-dark px-4 pb-20 pt-36 text-white sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,168,47,0.18),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(127,18,21,0.35),transparent_50%)]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.32em] text-accent"
          >
            <Briefcase size={14} /> Careers at Chicken House
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 font-display text-5xl font-bold leading-tight md:text-6xl"
          >
            Build your career with <span className="text-accent">Chicken House</span>.
          </motion.h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
            We're a growing restaurant brand in Renala Khurd looking for passionate people — in the
            kitchen, on the road, and at the counter. Find a role that fits and apply in minutes.
          </p>
          <button
            onClick={() => document.getElementById("application-form")?.scrollIntoView({ behavior: "smooth" })}
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 font-bold text-dark transition hover:bg-white"
          >
            Apply Now <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Open positions */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-display text-4xl font-bold text-dark">Open Positions</h2>
          <p className="mt-3 text-muted">
            {loading ? "Loading positions…" : openings.length ? `${openings.length} role${openings.length === 1 ? "" : "s"} currently open` : "No open positions right now — you can still send a general application below."}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {openings.map((opening) => (
            <motion.div
              key={opening.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col rounded-[2rem] border border-[#eadcc8] bg-white p-8 shadow-lg shadow-dark/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-dark">{opening.title}</h3>
                  <p className="mt-1 text-sm font-bold uppercase tracking-widest text-primary">{opening.department}</p>
                </div>
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold text-dark">{opening.type}</span>
              </div>

              <p className="mt-4 leading-relaxed text-muted">{opening.description}</p>

              <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted">
                <span className="inline-flex items-center gap-2"><MapPin size={16} className="text-accent" /> {opening.location}</span>
                {opening.salaryRange ? (
                  <span className="inline-flex items-center gap-2"><Wallet size={16} className="text-accent" /> {opening.salaryRange}</span>
                ) : null}
                <span className="inline-flex items-center gap-2"><Clock3 size={16} className="text-accent" /> {opening.type}</span>
              </div>

              {Array.isArray(opening.requirements) && opening.requirements.length > 0 && (
                <ul className="mt-5 space-y-2">
                  {opening.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-dark/80">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-600" /> {req}
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={() => applyTo(opening)}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-white transition hover:bg-primary-strong"
              >
                Apply for this role <ArrowRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Application form */}
      <section id="application-form" className="bg-surface px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h2 className="font-display text-4xl font-bold text-dark">Apply Now</h2>
            <p className="mt-3 text-muted">
              {selectedOpening ? `Applying for: ` : "Send us your details and we'll review your application."}
              {selectedOpening ? <span className="font-bold text-primary">{selectedOpening.title}</span> : null}
            </p>
          </div>

          {feedback && (
            <div
              className={`mb-6 flex items-center gap-3 rounded-2xl border p-4 text-sm font-medium ${
                feedback.type === "success"
                  ? "border-green-100 bg-green-50 text-green-700"
                  : "border-red-100 bg-red-50 text-red-600"
              }`}
            >
              {feedback.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 rounded-[2.5rem] border border-[#eadcc8] bg-white p-8 shadow-xl shadow-dark/5">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-dark">Position</label>
              <select
                value={form.jobId}
                onChange={handleChange("jobId")}
                className="w-full rounded-2xl bg-surface px-4 py-4 outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">General Application</option>
                {openings.map((opening) => (
                  <option key={opening.id} value={opening.id}>{opening.title}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-dark">Full Name</label>
                <input value={form.name} onChange={handleChange("name")} placeholder="Your name" className="w-full rounded-2xl bg-surface px-4 py-4 outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-dark">Phone</label>
                <input value={form.phone} onChange={handleChange("phone")} placeholder="03xx-xxxxxxx" className="w-full rounded-2xl bg-surface px-4 py-4 outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-dark">Email</label>
              <input type="email" value={form.email} onChange={handleChange("email")} placeholder={siteConfig.email} className="w-full rounded-2xl bg-surface px-4 py-4 outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-dark">Experience</label>
              <input value={form.experience} onChange={handleChange("experience")} placeholder="e.g. 3 years as a line cook" className="w-full rounded-2xl bg-surface px-4 py-4 outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-dark">Resume / CV link <span className="text-muted">(optional)</span></label>
              <input value={form.resumeUrl} onChange={handleChange("resumeUrl")} placeholder="Google Drive / Dropbox link" className="w-full rounded-2xl bg-surface px-4 py-4 outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-dark">Cover note</label>
              <textarea value={form.coverLetter} onChange={handleChange("coverLetter")} rows={4} placeholder="Tell us why you'd be a great fit…" className="w-full resize-none rounded-2xl bg-surface px-4 py-4 outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-bold text-white transition hover:bg-primary-strong disabled:opacity-70"
            >
              {submitting ? "Submitting…" : "Submit Application"}
              <Send size={18} />
            </button>
            <p className="text-center text-sm text-muted">You'll receive our decision by email.</p>
          </form>
        </div>
      </section>
    </div>
  );
};

export default CareerPage;
