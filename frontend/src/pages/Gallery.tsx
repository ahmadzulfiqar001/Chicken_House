import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CalendarDays,
  Camera,
  ChevronRight,
  Flame,
  Heart,
  Instagram,
  MapPin,
  PartyPopper,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { Link } from "react-router-dom";

type MenuItem = {
  id?: string | number;
  name?: string;
  category?: string;
  image?: string;
  startingPrice?: number;
  variants?: Array<{ price: number }>;
};

const socialCards = [
  { title: "Family Golden Hour", category: "Customer Moments", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80", likes: "3.4K" },
  { title: "Karahi Detail Shot", category: "Food Aesthetics", image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80", likes: "2.8K" },
  { title: "Kitchen Reel Preview", category: "Reels Preview", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80", likes: "5.1K" },
  { title: "Chef Flame Toss", category: "Trendy Kitchen", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=900&q=80", likes: "6.2K" },
  { title: "Friends Night Mood", category: "Customer Moments", image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80", likes: "3.9K" },
  { title: "Burger Story Capture", category: "Food Aesthetics", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80", likes: "2.5K" },
  { title: "Serving Rush Clip", category: "Reels Preview", image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80", likes: "4.2K" },
  { title: "Smoke and Heat", category: "Trendy Kitchen", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80", likes: "4.7K" },
];

const mediaSections = [
  {
    eyebrow: "Section 05",
    title: "Dine-In Area",
    text: "Seating mood, table styling, and the comfort that makes families and groups want to stay longer.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80",
    icon: Users,
  },
  {
    eyebrow: "Section 06",
    title: "Staff & Service",
    text: "Smiling service faces, polished uniforms, and a warmer house presence that builds trust fast.",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1400&q=80",
    icon: Sparkles,
  },
  {
    eyebrow: "Section 07",
    title: "Behind the Scenes",
    text: "Fire, prep, hygiene, fresh ingredients, and kitchen confidence shown in a more transparent way.",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=1400&q=80",
    icon: ShieldCheck,
  },
  {
    eyebrow: "Section 08",
    title: "Family Zones",
    text: "Peaceful seating corners and larger-table arrangements that feel safer and more comfortable for families.",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=80",
    icon: Users,
  },
  {
    eyebrow: "Section 09",
    title: "Arrival & Greetings",
    text: "The entry impression, guest reception, and welcome energy that shapes the entire visit.",
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1400&q=80",
    icon: PartyPopper,
  },
  {
    eyebrow: "Section 10",
    title: "Location Visuals",
    text: "Frontage, roadside feel, and easy-to-spot positioning that helps first-time visitors trust the route.",
    image: "https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=1400&q=80",
    icon: MapPin,
  },
];

const eventCards = [
  { title: "Birthday Celebrations", text: "Cake moments, decor, and glowing table scenes.", image: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=1400&q=80" },
  { title: "Corporate Meetups", text: "Clean layouts and polished hospitality for professional evenings.", image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1400&q=80" },
  { title: "Family Functions", text: "Warm hosting for larger gatherings, stage moments, and celebration nights.", image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=80" },
];

const signatureCombos = [
  { title: "BBQ Signature Table", text: "Smoke-heavy service moments with shareable plates and dramatic arrival.", image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&q=80" },
  { title: "Family Karahi Setup", text: "Desi comfort with table-sharing energy and full meal storytelling.", image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=1400&q=80" },
  { title: "Premium Pizza Corner", text: "Crisp, bright, photo-ready combos designed for younger audiences and social sharing.", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1400&q=80" },
];

const seasonalCards = [
  { title: "Winter Warmers", text: "Soup steam, hot platters, and richer comfort visuals.", image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=80" },
  { title: "Summer Coolers", text: "Fresh drinks, bright salads, and lighter service moods.", image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=1400&q=80" },
  { title: "Ramadan Iftar Energy", text: "Warm lights, date service, and fuller family tables.", image: "https://images.unsplash.com/photo-1517244683847-7456b63c5969?auto=format&fit=crop&w=1400&q=80" },
];

const filters = ["All", "Customer Moments", "Food Aesthetics", "Reels Preview", "Trendy Kitchen"];

const galleryVideo =
  "https://cdn.coverr.co/videos/coverr-chef-cooking-pasta-1561297351540?download=1080p";
const eventVideo =
  "https://cdn.coverr.co/videos/coverr-chef-plating-up-a-dish-1563896751574?download=1080p";

const sectionHeader = (eyebrow: string, title: string, text: string) => (
  <div className="max-w-3xl">
    <p className="text-xs font-bold uppercase tracking-[0.35em] text-orange-400">{eyebrow}</p>
    <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">{title}</h2>
    <p className="mt-4 text-lg leading-8 text-white/62">{text}</p>
  </div>
);

const GalleryPage = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [socialFilter, setSocialFilter] = useState("All");

  useEffect(() => {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data) => setMenuItems(Array.isArray(data) ? data : []))
      .catch(() => setMenuItems([]));
  }, []);

  const filteredCards = useMemo(
    () => socialCards.filter((card) => socialFilter === "All" || card.category === socialFilter),
    [socialFilter],
  );

  const hotMenuItems = useMemo(
    () =>
      menuItems
        .filter((item) => item.image)
        .slice(0, 8)
        .map((item, index) => ({
          id: item.id ?? index,
          name: item.name ?? "Chicken House Special",
          category: item.category ?? "House Favorite",
          image: item.image ?? "",
          price: Number(item.startingPrice ?? item.variants?.[0]?.price ?? 0),
        })),
    [menuItems],
  );

  return (
    <div className="min-h-screen overflow-hidden bg-[#0f0705] text-white">
      <section className="relative flex min-h-[92vh] items-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <motion.div
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.42 }}
            transition={{ duration: 1.6 }}
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,7,5,0.45),rgba(15,7,5,0.88),rgba(15,7,5,1))]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-[0.3em]">Chicken House Gallery</span>
          </div>
          <h1 className="mt-8 font-display text-6xl font-black leading-[0.9] md:text-8xl">
            VISUALS THAT FEEL
            <span className="block bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
              FULL OF LIFE.
            </span>
          </h1>
          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-white/62">
            This gallery now moves beyond a simple image page. It tells the full Chicken House story through dine-in ambiance, food visuals, kitchen motion, events, family comfort, location, and premium restaurant atmosphere.
          </p>
        </div>
      </section>

      <section className="border-y border-white/6 py-5">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="flex min-w-max gap-12 whitespace-nowrap text-xs font-bold uppercase tracking-[0.45em] text-white/25"
        >
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index}>Live Kitchen • Food Aesthetics • Family Moments • Event Nights • Signature Dishes</span>
          ))}
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        {sectionHeader("Section 01", "Instagram Grid Style", "A modern social-style grid keeps the brand active and gives the gallery a more current, trendy visual rhythm.")}
        <div className="mt-12 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSocialFilter(filter)}
              className={`relative rounded-full px-6 py-3 text-sm font-bold transition ${
                socialFilter === filter ? "text-white" : "text-white/50 hover:text-white"
              }`}
            >
              {socialFilter === filter && (
                <motion.div layoutId="gallery-filter" className="absolute inset-0 -z-10 rounded-full bg-orange-600" />
              )}
              {filter}
            </button>
          ))}
        </div>
        <motion.div layout className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filteredCards.map((card) => (
              <motion.div
                key={card.title}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                whileHover={{ y: -10 }}
                className="group relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 bg-white/5"
              >
                <img src={card.image} alt={card.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-85" />
                <div className="absolute bottom-0 p-6">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-white/65">
                    <Instagram size={13} className="text-orange-400" />
                    {card.category}
                  </div>
                  <h3 className="text-xl font-bold">{card.title}</h3>
                  <div className="mt-2 flex items-center gap-2 text-xs font-bold">
                    <Heart size={12} className="fill-red-500 text-red-500" />
                    {card.likes}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      <section className="bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-white/5">
            <video autoPlay muted loop playsInline controls className="h-[32rem] w-full object-cover">
              <source src={galleryVideo} type="video/mp4" />
            </video>
            <div className="absolute left-6 top-6 rounded-full bg-black/35 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-white/75 backdrop-blur-md">
              Video Gallery
            </div>
          </div>
          <div>
            {sectionHeader("Section 02", "Video Gallery", "Video blocks make the gallery feel immersive. They show motion, sound imagination, and the rhythm of a busy house much better than photos alone.")}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        {sectionHeader("Section 03", "Hot Selling Food Gallery", "Backend-fed food images keep the page alive and make the menu feel visually available, not hidden behind a text list.")}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {hotMenuItems.map((item) => (
            <div key={String(item.id)} className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
              <img src={item.image} alt={item.name} className="h-64 w-full object-cover" referrerPolicy="no-referrer" />
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-300">{item.category}</p>
                <h3 className="mt-2 text-xl font-bold">{item.name}</h3>
                <div className="mt-3 flex items-center gap-2 text-sm text-white/70">
                  <Flame size={14} className="text-orange-400" />
                  Rs. {item.price.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#130906_0%,#0f0705_100%)] py-24">
        <div className="mx-auto max-w-7xl px-6">
          {sectionHeader("Section 04", "Event Highlights", "Functions, celebrations, and hosting ability should appear directly inside the gallery so the restaurant feels capable and memorable.")}
          <div className="mt-12 grid gap-7 lg:grid-cols-3">
            {eventCards.map((card) => (
              <div key={card.title} className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/5">
                <img src={card.image} alt={card.title} className="h-72 w-full object-cover" referrerPolicy="no-referrer" />
                <div className="p-6">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-600/15 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-orange-300">
                    <CalendarDays size={12} />
                    Hosted Event
                  </div>
                  <h3 className="text-2xl font-bold">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/62">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        {sectionHeader("Section 11", "Signature Combos & Platter Visuals", "The gallery should also show how meals come together on tables, not just as isolated dishes.")}
        <div className="mt-12 grid gap-7 lg:grid-cols-3">
          {signatureCombos.map((card) => (
            <div key={card.title} className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/5">
              <img src={card.image} alt={card.title} className="h-72 w-full object-cover" referrerPolicy="no-referrer" />
              <div className="p-6">
                <h3 className="text-2xl font-bold">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">{card.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#120805_0%,#0f0705_100%)] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            {mediaSections.map((section) => (
              <div key={section.title} className="group overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/5">
                <div className="grid md:grid-cols-[1fr_0.95fr]">
                  <div className="p-8">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600/15 text-orange-300">
                      <section.icon size={18} />
                    </div>
                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.28em] text-orange-300">{section.eyebrow}</p>
                    <h3 className="mt-4 text-3xl font-bold">{section.title}</h3>
                    <p className="mt-4 text-sm leading-8 text-white/64">{section.text}</p>
                  </div>
                  <div className="overflow-hidden">
                    <img src={section.image} alt={section.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 lg:grid-cols-[1.02fr_0.98fr]">
        <div>
          {sectionHeader("Section 12", "Kids Play Area", "If the restaurant supports family stays, a child-friendly angle adds a practical reason for parents to choose it with confidence.")}
        </div>
        <div className="overflow-hidden rounded-[3rem] border border-white/10 bg-white/5">
          <img src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1400&q=80" alt="Kids play area" className="h-[30rem] w-full object-cover" referrerPolicy="no-referrer" />
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#130906_0%,#0f0705_100%)] py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[0.98fr_1.02fr]">
          <div className="overflow-hidden rounded-[3rem] border border-white/10 bg-white/5">
            <video autoPlay muted loop playsInline controls className="h-[30rem] w-full object-cover">
              <source src={eventVideo} type="video/mp4" />
            </video>
          </div>
          <div>
            {sectionHeader("Section 13", "Functions in Motion", "A second video block keeps the page moving and makes the gallery feel cinematic rather than static.")}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        {sectionHeader("Section 14", "Seasonal Showcase", "Gallery sections can also tell seasonal mood stories through warmer or cooler menu moments.")}
        <div className="mt-12 grid gap-7 lg:grid-cols-3">
          {seasonalCards.map((card) => (
            <div key={card.title} className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/5">
              <img src={card.image} alt={card.title} className="h-72 w-full object-cover" referrerPolicy="no-referrer" />
              <div className="p-6">
                <h3 className="text-2xl font-bold">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">{card.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#120805_0%,#0f0705_100%)] py-24">
        <div className="mx-auto max-w-7xl px-6">
          {sectionHeader("Section 15", "Guest Reels Ribbon", "A lighter visual strip gives the page a more social, active, and happening rhythm between bigger sections.")}
          <div className="mt-12 grid gap-5 md:grid-cols-3 xl:grid-cols-6">
            {socialCards.slice(0, 6).map((card) => (
              <div key={card.title} className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/5">
                <img src={card.image} alt={card.title} className="h-52 w-full object-cover" referrerPolicy="no-referrer" />
                <div className="p-4">
                  <p className="text-sm font-bold">{card.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 lg:grid-cols-[1fr_1fr]">
        <div>
          {sectionHeader("Section 16", "Function Spotlight Wall", "A final hosting section can reinforce that Chicken House is not only for daily meals but also for memorable occasions.")}
        </div>
        <div className="overflow-hidden rounded-[3rem] border border-white/10 bg-white/5">
          <img src="https://images.unsplash.com/photo-1511795409834-432f7b1728d2?auto=format&fit=crop&w=1400&q=80" alt="Function spotlight" className="h-[30rem] w-full object-cover" referrerPolicy="no-referrer" />
        </div>
      </section>

      <section className="pb-32 pt-8 text-center">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-orange-400">Section 17</p>
          <h2 className="mt-4 text-5xl font-black md:text-7xl">
            MAKE THE GALLERY FEEL
            <span className="block text-orange-500">LIKE A REAL PLACE.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/60">
            A strong gallery should not feel like random photos. It should show atmosphere, food, service, family comfort, events, motion, and the reasons a customer wants to visit in person.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/menu" className="inline-flex items-center gap-2 rounded-full bg-white px-10 py-5 text-lg font-black text-black transition hover:bg-orange-600 hover:text-white">
              Explore Menu
              <UtensilsCrossed size={18} />
            </Link>
            <Link to="/booking" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-10 py-5 text-lg font-black text-white transition hover:border-orange-500/40 hover:bg-white/10">
              Book A Table
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GalleryPage;
