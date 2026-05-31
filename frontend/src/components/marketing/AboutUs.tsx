import { motion } from "motion/react";
import { MapPin, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { siteConfig } from "../../lib/site";

const AboutUs = () => {
  const pillars = [
    {
      icon: <MapPin size={24} />,
      label: "GT Road Location",
      value: "Renala Khurd",
    },
    {
      icon: <Users size={24} />,
      label: "Family Dining",
      value: "Indoor & Outdoor",
    },
    {
      icon: <ShieldCheck size={24} />,
      label: "Service Focus",
      value: "Fresh & Reliable",
    },
    {
      icon: <Sparkles size={24} />,
      label: "Experience",
      value: "Food, Events, Delivery",
    },
  ];

  return (
    <section className="overflow-hidden bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <span className="mb-4 block text-sm font-bold uppercase tracking-widest text-primary">Our Story</span>
              <h2 className="text-4xl font-display font-bold leading-tight text-dark md:text-5xl">
                A modern local dining experience built around fresh chicken meals, family comfort, and dependable service.
              </h2>
            </div>
            <p className="text-lg leading-relaxed text-muted">
              Chicken House serves Renala Khurd from a landmark location near Mitchell&apos;s Main Gate and Railways Phatak. The focus is simple: flavorful food, clean presentation, comfortable seating, and a digital experience that makes ordering and booking easy.
            </p>
            <p className="text-lg leading-relaxed text-muted">
              From dine-in and takeaway to delivery, events, and customer support, the brand is designed to feel professional, welcoming, and ready for real restaurant operations.
            </p>
            <div className="grid grid-cols-2 gap-8">
              {pillars.map((pillar) => (
                <div key={pillar.label} className="space-y-2">
                  <div className="text-primary">{pillar.icon}</div>
                  <p className="text-2xl font-display font-bold text-dark">{pillar.value}</p>
                  <p className="text-sm font-medium text-muted">{pillar.label}</p>
                </div>
              ))}
            </div>
            <Link to="/about" className="inline-flex rounded-full bg-primary px-8 py-4 font-bold text-white transition hover:bg-primary-strong">
              Learn More
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative z-10 overflow-hidden rounded-[3rem] shadow-2xl">
              <img
                src={siteConfig.aboutAmbienceImage}
                alt="Chicken House restaurant location"
                className="h-[600px] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 -z-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -right-10 -top-10 -z-10 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
