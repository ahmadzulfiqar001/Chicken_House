import { motion } from "motion/react";
import { ArrowUpRight, Clock3, MapPin, ShieldCheck, Sparkles, UtensilsCrossed } from "lucide-react";
import { Link } from "react-router-dom";
import PageMeta from "../components/layout/PageMeta";
import { siteConfig } from "../lib/site";

const serviceHighlights = [
  {
    icon: MapPin,
    title: "Recognizable Location",
    text: `${siteConfig.addressLine1}, ${siteConfig.addressLine2}, ${siteConfig.city}.`,
  },
  {
    icon: Clock3,
    title: "Open Daily",
    text: `Dine-in, takeaway, delivery, and event coordination from ${siteConfig.hours}.`,
  },
  {
    icon: UtensilsCrossed,
    title: "Food-Led Experience",
    text: "Karahi, BBQ, platters, burgers, pizza, and family meals supported by a digital order journey.",
  },
  {
    icon: ShieldCheck,
    title: "Clean Trust Signals",
    text: "Real contact channels, mapped location, booking queue visibility, and customer-first website flow.",
  },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-paper pt-28">
      <PageMeta
        title="About | Chicken House"
        description="Learn the Chicken House story, discover our GT Road location in Renala Khurd, and explore the service approach behind the restaurant."
      />

      <section className="relative pb-16">
        <div className="absolute inset-x-0 top-0 h-[26rem] bg-[radial-gradient(circle_at_top_right,rgba(255,170,73,0.18),transparent_40%),radial-gradient(circle_at_top_left,rgba(210,74,21,0.12),transparent_32%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-8">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex rounded-full border border-primary/10 bg-primary/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.32em] text-primary"
              >
                The Chicken House Story
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 }}
                className="max-w-3xl text-5xl font-display font-bold leading-tight text-dark md:text-6xl"
              >
                Local restaurant energy, now shaped into a more polished digital experience.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="max-w-2xl text-lg leading-8 text-muted"
              >
                Chicken House serves customers from a landmark spot on GT Road in Renala Khurd, close to
                Mitchell&apos;s Fruit Farm and Mitchell&apos;s Fair Price Shop. The goal is simple: combine strong
                food presentation, practical family dining, and smoother online ordering into one experience that
                feels modern without losing the local restaurant character.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 font-bold text-white shadow-xl shadow-primary/20 transition hover:bg-primary-dark"
                >
                  View Menu
                  <ArrowUpRight size={18} />
                </Link>
                <a
                  href={siteConfig.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-7 py-4 font-bold text-dark transition hover:border-primary/30 hover:text-primary"
                >
                  Open Location
                  <MapPin size={18} />
                </a>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute -left-4 top-8 hidden h-36 w-36 rounded-full bg-primary/10 blur-3xl md:block" />
              <div className="overflow-hidden rounded-[3rem] border border-gray-100 bg-white shadow-[0_32px_90px_rgba(27,18,14,0.12)]">
                <img
                  src={siteConfig.aboutHeroImage}
                  alt="Chicken House restaurant exterior illustration"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 right-6 max-w-xs rounded-[2rem] border border-white/60 bg-white/95 p-5 shadow-2xl shadow-dark/10 backdrop-blur-xl">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Location Anchor</p>
                <p className="mt-3 text-sm leading-7 text-dark">
                  Near Mitchell&apos;s Fruit Farm and Fair Price Shop on GT Road, making the restaurant easier to find
                  for dine-in guests, delivery riders, and event visitors.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {serviceHighlights.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                viewport={{ once: true, margin: "-80px" }}
                className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-xl shadow-dark/5 transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <item.icon size={22} />
                </div>
                <h2 className="mt-5 text-2xl font-bold text-dark">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="overflow-hidden rounded-[3rem] border border-gray-100 bg-dark shadow-[0_32px_90px_rgba(27,18,14,0.18)]"
          >
            <img
              src={siteConfig.aboutAmbienceImage}
              alt="Chicken House dining ambience illustration"
              className="h-full w-full object-cover"
            />
          </motion.div>

          <div className="space-y-7">
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-accent"
            >
              <Sparkles size={14} />
              Trust Building
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              viewport={{ once: true, margin: "-80px" }}
              className="text-4xl font-display font-bold text-dark"
            >
              The brand is strongest when food quality, communication, and convenience all feel aligned.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              viewport={{ once: true, margin: "-80px" }}
              className="text-base leading-8 text-muted"
            >
              Instead of filling the page with exaggerated numbers, this section focuses on credible customer trust:
              real contact channels, visible location references, structured ordering, booking visibility for the
              admin team, and page design that feels neat on phones as well as larger screens.
            </motion.p>

            <div className="grid gap-4">
              {siteConfig.trustPoints.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: 14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                  viewport={{ once: true, margin: "-80px" }}
                  className="flex items-start gap-4 rounded-[1.8rem] border border-gray-100 bg-white px-5 py-5 shadow-lg shadow-dark/5"
                >
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ShieldCheck size={18} />
                  </div>
                  <p className="text-sm leading-7 text-dark">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[3rem] border border-gray-100 bg-white p-8 shadow-[0_30px_90px_rgba(27,18,14,0.08)] md:p-10">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Why This Matters</p>
                <h2 className="mt-4 text-4xl font-display font-bold text-dark">One place for dining, delivery, and direct customer connection.</h2>
              </div>
              <div className="grid gap-5">
                {siteConfig.storyPillars.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    viewport={{ once: true, margin: "-80px" }}
                    className="rounded-[2rem] bg-surface p-5"
                  >
                    <h3 className="text-xl font-bold text-dark">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted">{item.detail}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
