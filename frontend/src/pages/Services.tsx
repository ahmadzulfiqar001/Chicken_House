import { motion, useScroll, useTransform } from "motion/react";
import {
  ArrowRight,
  CalendarDays,
  CarFront,
  CheckCircle2,
  ChefHat,
  Clock3,
  Coffee,
  Flame,
  Gift,
  HeartHandshake,
  Home,
  Instagram,
  MapPin,
  MessageCircle,
  PartyPopper,
  Phone,
  Play,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  TicketPercent,
  Truck,
  Users,
  UtensilsCrossed,
  Wifi,
} from "lucide-react";
import { Link } from "react-router-dom";

const heroVideoUrl =
  "https://cdn.coverr.co/videos/coverr-chef-plating-up-a-dish-1563896751574?download=1080p";
const kitchenVideoUrl =
  "https://cdn.coverr.co/videos/coverr-chef-cooking-pasta-1561297351540?download=1080p";
const whatsappUrl =
  "https://wa.me/923457493339?text=Assalam%20o%20Alaikum%20Chicken%20House!%20Please%20share%20menu%2C%20booking%2C%20delivery%2C%20combos%2C%20and%20service%20details.";

const stats = [
  { label: "Service Modules", value: "20+", icon: Sparkles },
  { label: "Booking Modes", value: "Indoor / Outdoor", icon: CalendarDays },
  { label: "Daily Support", value: "Active", icon: ShieldCheck },
  { label: "Brand Energy", value: "Premium", icon: Star },
];

const coreServices = [
  { title: "Online Food Ordering", text: "Direct browsing, food discovery, and order intent in one smooth flow.", icon: ShoppingBag },
  { title: "Table Reservation", text: "Pre-booked tables for family dinners, occasions, and planned visits.", icon: CalendarDays },
  { title: "Event Catering", text: "Functions, birthdays, and corporate meals with a more organized service feel.", icon: PartyPopper },
  { title: "Home Delivery", text: "Travel-ready food handling and responsive delivery support.", icon: Truck },
  { title: "Special Deals", text: "Weekly offers, lunch deals, and value combos to push conversions.", icon: TicketPercent },
];

const combos = [
  ["Family Feast Combo", "Karahi, BBQ, bread, drinks, and chutneys for larger tables.", "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=1200&q=80"],
  ["Live BBQ Combo", "A smoky dine-in setup with grill energy and premium table appeal.", "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80"],
  ["Takeaway Saver Box", "Fast pickup meals built for office and road customers.", "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80"],
  ["Couple Dinner Combo", "A polished two-person setup with starter, main, and drinks.", "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80"],
];

const reviews = [
  "The service page finally shows food, seating, and events like a proper restaurant brand.",
  "Dine-in, takeaway, and family comfort all feel visible before the visit now.",
  "Live kitchen, combos, and booking blocks make the restaurant look active and professional.",
];

const deals = [
  "Lunch Rush Deal for working customers who want speed and value.",
  "Weekend Family Offer for larger tables and shared meals.",
  "Late Night Special for rich, hot meals after dark.",
];

const cards = (items: string[], Icon: typeof CheckCircle2) =>
  items.map((item) => (
    <div key={item} className="flex items-start gap-3 rounded-[1.6rem] border border-white/10 bg-white/5 px-5 py-4">
      <Icon size={18} className="mt-1 shrink-0 text-orange-400" />
      <span className="text-sm leading-7 text-white/70">{item}</span>
    </div>
  ));

const titleBlock = (eyebrow: string, title: string, text: string) => (
  <div className="max-w-3xl">
    <p className="text-xs font-bold uppercase tracking-[0.38em] text-orange-400">{eyebrow}</p>
    <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">{title}</h2>
    <p className="mt-4 text-lg leading-8 text-white/58">{text}</p>
  </div>
);

const imageCard = (title: string, text: string, src: string) => (
  <div className="overflow-hidden rounded-[2.3rem] border border-white/10 bg-white/5">
    <img src={src} alt={title} className="h-72 w-full object-cover" referrerPolicy="no-referrer" />
    <div className="p-6">
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/62">{text}</p>
    </div>
  </div>
);

const ServicesPage = () => {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <div className="overflow-hidden bg-[#0a0504] text-white">
      <section className="relative flex min-h-screen items-center overflow-hidden pt-24">
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
          <video autoPlay muted loop playsInline className="h-full w-full object-cover opacity-35" poster="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1800&q=80">
            <source src={heroVideoUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,5,4,0.96),rgba(10,5,4,0.72),rgba(10,5,4,0.55))]" />
        </motion.div>
        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">
              <Sparkles size={15} className="text-orange-400" />
              <span className="text-xs font-bold uppercase tracking-[0.34em] text-orange-300">Full Service Experience</span>
            </div>
            <h1 className="mt-8 max-w-4xl font-display text-6xl leading-[0.95] font-black tracking-tight md:text-8xl">
              SERVICES THAT FEEL
              <span className="block text-orange-500">ALIVE, RICH, AND READY.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/68">
              Chicken House should feel like a complete restaurant ecosystem. This page now stretches into a long service story with live kitchen, dine-in, takeaway, delivery, combos, bookings, events, and family comfort.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/booking" className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-8 py-4 font-bold shadow-xl shadow-orange-950/40">Book A Table <ArrowRight size={18} /></Link>
              <Link to="/menu" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-4 font-bold backdrop-blur-xl">Explore Menu <UtensilsCrossed size={18} /></Link>
            </div>
          </div>
          <div className="hidden rounded-[2.8rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl lg:block">
            <div className="overflow-hidden rounded-[2.2rem]">
              <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80" alt="Chicken House preview" className="h-[35rem] w-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-[1.6rem] bg-[#140a07] p-5"><p className="text-xs font-bold uppercase tracking-[0.28em] text-orange-400">Dine-In</p><p className="mt-2 text-sm leading-7 text-white/70">Lighting, seating, and family comfort in one polished experience.</p></div>
              <div className="rounded-[1.6rem] bg-[#140a07] p-5"><p className="text-xs font-bold uppercase tracking-[0.28em] text-orange-400">Delivery</p><p className="mt-2 text-sm leading-7 text-white/70">Hot-food handling and responsive support across digital touchpoints.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/6 bg-[linear-gradient(180deg,#100705_0%,#0a0504_100%)] py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600/15 text-orange-400"><stat.icon size={20} /></div>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.3em] text-white/45">{stat.label}</p>
                <p className="mt-2 text-2xl font-display font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-y border-white/6 py-5">
        <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 26, repeat: Infinity, ease: "linear" }} className="flex min-w-max gap-12 whitespace-nowrap text-xs font-bold uppercase tracking-[0.48em] text-white/25">
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index}>Live Cooking • Fast Takeaway • Delivery Support • Family Seating • Event Hosting</span>
          ))}
        </motion.div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          {titleBlock("Section 01", "Core restaurant services should feel clear from the first scroll", "Customers should instantly understand ordering, booking, catering, takeaway, delivery, and offers without guessing what the restaurant actually provides.")}
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {coreServices.map((item) => (
              <div key={item.title} className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600/15 text-orange-400"><item.icon size={21} /></div>
                <h3 className="mt-5 text-2xl font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/60">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#130906_0%,#0a0504_100%)] py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5">
            <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80" alt="Online ordering" className="h-[34rem] w-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.38em] text-orange-400">Section 02</p>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">Online ordering should feel smooth and desirable</h2>
            <p className="mt-4 text-lg leading-8 text-white/58">The page should make digital ordering look polished with menu confidence, food visuals, and fast support options.</p>
            <div className="mt-8 space-y-4">{cards(["Direct category-wise menu browsing", "Visual food flow that supports faster orders", "WhatsApp and cart journey from the same screen"], CheckCircle2)}</div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.38em] text-orange-400">Section 03</p>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">Dine-in should feel premium, warm, and worth visiting</h2>
            <p className="mt-4 text-lg leading-8 text-white/58">Show ambiance, lighting, seating, and emotional comfort before the guest even arrives.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {["Indoor seating mood", "Comfortable family tables", "Warm lighting and premium presentation", "Strong first impression for new visitors"].map((item) => (
                <div key={item} className="rounded-[1.6rem] border border-white/10 bg-white/5 px-5 py-5 text-sm font-medium text-white/75">{item}</div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5">
            <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1400&q=80" alt="Dine-in restaurant service" className="h-[34rem] w-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#120805_0%,#0a0504_100%)] py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[0.96fr_1.04fr]">
          <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5">
            <img src="https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=1400&q=80" alt="Takeaway counter" className="h-[34rem] w-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.38em] text-orange-400">Section 04</p>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">Takeaway should look fast, clean, and professionally packed</h2>
            <p className="mt-4 text-lg leading-8 text-white/58">Pickup should feel like a first-class option, not an afterthought.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.6rem] bg-[#170c08] p-5"><ShoppingBag size={18} className="text-orange-400" /><p className="mt-4 text-lg font-bold">Express Counter</p><p className="mt-2 text-sm leading-7 text-white/65">Fast handoff and ready packaging for road customers.</p></div>
              <div className="rounded-[1.6rem] bg-[#170c08] p-5"><Gift size={18} className="text-orange-400" /><p className="mt-4 text-lg font-bold">Sealed Presentation</p><p className="mt-2 text-sm leading-7 text-white/65">Premium packing visuals that protect heat and appearance.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="overflow-hidden rounded-[2.4rem] border border-white/10 bg-white/5 lg:col-span-2">
              <img src="https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=1600&q=80" alt="Delivery service" className="h-[26rem] w-full object-cover" referrerPolicy="no-referrer" />
              <div className="p-8">
                <p className="text-xs font-bold uppercase tracking-[0.38em] text-orange-400">Section 05</p>
                <h2 className="mt-4 font-display text-4xl font-bold">Delivery support should feel active and reliable</h2>
                <p className="mt-4 text-lg leading-8 text-white/58">The page should clearly say that orders travel hot and support stays reachable.</p>
              </div>
            </div>
            <div className="rounded-[2.4rem] border border-white/10 bg-white/5 p-8">
              <Truck size={22} className="text-orange-400" />
              <h3 className="mt-5 text-2xl font-bold">Delivery Highlights</h3>
              <div className="mt-6 space-y-4">
                {["Order confirmation visibility", "Travel-friendly meal recommendations", "WhatsApp support for quick questions", "Hot-food confidence on dispatch"].map((item) => (
                  <div key={item} className="rounded-[1.4rem] border border-white/8 bg-[#160c08] px-4 py-4 text-sm leading-7 text-white/66">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#120806_0%,#0a0504_100%)] py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.38em] text-orange-400">Section 06</p>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">Parking and arrival convenience should not stay invisible</h2>
            <p className="mt-4 text-lg leading-8 text-white/58">Families and travelers often judge the visit before entering, so arrival ease and landmark confidence deserve a visible block.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5"><CarFront size={20} className="text-orange-400" /><p className="mt-4 text-lg font-bold">Parking Ease</p><p className="mt-2 text-sm leading-7 text-white/64">Stress-free arrival for family cars and quick stopovers.</p></div>
              <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5"><MapPin size={20} className="text-orange-400" /><p className="mt-4 text-lg font-bold">Landmark Confidence</p><p className="mt-2 text-sm leading-7 text-white/64">A clearer route story for first-time visitors.</p></div>
            </div>
          </div>
          <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5">
            <img src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1400&q=80" alt="Parking and arrival" className="h-[34rem] w-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="rounded-[2.6rem] border border-white/10 bg-white/5 p-5">
            <div className="overflow-hidden rounded-[2rem]">
              <video autoPlay muted loop playsInline controls className="h-[32rem] w-full object-cover" poster="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1400&q=80">
                <source src={kitchenVideoUrl} type="video/mp4" />
              </video>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.38em] text-orange-400">Section 07</p>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">Live kitchen visuals should show heat, motion, and trust</h2>
            <p className="mt-4 text-lg leading-8 text-white/58">A real cooking block gives energy to the page and shows that fresh prep and chef action are part of the brand experience.</p>
            <div className="mt-8 space-y-4">{cards(["Open fire and chef-motion storytelling", "Fresh preparation shown through video", "A stronger feeling of authenticity and movement"], Play)}</div>
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#120805_0%,#0a0504_100%)] py-24">
        <div className="mx-auto max-w-7xl px-6">
          {titleBlock("Section 08", "Hygiene and quality should feel visible, not assumed", "A restaurant service page becomes stronger when cleanliness, standards, and kitchen confidence are shown through clear visual messaging.")}
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {["Uniformed and visible kitchen team", "Halal ingredients and kitchen discipline", "Family comfort and safety messaging", "Fast communication through digital support"].map((item) => (
              <div key={item} className="rounded-[2rem] border border-white/10 bg-white/5 p-6"><ShieldCheck size={20} className="text-orange-400" /><p className="mt-5 text-sm leading-7 text-white/72">{item}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          {titleBlock("Section 09", "Combos should help customers imagine complete meals, not single items only", "Strong combo sections make ordering easier, richer, and more restaurant-smart.")}
          <div className="mt-12 grid gap-7 md:grid-cols-2">
            {combos.map(([title, text, src]) => (
              <div key={title} className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/5">
                <img src={src} alt={title} className="h-72 w-full object-cover" referrerPolicy="no-referrer" />
                <div className="p-6"><h3 className="text-2xl font-bold">{title}</h3><p className="mt-3 text-sm leading-7 text-white/62">{text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#130906_0%,#0a0504_100%)] py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[0.94fr_1.06fr]">
          <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5">
            <img src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=80" alt="Family seating" className="h-[34rem] w-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.38em] text-orange-400">Section 10</p>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">Family areas and privacy corners should feel intentional</h2>
            <p className="mt-4 text-lg leading-8 text-white/58">Family customers care about comfort, calmness, and safe seating as much as the menu itself.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5"><Home size={18} className="text-orange-400" /><p className="mt-4 text-lg font-bold">Private Feel</p><p className="mt-2 text-sm leading-7 text-white/64">A quieter zone for relaxed family visits.</p></div>
              <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5"><Users size={18} className="text-orange-400" /><p className="mt-4 text-lg font-bold">Group Seating</p><p className="mt-2 text-sm leading-7 text-white/64">Flexible layouts for mixed-age dining and larger tables.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          {titleBlock("Section 11", "Smart booking should feel structured and helpful", "Booking flows should explain the options clearly and help visitors decide quickly instead of leaving them unsure about the process.")}
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[2.2rem] border border-white/10 bg-white/5 p-7"><p className="text-xs font-bold uppercase tracking-[0.28em] text-orange-300">Indoor Booking</p><h3 className="mt-3 text-3xl font-bold">Climate-friendly seating for calm dining</h3><p className="mt-4 text-sm leading-8 text-white/62">For guests who want comfort, stability, and cleaner event styling.</p></div>
            <div className="rounded-[2.2rem] border border-white/10 bg-white/5 p-7"><p className="text-xs font-bold uppercase tracking-[0.28em] text-orange-300">Outdoor Booking</p><h3 className="mt-3 text-3xl font-bold">Open-air energy with a social atmosphere</h3><p className="mt-4 text-sm leading-8 text-white/62">Best for evening gatherings and guests who want a more open experience.</p></div>
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#120805_0%,#0a0504_100%)] py-24">
        <div className="mx-auto max-w-7xl px-6">
          {titleBlock("Section 12", "Events and catering should prove the restaurant can host more than everyday dining", "A strong event strip makes the restaurant feel more capable, more valuable, and more memorable for functions.")}
          <div className="mt-12 grid gap-7 lg:grid-cols-3">
            {imageCard("Birthday Hosting", "Decor, cake moments, and family tables coordinated under one event block.", "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80")}
            {imageCard("Corporate Dinners", "Clean table styling and organized meal flow for professional gatherings.", "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80")}
            {imageCard("Family Functions", "Stage-ready service and warm hosting for larger gatherings.", "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80")}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.04fr_0.96fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.38em] text-orange-400">Section 13</p>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">Traveler specials should turn the restaurant into a comfort stop</h2>
            <p className="mt-4 text-lg leading-8 text-white/58">Travelers value parking, refreshment, short rest time, tea, and easy service choices. This section should show all of that.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {["Tea, coffee, and refreshment pause", "Parking and quick access convenience", "Practical stopover comfort", "Fast takeaway for short stays"].map((item) => (
                <div key={item} className="rounded-[1.6rem] border border-white/10 bg-white/5 px-5 py-5 text-sm leading-7 text-white/70">{item}</div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5">
            <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=80" alt="Traveler refreshments" className="h-[34rem] w-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#130906_0%,#0a0504_100%)] py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[0.96fr_1.04fr]">
          <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5">
            <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1400&q=80" alt="Staff and service" className="h-[34rem] w-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.38em] text-orange-400">Section 14</p>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">Staff presentation should support the brand</h2>
            <p className="mt-4 text-lg leading-8 text-white/58">Uniforms, smiles, speed, and visible hospitality make service feel professional and trustworthy.</p>
            <div className="mt-8 space-y-4">{cards(["Friendly wait-staff impression", "Uniformed team and polished posture", "Front-of-house confidence for first-time guests"], HeartHandshake)}</div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.03fr_0.97fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.38em] text-orange-400">Section 15</p>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">Chef recommendations should guide customers toward signature choices</h2>
            <p className="mt-4 text-lg leading-8 text-white/58">A chef-led section helps visitors feel guided and gives the restaurant a stronger curated voice.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {["Chicken Karahi", "BBQ Chicken Pizza", "Mixed BBQ Platter"].map((item) => (
                <div key={item} className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 text-center"><ChefHat size={18} className="mx-auto text-orange-400" /><p className="mt-4 text-lg font-bold">{item}</p></div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5">
            <img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=80" alt="Chef recommendation" className="h-[34rem] w-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#120805_0%,#0a0504_100%)] py-24">
        <div className="mx-auto max-w-7xl px-6">
          {titleBlock("Section 16", "Deals and offers should add momentum across the service page", "These blocks make the page feel active, updated, and commercially alive instead of frozen or generic.")}
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {deals.map((deal) => (
              <div key={deal} className="rounded-[2rem] border border-orange-500/20 bg-[linear-gradient(180deg,rgba(216,168,47,0.08),rgba(127,18,21,0.12))] p-7">
                <Gift size={20} className="text-orange-400" />
                <p className="mt-5 text-lg font-bold">{deal.split(" for ")[0]}</p>
                <p className="mt-3 text-sm leading-7 text-white/66">{deal}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[0.97fr_1.03fr]">
          <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5">
            <img src="https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1400&q=80" alt="Customer reviews and social proof" className="h-[34rem] w-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.38em] text-orange-400">Section 17</p>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">Reviews and social proof should keep reinforcing confidence</h2>
            <div className="mt-8 space-y-4">
              {reviews.map((review) => (
                <div key={review} className="rounded-[1.8rem] border border-white/10 bg-white/5 p-6"><p className="text-base leading-8 text-white/74">"{review}"</p></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#130906_0%,#0a0504_100%)] py-24">
        <div className="mx-auto max-w-7xl px-6">
          {titleBlock("Section 18", "Location, timings, and contact must remain easy to trust at the end of the page", "The footer-area information should feel strong enough to convert a hesitant visitor into a real visit or inquiry.")}
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7"><MapPin size={20} className="text-orange-400" /><h3 className="mt-5 text-2xl font-bold">Visit The Restaurant</h3><p className="mt-3 text-sm leading-7 text-white/66">Near Mitchell's Fair Price Shop, GT Road, Renala Khurd, with practical access and visible curb appeal.</p></div>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7"><Clock3 size={20} className="text-orange-400" /><h3 className="mt-5 text-2xl font-bold">Opening Hours</h3><p className="mt-3 text-sm leading-7 text-white/66">Open daily for dine-in, takeaway, booking support, and digital ordering confidence.</p></div>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7"><Phone size={20} className="text-orange-400" /><h3 className="mt-5 text-2xl font-bold">Call, Chat, Follow</h3><p className="mt-3 text-sm leading-7 text-white/66">Use WhatsApp, direct calls, and Instagram presence to keep the restaurant responsive and active.</p></div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.06fr_0.94fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.38em] text-orange-400">Section 19</p>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">Digital convenience should show modern restaurant readiness</h2>
            <p className="mt-4 text-lg leading-8 text-white/58">Free Wi-Fi, contact support, digital browsing, and social channels create a smoother service identity for younger and repeat customers.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[{ icon: Wifi, text: "Connected in-house experience" }, { icon: MessageCircle, text: "Fast customer question handling" }, { icon: Instagram, text: "Active visual social presence" }, { icon: Coffee, text: "Longer-stay comfort moments" }].map((item) => (
                <div key={item.text} className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5"><item.icon size={18} className="text-orange-400" /><p className="mt-4 text-sm leading-7 text-white/70">{item.text}</p></div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5">
            <img src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1400&q=80" alt="Modern restaurant convenience" className="h-[34rem] w-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#120805_0%,#0a0504_100%)] py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[0.94fr_1.06fr]">
          <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5">
            <img src="https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?auto=format&fit=crop&w=1400&q=80" alt="Restaurant atmosphere" className="h-[34rem] w-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.38em] text-orange-400">Section 20</p>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">Atmosphere is also a service, not just a background</h2>
            <p className="mt-4 text-lg leading-8 text-white/58">Music, lighting, flow, and the social feel of the room shape how people remember the restaurant.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {["Live energy", "Family comfort", "Photo-friendly setting", "Night ambiance"].map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-white/74">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          {titleBlock("Section 21", "WhatsApp concierge should feel like a living support channel", "This section closes the distance between browsing and asking. It gives the customer an easy way to request the menu, booking help, combos, location, and delivery answers.")}
          <div className="mt-12 flex flex-col items-center justify-between gap-10 rounded-[3rem] border border-white/10 bg-[linear-gradient(135deg,rgba(5,70,38,0.45),rgba(10,5,4,0.9))] p-10 md:flex-row md:p-14">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 text-green-400"><MessageCircle size={22} /><span className="text-sm font-bold uppercase tracking-[0.28em]">WhatsApp Concierge</span></div>
              <h2 className="mt-5 text-4xl font-bold md:text-5xl">Ask for menu, booking, combos, and service details instantly</h2>
              <p className="mt-5 text-lg leading-8 text-white/72">This should feel like live help for customers who do not want to search too much before taking action.</p>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-3 rounded-full bg-green-500 px-8 py-4 font-black text-dark shadow-xl shadow-green-950/35">Chat On WhatsApp <ArrowRight size={18} /></a>
            </div>
            <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0f1811] p-6 shadow-2xl">
              <div className="space-y-4">
                <div className="rounded-2xl bg-white/8 px-4 py-4 text-sm leading-7 text-white/75">Assalam o Alaikum, menu, booking, family seating, aur combos share kar dein.</div>
                <div className="ml-10 rounded-2xl bg-green-500/20 px-4 py-4 text-sm leading-7 text-white/85">Welcome to Chicken House. Here is menu guidance, booking help, location, dine-in details, and combo suggestions.</div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-white/38"><Flame size={14} /> Chicken House Service Assistant</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-32 pt-10 text-center">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-xs font-bold uppercase tracking-[0.38em] text-orange-400">Final Section</p>
          <h2 className="mt-4 text-5xl font-black md:text-7xl">MAKE THE VISIT FEEL <span className="text-orange-500">INEVITABLE.</span></h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/60">A strong services page should not feel short or empty. It should show the brand, the food, the hospitality, the movement, and the reasons to visit, book, order, and come back again.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/menu" className="inline-flex items-center gap-2 rounded-full bg-white px-10 py-5 text-lg font-black text-black transition hover:bg-orange-600 hover:text-white">Explore Menu <UtensilsCrossed size={18} /></Link>
            <Link to="/booking" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-10 py-5 text-lg font-black text-white transition hover:border-orange-500/40 hover:bg-white/10">Reserve Now <CalendarDays size={18} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
