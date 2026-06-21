import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  Award,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CarFront,
  CheckCircle2,
  ChefHat,
  Flame,
  Fish,
  Heart,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Navigation,
  PartyPopper,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  TicketPercent,
  TrainFront,
  Trophy,
  Truck,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageMeta from "../components/layout/PageMeta";
import { buildWhatsAppUrl, siteConfig } from "../lib/site";

const ceoPortrait = new URL("../../assets/source-images/Cafe Images/CEO.jpeg", import.meta.url).href;
const ceoMessagePortrait = new URL("../../assets/source-images/Cafe Images/ceo msg.jpeg", import.meta.url).href;
const attiquePortrait = new URL("../../assets/source-images/Cafe Images/attique-ur-rehman.jpeg", import.meta.url).href;
const hifzPortrait = new URL("../../assets/source-images/Cafe Images/hifz-ur-rehman.jpeg", import.meta.url).href;
const cafeBbqSection = new URL("../../assets/source-images/Cafe Images/bbq section.png", import.meta.url).href;
const cafeCookingArea = new URL("../../assets/source-images/Cafe Images/cooking area.png", import.meta.url).href;
const cafeFront = new URL("../../assets/source-images/Cafe Images/front.png", import.meta.url).href;
const cafeIndoorSitting = new URL("../../assets/source-images/Cafe Images/indor sitting.png", import.meta.url).href;
const cafeSittingPlayArea = new URL("../../assets/source-images/Cafe Images/sitting with play area.png", import.meta.url).href;
const aboutKitchenImage = new URL("../../assets/source-images/image2.jpeg", import.meta.url).href;

const heroStats = [
  { icon: Trophy, value: "20+", label: "Years of taste" },
  { icon: Users, value: "Thousands", label: "Happy customers" },
  { icon: Flame, value: "BBQ & Fish", label: "Signature memory" },
  { icon: Heart, value: "Loved", label: "By generations" },
];

const storyCards = [
  {
    title: "BBQ nights became familiar",
    text: "A simple grill, honest flavor, and the kind of aroma that makes people slow down and ask what is cooking.",
    image: cafeBbqSection,
    icon: Flame,
  },
  {
    title: "Winter fish became a wait",
    text: "When the cool breeze arrives, people remember the fish. It is more than a menu item; it is a seasonal craving.",
    image: cafeIndoorSitting,
    icon: Fish,
  },
  {
    title: "Clean work built trust",
    text: "The live-kitchen feel, clean preparation, and straight dealing helped Chicken House earn word-of-mouth love.",
    image: cafeSittingPlayArea,
    icon: ShieldCheck,
  },
];

const rootedItems = [
  { icon: MapPin, title: "Renala Khurd", text: "Our home" },
  { icon: TrainFront, title: "Near Mitchell's", text: "GT Road reference" },
  { icon: Star, title: "Local pride", text: "Our identity" },
  { icon: UtensilsCrossed, title: "Food memories", text: "That last" },
];

const trustCards = [
  {
    icon: ChefHat,
    title: "Clean Kitchen",
    text: "Hygienic environment, clear preparation, and careful handling every day.",
  },
  {
    icon: Flame,
    title: "Live BBQ Experience",
    text: "Feel the grill energy with food served fresh from the flame.",
  },
  {
    icon: Fish,
    title: "Winter Fish Favorite",
    text: "Our fish becomes a tradition that people wait for every season.",
  },
  {
    icon: HeartHandshake,
    title: "Word-of-Mouth Love",
    text: "Trust grew through recommendations, family visits, and repeat customers.",
  },
];

const journey = [
  {
    year: "1933",
    title: "Mitchell's roots the place",
    text: "Mitchell's fruit-farm history gave Renala Khurd a landmark people still use in daily directions.",
  },
  {
    year: "2003/04",
    title: "The beginning",
    text: "Chicken House became familiar as a small local food spot known for BBQ, fish, and clean preparation.",
  },
  {
    year: "Local fame",
    title: "Taste became talk",
    text: "Quality food and honest service turned into the strongest promotion: people telling other people.",
  },
  {
    year: "Today",
    title: "Same trust, better experience",
    text: "The website now connects that local trust with menu browsing, ordering, tracking, and bookings.",
  },
];

const kitchenPromises = [
  "Fresh ingredients",
  "Clean preparation",
  "Halal food",
  "Family-friendly atmosphere",
  "Customer care",
];

const badges = [
  {
    icon: Trophy,
    title: "Customer-Loved Since 2003/04",
    text: "A long-running local food memory carried by repeat customers and family visits.",
    tone: "from-[#2a1d12] to-[#7f1215]",
  },
  {
    icon: BadgeCheck,
    title: "Quality & Freshness Promise",
    text: "A certificate-style standard for the food values Chicken House wants customers to feel every day.",
    tone: "from-[#11241b] to-[#2f6a45]",
  },
  {
    icon: ShieldCheck,
    title: "Clean Kitchen Discipline",
    text: "A visible commitment to neat preparation, careful service, and trustworthy handling.",
    tone: "from-[#181f2d] to-[#334b78]",
  },
  {
    icon: Award,
    title: "Winter Fish Favorite",
    text: "A seasonal victory: people remember it, ask for it, and wait for the cold months.",
    tone: "from-[#3b250e] to-[#bd761f]",
  },
  {
    icon: MapPin,
    title: "Landmark Trust",
    text: "Mitchell's Main Gate and Railway Phatak make the restaurant easy to locate and easy to remember.",
    tone: "from-[#1d1410] to-[#8a3c20]",
  },
  {
    icon: Sparkles,
    title: "Digital Experience Ready",
    text: "Menu, cart, checkout, order tracking, contact, and booking now sit beside the physical restaurant story.",
    tone: "from-[#25133b] to-[#7f1215]",
  },
];

const loveNotes = [
  {
    title: "The fish is worth the wait",
    text: "Best fish in the area is the kind of memory people keep for winter.",
  },
  {
    title: "Clean kitchen, familiar taste",
    text: "A family-friendly place where the food feels consistent and honest.",
  },
  {
    title: "People come back",
    text: "The strongest proof is simple: customers return and bring others with them.",
  },
];

const marqueeWords = [
  "BBQ",
  "Winter Fish",
  "Live Kitchen",
  "Near Mitchell's",
  "Renala Khurd",
  "Since 2003",
  "Clean Preparation",
  "Word of Mouth",
  "Fresh Karahi",
  "Family Seating",
  "Delivery",
  "Event Meals",
];

const spiceDoodles = [
  { label: "charcoal smoke", className: "left-[42%] top-[24%] rotate-[-7deg]" },
  { label: "lemon salt", className: "left-[36%] top-[13%] rotate-[5deg]" },
  { label: "black pepper", className: "right-[8%] top-[39%] rotate-[-5deg]" },
  { label: "house masala", className: "right-[29%] bottom-[32%] rotate-[8deg]" },
  { label: "winter fish", className: "left-[49%] bottom-[19%] rotate-[6deg]" },
];

const ceoPriorities = [
  "Fresh, high-quality ingredients sourced daily.",
  "Strict hygiene standards from preparation to serving.",
  "Experienced chefs ensuring consistent, authentic taste.",
  "Comfortable family seating and a dedicated kids play area",
  "Quality food at economical and affordable prices",
  "Fresh fruits and vegetables",
  "Courteous service with premium, affordable quality"
];

const Adminstration = [
  {
    name: "Haji Habib Ur Rehman",
    role: "CEO",
    text: "Leading with vision, hospitality, and a lifelong commitment to quality.",
    image: ceoPortrait,
    phone: "0304 5790495",
  },
  {
    name: "Attique-ur-Rehman",
    role: "HR Manager",
    text: "Supporting our people, service culture, and daily team standards.",
    image: attiquePortrait,
    phone: "0300 6970747",
  },
  {
    name: "Hafiz Hifz-ur-Rehman",
    role: "Admin",
    text: "Ensuring smooth operations with dedication, care, and integrity.",
    image: hifzPortrait,
    phone: "0345 7493339",
  },
];

const serviceHighlights = [
  { title: "Online Food Ordering", text: "Direct browsing, food discovery, and order intent in one smooth flow.", icon: ShoppingBag },
  { title: "Table Reservation", text: "Pre-booked tables for family dinners, occasions, and planned visits.", icon: CalendarDays },
  { title: "Event Catering", text: "Functions, birthdays, and corporate meals with a more organized service feel.", icon: PartyPopper },
  { title: "Home Delivery", text: "Travel-ready food handling and responsive delivery support.", icon: Truck },
  { title: "Special Deals", text: "Weekly offers, lunch deals, and value combos to push conversions.", icon: TicketPercent },
];

const serviceConciergeUrl = buildWhatsAppUrl(
  "Assalam o Alaikum Chicken House! Please share menu, booking, delivery, combos, and service details.",
);

const AboutPage = () => {
  const [activeStory, setActiveStory] = useState(0);
  const [activeBadge, setActiveBadge] = useState(0);
  const activeStoryCard = storyCards[activeStory];
  const activeBadgeCard = badges[activeBadge];
  const ActiveBadgeIcon = activeBadgeCard.icon;

  useEffect(() => {
    const storyTimer = window.setInterval(() => {
      setActiveStory((current) => (current + 1) % storyCards.length);
    }, 4500);
    const badgeTimer = window.setInterval(() => {
      setActiveBadge((current) => (current + 1) % badges.length);
    }, 3600);

    return () => {
      window.clearInterval(storyTimer);
      window.clearInterval(badgeTimer);
    };
  }, []);

  return (
    <div className="min-h-screen max-w-[100vw] overflow-x-hidden bg-paper pt-28">
      <PageMeta
        title="About | Chicken House"
        description="Chicken House near Mitchell's Main Gate and Railway Phatak in Renala Khurd: since 2003/04, BBQ, winter fish, clean kitchen trust, victories, badges, and local story."
      />

      <section className="relative isolate overflow-hidden bg-[#f4dcc9] text-dark">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#fffaf1_0%,rgba(247,224,207,0.96)_42%,#f1cdb5_100%),linear-gradient(115deg,rgba(127,18,21,0.08)_0_1px,transparent_1px_24px),linear-gradient(25deg,rgba(216,168,47,0.12)_0_1px,transparent_1px_34px)]" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-paper via-paper/70 to-transparent" />
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 360"
          className="absolute inset-x-0 top-12 hidden h-72 w-full text-primary/16 md:block"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M-40 150 C160 62 326 250 522 144 C715 38 905 48 1090 126 C1240 190 1345 185 1480 102"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.25, ease: "easeOut" }}
          />
          <motion.path
            d="M-80 238 C126 156 282 310 482 218 C705 116 868 156 1058 238 C1228 312 1330 260 1510 178"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="10 18"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.9 }}
            transition={{ delay: 0.18, duration: 1.4, ease: "easeOut" }}
          />
        </svg>


        <svg
          aria-hidden="true"
          viewBox="0 0 1440 190"
          className="absolute inset-x-0 bottom-[-1px] h-40 w-full text-[#fff7ea] sm:h-56"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,86 C170,158 314,62 500,104 C710,152 812,204 1024,112 C1196,38 1316,54 1440,96 L1440,190 L0,190 Z"
          />
        </svg>

        {spiceDoodles.map((item, index) => (
          <motion.span
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: [0, -8, 0] }}
            transition={{ delay: 0.25 + index * 0.12, duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
            className={`pointer-events-none absolute hidden items-center gap-2 rounded-full border border-primary/16 bg-white/62 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary shadow-lg shadow-dark/5 backdrop-blur-md md:inline-flex ${item.className}`}
          >
            <svg aria-hidden="true" viewBox="0 0 38 14" className="h-3 w-8 text-accent">
              <path
                d="M1 9 C7 1 13 1 19 8 S31 15 37 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {item.label}
          </motion.span>
        ))}

        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 pb-8 pt-14 sm:px-8 sm:pb-44 sm:pt-16 md:grid-cols-2 lg:grid-cols-[0.86fr_1.14fr] lg:px-10 lg:pb-48 lg:pt-24">
          <div className="w-full min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 rounded-full border border-primary/16 bg-white/62 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.26em] text-primary shadow-lg shadow-dark/5 backdrop-blur-md"
            >
              <Flame size={15} />
              Renala Khurd - Since 2003
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-6 max-w-[22rem] text-4xl font-display font-bold leading-tight text-dark sm:max-w-4xl sm:text-5xl lg:text-7xl"
            >
              Serving Renala Khurd with taste, trust and warmth since{" "}
              <span className="text-primary">2003</span>.
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.13 }}
              className="mt-5 grid max-w-[22rem] grid-cols-1 gap-2 text-xs font-semibold text-[#6f4d3d] sm:max-w-md sm:grid-cols-2"
            >
              <span className="rounded-lg border border-white/60 bg-white/48 px-4 py-3 shadow-lg shadow-dark/5 backdrop-blur-md">
                Near Mitchell&apos;s landmark
              </span>
              <span className="rounded-lg border border-white/60 bg-white/48 px-4 py-3 shadow-lg shadow-dark/5 backdrop-blur-md">
                Famous by word of mouth
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-8 grid max-w-[22rem] gap-3 sm:flex sm:max-w-none sm:flex-wrap"
            >
              <a
                href="#story"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-white shadow-xl shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-strong"
              >
                Explore Our Story
                <ArrowUpRight size={18} />
              </a>
              <a
                href="#promise"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/18 bg-white/72 px-6 py-3 font-bold text-dark shadow-lg shadow-dark/5 backdrop-blur-md transition hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
              >
                Kitchen Promise
                <ShieldCheck size={18} />
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative min-h-[420px] sm:min-h-[620px]"
          >
            {/* Main Building Image with Organic Shape */}
            <div className="relative h-full w-full overflow-hidden rounded-[3rem] border-[6px] border-white/90 bg-white/50 shadow-[0_34px_100px_rgba(101,55,39,0.24)] backdrop-blur-sm">
              <img
                src={cafeFront}
                alt="Chicken House near Mitchell's landmark"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-white/5" />
            </div>

            {/* Floating Image - Bottom Left (Cooking Area) */}
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-20"
            >
              <div className="relative">
                <div className="absolute inset-[-3px] rounded-2xl bg-white blur-sm"></div>
                <img
                  src={cafeCookingArea}
                  alt="Chicken House cooking area"
                  className="relative h-24 w-40 max-w-[90vw] sm:h-48 sm:w-72 sm:max-w-none rounded-2xl border-4 border-white object-cover shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="relative z-10 mx-auto mt-4 grid max-w-5xl gap-3 px-4 pb-10 sm:-mt-32 sm:grid-cols-2 sm:px-6 sm:pb-14 lg:-mt-36 lg:grid-cols-4">
          {heroStats.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.06 }}
              whileHover={{ y: -6 }}
              className="rounded-lg border-2 border-[#d8a82f]/60 bg-white/95 p-3 text-center shadow-2xl shadow-[#8d4f36]/20 backdrop-blur-md sm:p-4"
            >
              <item.icon size={25} className="mx-auto text-primary" />
              <p className="mt-3 text-xl font-display font-bold text-dark">{item.value}</p>
              <p className="mt-1 text-[11px] text-muted sm:text-xs">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#fff3df] py-14 text-dark sm:py-18">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_22%,rgba(216,168,47,0.2),transparent_26%),radial-gradient(circle_at_10%_78%,rgba(127,18,21,0.08),transparent_28%)]" />
        <motion.svg
          aria-hidden="true"
          viewBox="0 0 120 90"
          initial={{ opacity: 0, rotate: -8 }}
          whileInView={{ opacity: 0.16, rotate: 0 }}
          viewport={{ once: true }}
          className="absolute left-8 top-10 hidden h-24 w-28 text-primary md:block"
        >
          <path d="M18 62 C12 45 22 28 42 29 C52 10 78 14 80 39 C98 40 108 55 100 72 C90 88 64 86 55 70 C45 84 25 78 18 62 Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M75 32 L96 16 M80 43 L108 42 M42 75 L36 88 M62 76 L68 88" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </motion.svg>
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-90px" }}
            className="rounded-2xl border border-primary/12 bg-white/95 p-8 shadow-[0_24px_80px_rgba(62,31,19,0.12)] backdrop-blur-sm"
          >
            <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">Message from the CEO</p>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-dark lg:text-4xl">
              Serving Renala Khurd with taste, trust and care.
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-[#4b352b]">
              <p>
                Chicken House was born out of a simple vision: to serve high-quality food that brings families and friends together.
              </p>
              <p>
                From our very first restaurant in Renala Khurd, we have stayed true to our values of freshness, hygiene, and heartfelt service.
              </p>
              <p className="font-display text-lg font-bold leading-snug text-primary">
                Insha'Allah, we will continue to raise our standards and serve for generations to come.
              </p>
              <p className="rounded-lg border-l-4 border-primary bg-[#fff7ea] px-5 py-3 font-display text-base font-bold leading-7 text-dark shadow-sm">
                We warmly invite you to visit Chicken House and give us the opportunity to serve you and your loved ones.
              </p>
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {ceoPriorities.map((item) => (
                <div key={item} className="flex gap-2 rounded-lg border border-[#ead8bd] bg-[#fffaf1] p-3 text-xs font-semibold leading-5 text-[#3b261d]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-7 border-t border-primary/12 pt-5">
              <p className="font-display text-2xl font-bold text-dark">Haji Habib Ur Rehman</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.24em] text-primary">CEO, Chicken House</p>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-90px" }}
            className="flex items-center justify-center"
          >
            <div className="relative">
              <div className="absolute inset-[-0.75rem] rounded-[2rem] bg-[conic-gradient(from_140deg,#7f1215,#d8a82f,#fff4cf,#7f1215)] opacity-90 blur-[2px]" />
              <div className="absolute inset-[-1.5rem] rounded-[2.25rem] border border-primary/10 bg-white/20 shadow-[0_32px_90px_rgba(62,31,19,0.16)]" />
              <img
                src={ceoMessagePortrait}
                alt="Haji Habib Ur Rehman, CEO of Chicken House"
                className="relative aspect-square h-72 w-72 lg:h-96 lg:w-96 rounded-[1.5rem] border-8 border-[#fff7ea] object-cover object-top shadow-[0_26px_70px_rgba(62,31,19,0.22)]"
              />
            </div>
          </motion.aside>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#fffaf1] py-16 text-dark sm:py-20">
        <img src={cafeFront} alt="" className="absolute inset-0 h-full w-full object-cover opacity-[0.07]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#fffaf1]/96 via-[#fffaf1]/92 to-[#fff7ea]" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-90px" }}>
            <div className="mx-auto flex max-w-xl items-center justify-center gap-5 text-primary">
              <span className="h-px flex-1 bg-primary/50" />
              <span className="text-xs font-black uppercase tracking-[0.34em]">Chicken House</span>
              <span className="h-px flex-1 bg-primary/50" />
            </div>
            <h2 className="mt-5 whitespace-nowrap font-display text-[clamp(2rem,10vw,3rem)] font-black leading-tight text-dark sm:text-6xl lg:text-7xl">
              Administration
            </h2>
            <div className="mx-auto mt-4 h-px max-w-sm bg-gradient-to-r from-transparent via-accent to-transparent" />
            <p className="mx-auto mt-6 max-w-4xl text-lg leading-8 text-[#3d2a22]">
              Meet the dedicated people behind Chicken House, whose years of service, commitment, and leadership continue
              to guide our journey of quality, taste, and hospitality.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-7 lg:grid-cols-3">
            {Adminstration.map((member, index) => (
              <motion.article
                key={member.name}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8 }}
                transition={{ delay: index * 0.07 }}
                viewport={{ once: true, margin: "-90px" }}
                className="rounded-lg border border-[#ead8bd] bg-white/90 p-8 shadow-[0_24px_70px_rgba(62,31,19,0.12)] backdrop-blur-md"
              >
                <div className="mx-auto flex h-52 w-52 items-center justify-center overflow-hidden rounded-full border-[6px] border-[#d8a82f] bg-[#fff7ea] shadow-[0_16px_45px_rgba(216,168,47,0.2)]">
                  <img src={member.image} alt={member.name} className="h-full w-full object-cover object-top" />
                </div>
                <div className="mx-auto mt-8 flex max-w-[16rem] items-center gap-3 text-primary">
                  <span className="h-px flex-1 bg-primary/50" />
                  <Star className="h-4 w-4 fill-primary" />
                  <span className="h-px flex-1 bg-primary/50" />
                </div>
                <h3 className="mt-5 font-display text-3xl font-bold text-dark">{member.name}</h3>
                <span className="mt-4 inline-flex rounded-full bg-primary px-6 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20">
                  {member.role}
                </span>
                <p className="mx-auto mt-5 max-w-xs text-base leading-7 text-[#3d2a22]">{member.text}</p>
                {member.phone && (
                  <a
                    href={`tel:${member.phone.replace(/\s+/g, "")}`}
                    className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-[#ead8bd] bg-[#fff7ea] px-5 py-2 text-base font-bold tracking-wide text-primary shadow-sm transition hover:bg-primary hover:text-white"
                    aria-label={`Call ${member.name} at ${member.phone}`}
                  >
                    <Phone className="h-4 w-4" />
                    {member.phone}
                  </a>
                )}
              </motion.article>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-3xl text-base leading-8 text-[#4b352b]">
            Our success is built on the dedication of people who have served Chicken House with sincerity, responsibility,
            and a strong commitment to customer satisfaction.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#f8ead8] pt-8 sm:pt-10" id="story">
        <div className="absolute right-10 top-14 hidden h-24 w-24 rounded-full border border-primary/12 md:block" />
        <div className="absolute bottom-10 left-12 hidden h-16 w-28 rounded-[50%] border border-accent/30 md:block" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="flex flex-col justify-center text-left"
          >
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-primary">Our Story</p>
            <h2 className="mt-4 max-w-[22rem] break-words text-3xl font-display font-bold text-dark sm:max-w-none sm:text-5xl">
              From a simple flame to a trusted local name.
            </h2>
            <p className="mt-5 max-w-[22rem] text-lg font-medium leading-9 text-[#4b352b] sm:max-w-none">
              Around 2003/2004, Chicken House began with one clear purpose: to serve honest BBQ, fresh meals, and warm hospitality to the community of Renala Khurd.
            </p>
            <p className="mt-4 max-w-[22rem] text-lg font-medium leading-9 text-[#4b352b] sm:max-w-none">
              Families returned for the taste, winter fish became a seasonal memory, and with Allah's grace and customer love, the restaurant grew into a place people trust.
            </p>
            <div className="mt-8 rounded-lg bg-white p-6 shadow-xl shadow-dark/5">
              <BookOpen size={26} className="text-primary" />
              <p className="mt-4 max-w-[20rem] text-xl font-display font-bold italic text-dark sm:max-w-none sm:text-2xl">
                People do not just eat here. They come back.
              </p>
            </div>
          </motion.div>

          <div className="relative min-h-[440px]">
            <motion.div
              aria-hidden="true"
              animate={{ rotate: 360 }}
              transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
              className="absolute inset-8 rounded-full border border-primary/15"
            />
            <motion.div
              aria-hidden="true"
              animate={{ rotate: -360 }}
              transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
              className="absolute inset-16 rounded-full border border-accent/30"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              className="absolute inset-0 overflow-hidden rounded-[1.4rem] bg-dark shadow-2xl shadow-dark/15"
            >
              <motion.img
                src={activeStoryCard.image}
                alt={activeStoryCard.title}
                animate={{ scale: [1, 1.035, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/38 via-transparent to-white/8" />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#eef4e3] py-16 text-dark">
        <motion.svg aria-hidden="true" viewBox="0 0 80 80" animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute right-12 top-12 hidden h-20 w-20 text-primary/12 md:block">
          <path d="M14 45 C12 30 23 20 38 24 C43 10 62 12 64 30 C76 33 78 50 66 59 C54 68 43 61 39 52 C31 64 17 59 14 45 Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-primary">Rooted In A Food-Loving Town</p>
              <h2 className="mt-4 text-3xl font-display font-bold sm:text-4xl">
                Renala Khurd is more than our location. It is our home.
              </h2>
              <p className="mt-5 text-sm leading-8 text-[#4b5a3b]">
                Close to Mitchell&apos;s area on GT Road, Chicken House sits inside a place people already know. The
                restaurant&apos;s story belongs to family visits, road-side directions, and food memories that last.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {rootedItems.map((item, index) => (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -7 }}
                  transition={{ delay: index * 0.06 }}
                  viewport={{ once: true, margin: "-80px" }}
                  className={`group border border-[#c9d6b8] bg-white/70 p-5 text-center shadow-xl shadow-[#63784d]/8 backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white ${
                    index % 2 === 0 ? "rounded-[2.2rem_0.7rem_2.2rem_0.7rem]" : "rounded-[0.7rem_2.2rem_0.7rem_2.2rem]"
                  }`}
                >
                  <item.icon size={34} className="mx-auto text-primary transition group-hover:scale-110" />
                  <h3 className="mt-5 font-display text-xl font-bold">{item.title}</h3>
                  <p className="mt-1 text-xs text-[#5e6d4d]">{item.text}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#170807_0%,#30120d_54%,#120706_100%)] py-16 text-white">
        <div className="absolute left-10 top-10 hidden h-16 w-16 rounded-full border border-accent/18 md:block" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-accent">Why People Trust Chicken House</p>
            <h2 className="mt-4 text-3xl font-display font-bold sm:text-4xl">
              The trust is earned in small details.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {trustCards.map((card, index) => (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10, rotate: index % 2 === 0 ? -0.7 : 0.7 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true, margin: "-80px" }}
                className="rounded-lg border border-accent/25 bg-[#211913] p-6 text-center shadow-xl shadow-black/25"
              >
                <card.icon size={34} className="mx-auto text-accent" />
                <h3 className="mt-5 font-display text-xl font-bold">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/68">{card.text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-accent/25 bg-dark py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-accent">A Journey Of Taste</p>
            <h2 className="mt-4 text-3xl font-display font-bold sm:text-4xl">
              From landmark memory to modern experience.
            </h2>
          </div>

          <div className="relative mt-12 grid gap-5 md:grid-cols-4">
            <div className="absolute left-0 right-0 top-8 hidden h-px bg-accent/40 md:block" />
            {journey.map((item, index) => (
              <motion.article
                key={`${item.year}-${item.title}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                viewport={{ once: true, margin: "-80px" }}
                className="relative rounded-lg border border-accent/25 bg-[#1d1712] p-5 text-center shadow-xl shadow-black/20"
              >
                <div className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-accent bg-dark text-accent shadow-lg shadow-accent/10">
                  <Star size={26} fill="currentColor" />
                </div>
                <p className="mt-5 font-display text-xl font-bold text-accent">{item.year}</p>
                <h3 className="mt-1 font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/66">{item.text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fff7ea] py-16" id="promise">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="rounded-lg border border-[#eadcc6] bg-white p-6 shadow-xl shadow-dark/5"
          >
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-primary">Our Kitchen Promise</p>
            <h2 className="mt-4 text-3xl font-display font-bold text-dark sm:text-4xl">Food with care.</h2>
            <div className="mt-6 grid gap-3">
              {kitchenPromises.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border border-[#eadcc6] bg-[#fffaf2] px-4 py-3">
                  <CheckCircle2 size={18} className="text-primary" />
                  <span className="font-medium text-dark">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              className="overflow-hidden rounded-lg border border-[#eadcc6] bg-dark shadow-xl shadow-dark/15"
            >
              <img
                src={aboutKitchenImage}
                alt="Chicken House kitchen and dining experience"
                className="h-full min-h-[300px] w-full object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              className="relative overflow-hidden rounded-lg bg-dark p-6 text-white shadow-xl shadow-dark/20"
            >
              <img
                src="/menu-library/Fish/Tawa Taka Tuck Fish.jpg"
                alt="Chicken House winter fish"
                className="absolute inset-0 h-full w-full object-cover opacity-58"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/78 to-dark/20" />
              <div className="relative z-10 max-w-md">
                <span className="inline-flex rounded-full bg-primary px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white">
                  Winter Special
                </span>
                <h2 className="mt-6 text-3xl font-display font-bold sm:text-4xl">The fish people wait for.</h2>
                <p className="mt-4 text-sm leading-8 text-white/76">
                  When the cold breeze arrives, the craving follows. Crispy outside, tender inside, and full of flavor:
                  that is why people ask for it every winter.
                </p>
                <Link
                  to="/menu"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-primary-strong"
                >
                  Try Our Winter Fish
                  <ArrowUpRight size={18} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-[#11100e] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-accent">Victories & Certificates</p>
              <h2 className="mt-4 text-3xl font-display font-bold sm:text-4xl">
                A badge wall for the promises we can stand behind.
              </h2>
              <p className="mt-5 text-sm leading-8 text-white/68">
                These certificate-style badges are written honestly: customer love, clean preparation, landmark trust,
                winter fish, and a better digital experience. Real official certificates can be attached here when
                provided by the restaurant.
              </p>

              <div className={`mt-8 rounded-lg bg-gradient-to-br ${activeBadgeCard.tone} p-6 shadow-2xl shadow-black/30`}>
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/12 text-accent">
                    <ActiveBadgeIcon size={28} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-accent">Now Highlighting</p>
                    <motion.div
                      key={activeBadgeCard.title}
                      initial={{ opacity: 0.75, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22 }}
                    >
                      <h3 className="mt-2 text-2xl font-display font-bold">{activeBadgeCard.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-white/72">{activeBadgeCard.text}</p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {badges.map((badge, index) => (
                <motion.button
                  key={badge.title}
                  type="button"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -8, rotate: index % 2 === 0 ? -0.6 : 0.6 }}
                  transition={{ delay: index * 0.04 }}
                  viewport={{ once: true, margin: "-80px" }}
                  onClick={() => setActiveBadge(index)}
                  onMouseEnter={() => setActiveBadge(index)}
                  className={`min-h-[14rem] sm:min-h-56 rounded-lg border p-5 text-left shadow-xl shadow-black/20 transition ${
                    activeBadge === index
                      ? "border-accent bg-white text-dark"
                      : "border-white/12 bg-white/6 text-white hover:border-accent/60"
                  }`}
                >
                  <badge.icon size={30} className={activeBadge === index ? "text-primary" : "text-accent"} />
                  <h3 className="mt-5 font-display text-xl font-bold">{badge.title}</h3>
                  <p className={`mt-3 text-sm leading-7 ${activeBadge === index ? "text-muted" : "text-white/66"}`}>
                    {badge.text}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fff7ea] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-primary">Loved By The People</p>
            <h2 className="mt-4 text-3xl font-display font-bold text-dark sm:text-4xl">
              Trust sounds simple when customers say it.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {loveNotes.map((note, index) => (
              <motion.article
                key={note.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true, margin: "-80px" }}
                className="rounded-lg border border-[#eadcc6] bg-white p-6 shadow-xl shadow-dark/5"
              >
                <div className="flex items-center gap-1 text-accent">
                  {[0, 1, 2, 3, 4].map((star) => (
                    <Star key={star} size={16} fill="currentColor" />
                  ))}
                </div>
                <h3 className="mt-5 text-xl font-bold text-dark">{note.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{note.text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="restaurant-services" className="bg-[linear-gradient(180deg,#130906_0%,#0a0504_100%)] py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.38em] text-orange-400">Restaurant Services</p>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
              Core restaurant services should feel clear before a visit.
            </h2>
            <p className="mt-4 text-lg leading-8 text-white/58">
              Customers should instantly understand ordering, booking, catering, takeaway, delivery, and offers without
              guessing what Chicken House provides.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {serviceHighlights.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true, margin: "-90px" }}
                className="rounded-[2rem] border border-white/10 bg-white/5 p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600/15 text-orange-400">
                  <item.icon size={21} />
                </div>
                <h3 className="mt-5 text-2xl font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/60">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="whatsapp-concierge" className="bg-[linear-gradient(180deg,#120805_0%,#0a0504_100%)] py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.38em] text-orange-400">Service Support</p>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
              WhatsApp concierge should feel like a living support channel.
            </h2>
            <p className="mt-4 text-lg leading-8 text-white/58">
              This closes the distance between browsing and asking, with quick help for menu details, bookings, combos,
              location, and delivery answers.
            </p>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-10 rounded-[3rem] border border-white/10 bg-[linear-gradient(135deg,rgba(5,70,38,0.45),rgba(10,5,4,0.9))] p-10 md:flex-row md:p-14">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 text-green-400">
                <MessageCircle size={22} />
                <span className="text-sm font-bold uppercase tracking-[0.28em]">WhatsApp Concierge</span>
              </div>
              <h2 className="mt-5 text-4xl font-bold md:text-5xl">
                Ask for menu, booking, combos, and service details instantly.
              </h2>
              <p className="mt-5 text-lg leading-8 text-white/72">
                A direct help channel keeps customers from searching too much before taking action.
              </p>
              <a
                href={serviceConciergeUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-green-500 px-8 py-4 font-black text-dark shadow-xl shadow-green-950/35"
              >
                Chat On WhatsApp
                <ArrowUpRight size={18} />
              </a>
            </div>
            <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0f1811] p-6 shadow-2xl">
              <div className="space-y-4">
                <div className="rounded-2xl bg-white/8 px-4 py-4 text-sm leading-7 text-white/75">
                  Assalam o Alaikum, menu, booking, family seating, aur combos share kar dein.
                </div>
                <div className="ml-10 rounded-2xl bg-green-500/20 px-4 py-4 text-sm leading-7 text-white/85">
                  Welcome to Chicken House. Here is menu guidance, booking help, location, dine-in details, and combo
                  suggestions.
                </div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-white/38">
                  <Flame size={14} />
                  Chicken House Service Assistant
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fffaf1] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-90px" }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Parking & Arrival</p>
              <h2 className="mt-4 font-display text-4xl font-bold text-dark">
                Easy access and arrival convenience
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted">
                Stress-free arrival for families and travelers with ample parking and clear landmark location.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#eadcc6] bg-white p-5">
                  <CarFront size={20} className="text-primary" />
                  <p className="mt-4 text-lg font-bold text-dark">Parking Ease</p>
                  <p className="mt-2 text-sm leading-7 text-muted">Stress-free arrival for family cars and quick stopovers.</p>
                </div>
                <div className="rounded-2xl border border-[#eadcc6] bg-white p-5">
                  <MapPin size={20} className="text-primary" />
                  <p className="mt-4 text-lg font-bold text-dark">Landmark Location</p>
                  <p className="mt-2 text-sm leading-7 text-muted">Near Mitchell's landmark on GT Road for easy directions.</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-90px" }}
              className="overflow-hidden rounded-[2rem] border border-[#eadcc6] shadow-2xl shadow-dark/10"
            >
              <img
                src={cafeFront}
                alt="Chicken House parking and arrival"
                className="h-full w-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-[#fff7ea] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-90px" }}
            className="text-center"
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Our Team</p>
            <h2 className="mt-4 font-display text-4xl font-bold text-dark sm:text-5xl">
              Professional service with a smile
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-muted">
              Our uniformed team ensures friendly, professional hospitality for every guest.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              "Friendly wait-staff impression",
              "Uniformed team and polished posture",
              "Front-of-house confidence for first-time guests",
            ].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                transition={{ delay: index * 0.06 }}
                viewport={{ once: true, margin: "-90px" }}
                className="flex items-start gap-3 rounded-2xl border border-[#eadcc6] bg-white px-5 py-6 shadow-lg shadow-dark/5"
              >
                <HeartHandshake size={18} className="mt-1 shrink-0 text-primary" />
                <span className="text-sm leading-7 text-dark font-medium">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-y border-accent/20 bg-dark py-4">
        <div className="marquee-track text-sm font-bold uppercase tracking-normal text-white/68">
          {[0, 1].map((groupIndex) => (
            <div
              key={groupIndex}
              className="marquee-group"
              aria-hidden={groupIndex === 1}
            >
              {marqueeWords.map((word) => (
                <span className="marquee-item" key={`${groupIndex}-${word}`}>
                  {word}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-dark py-16 text-white">
        <img
          src="/menu-library/bbq platter/Mix Bar-B-Q Thaal.png"
          alt="Chicken House BBQ platter"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/82 to-dark/42" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-accent">Come For The Taste</p>
            <h2 className="mt-4 text-3xl font-display font-bold sm:text-5xl">Stay for the trust.</h2>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-white/74">
              Visit us with your family, explore the menu online, or get directions to the Mitchell&apos;s Main Gate side.
              Good food, warm hospitality, always.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-primary-strong"
            >
              View Menu
              <ArrowUpRight size={18} />
            </Link>
            <a
              href={siteConfig.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/8 px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:border-accent hover:text-accent"
            >
              Get Directions
              <Navigation size={18} />
            </a>
            <a
              href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/8 px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:border-accent hover:text-accent"
            >
              Call
              <Phone size={18} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
