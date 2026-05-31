import { motion } from "motion/react";
import {
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  Sparkles,
  Flame,
  Clock3,
} from "lucide-react";
import { Link } from "react-router-dom";
import { connectChannels, siteConfig, socialMediaLinks } from "../../lib/site";

const Footer = () => {
  const extendedSiteConfig = siteConfig as typeof siteConfig & {
    phoneSecondary?: string;
    deliveryHours?: string;
  };
  const secondaryPhone = extendedSiteConfig.phoneSecondary?.trim();
  const deliveryHours = extendedSiteConfig.deliveryHours ?? siteConfig.hours;

  const footerLinks = [
    { name: "About Us", href: "/about" },
    { name: "Our Menu", href: "/menu" },
    { name: "Book a Table", href: "/booking" },
    { name: "Track Order", href: "/track" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
  ];

  const legalLinks = [
    { name: "Terms", href: "/terms" },
    { name: "Privacy", href: "/privacy" },
    { name: "Cookies", href: "/cookies" },
  ];

  const highlights = [
    {
      icon: <Flame size={18} />,
      title: "Fresh Kitchen",
      detail: "Hot grills, fresh karahi, and made-to-order meals with consistent service.",
    },
    {
      icon: <Sparkles size={18} />,
      title: "Event Ready",
      detail: "Bookings, family platters, indoor seating, and function support from one place.",
    },
    {
      icon: <Clock3 size={18} />,
      title: "Daily Service",
      detail: "Open daily with dine-in, takeaway, delivery, and WhatsApp support.",
    },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#120a07] pb-10 pt-24 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,170,73,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(210,74,21,0.18),transparent_28%)]" />

      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 top-0 border-y border-white/10 bg-white/[0.03] py-3"
      >
        <div className="flex w-[200%] gap-10 whitespace-nowrap font-anton text-2xl uppercase tracking-[0.24em] text-white/20">
          <span>Chicken House</span>
          <span>Live Kitchen</span>
          <span>Signature Platters</span>
          <span>Premium Dining</span>
          <span>Family Nights</span>
          <span>Chicken House</span>
          <span>Live Kitchen</span>
          <span>Signature Platters</span>
          <span>Premium Dining</span>
          <span>Family Nights</span>
        </div>
      </motion.div>

      <div className="relative z-10 mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-12">
        <div className="mb-16 mt-10 rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,170,73,0.08),rgba(255,255,255,0.02))] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.3fr,0.9fr]">
            <div>
              <span className="mb-4 inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/6 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.38em] text-accent">
                Renala Khurd
              </span>
              <h2 className="max-w-3xl text-4xl font-anton uppercase leading-[0.92] tracking-tight md:text-6xl">
                A premium local restaurant experience, built for meals, families, and events.
              </h2>
            </div>
            <div className="grid gap-4">
              {highlights.map((item) => (
                <motion.div
                  key={item.title}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="rounded-[1.8rem] border border-white/10 bg-black/20 px-5 py-4"
                >
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-dark">
                    {item.icon}
                  </div>
                  <p className="font-anton text-2xl uppercase tracking-tight">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-white/60">
                    {item.detail}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-24 grid grid-cols-1 gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Link to="/" className="group mb-12 flex items-center gap-5">
              <img
                src="/logo.jpg"
                alt="Chicken House"
                className="h-20 w-20 rounded-full border-2 border-white/15 object-cover shadow-[0_18px_50px_rgba(255,170,73,0.35)] transition-transform duration-500 group-hover:rotate-6"
              />
              <div>
                <p className="font-anton text-4xl uppercase tracking-tight text-white">
                  {siteConfig.brandName}
                </p>
                <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-white/45">
                  {siteConfig.tagline}
                </p>
              </div>
            </Link>

            <h2 className="mb-10 select-none font-anton text-7xl uppercase leading-[0.8] tracking-tighter opacity-10 pointer-events-none md:text-9xl">
              Fire <br /> Flavor
            </h2>

            <p className="max-w-xl text-xl font-light leading-relaxed text-white/50">
              Chicken House serves dine-in, takeaway, delivery, and special event bookings near Mitchell&apos;s Main Gate and Railways Phatak, Renala Khurd.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:col-span-6">
            <div>
              <span className="mb-8 block font-mono text-[10px] uppercase tracking-[0.5em] text-accent">
                Navigation
              </span>
              <ul className="space-y-6">
                {footerLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="group flex items-center gap-4 font-anton text-3xl uppercase transition-colors hover:text-accent"
                    >
                      {link.name}
                      <ArrowUpRight
                        size={24}
                        className="-translate-x-4 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="mb-8 block font-mono text-[10px] uppercase tracking-[0.5em] text-accent">
                Contact Us
              </span>
              <ul className="space-y-8">
                <li className="flex items-start gap-6">
                  <MapPin size={24} className="shrink-0 text-accent" />
                  <a href={siteConfig.googleMapsUrl} target="_blank" rel="noreferrer" className="text-lg font-light leading-relaxed text-white/60 hover:text-white">
                    {siteConfig.addressLine1}, {siteConfig.addressLine2}
                  </a>
                </li>
                <li className="flex items-center gap-6">
                  <Phone size={24} className="shrink-0 text-accent" />
                  <a href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`} className="text-lg font-light text-white/60 hover:text-white">
                    {siteConfig.phone}
                  </a>
                </li>
                {secondaryPhone ? (
                  <li className="flex items-center gap-6">
                    <Phone size={24} className="shrink-0 text-accent" />
                    <a href={`tel:${secondaryPhone.replace(/\s+/g, "")}`} className="text-lg font-light text-white/60 hover:text-white">
                      {secondaryPhone}
                    </a>
                  </li>
                ) : null}
                <li className="flex items-center gap-6">
                  <Mail size={24} className="shrink-0 text-accent" />
                  <a href={`mailto:${siteConfig.email}`} className="text-lg font-light text-white/60 hover:text-white">
                    {siteConfig.email}
                  </a>
                </li>
              </ul>

              <div className="mt-12">
                <span className="mb-5 block font-mono text-[10px] uppercase tracking-[0.5em] text-accent">
                  Opening Hours
                </span>
                <div className="space-y-3 text-lg font-light text-white/60">
                  <p>Mon-Sun: {siteConfig.hours}</p>
                  <p>Delivery: {deliveryHours}</p>
                </div>
              </div>

              <div className="mt-12">
                <span className="mb-6 block font-mono text-[10px] uppercase tracking-[0.5em] text-accent">
                  Connect
                </span>
                <div className="flex flex-wrap gap-8">
                  {[...socialMediaLinks, ...connectChannels.map((item) => ({ label: item.label, href: item.href }))].map((social) => (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      target={social.href.startsWith("http") ? "_blank" : undefined}
                      rel={social.href.startsWith("http") ? "noreferrer" : undefined}
                      whileHover={{ y: -5, color: "var(--color-accent)" }}
                      className="font-anton text-2xl uppercase text-white/40 transition-colors"
                    >
                      {social.label}
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-8 border-t border-white/10 pt-10 md:flex-row">
          <div className="flex items-center gap-4">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
              Copyright 2026 ChickenHouse. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-12">
            {legalLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="font-mono text-[10px] uppercase tracking-widest text-white/20 transition-colors hover:text-white"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute right-0 top-0 h-[50vw] w-[50vw] translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[150px]" />
      <div className="absolute bottom-0 left-0 h-[50vw] w-[50vw] -translate-x-1/2 translate-y-1/2 rounded-full bg-primary/10 blur-[150px]" />
    </footer>
  );
};

export default Footer;
