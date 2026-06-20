import { motion } from "motion/react";
import {
  CalendarDays,
  Camera,
  ChefHat,
  ChevronRight,
  Flame,
  Heart,
  Home,
  Sparkles,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { Link } from "react-router-dom";

const cafeEntrance = new URL("../../assets/source-images/Cafe Images/enterance.png", import.meta.url).href;
const cafeEntranceSitting = new URL("../../assets/source-images/Cafe Images/enterance_sitting.png", import.meta.url).href;
const cafeFront = new URL("../../assets/source-images/Cafe Images/front.png", import.meta.url).href;
const cafeIndoorSitting = new URL("../../assets/source-images/Cafe Images/indor sitting.png", import.meta.url).href;
const cafeBbqSection = new URL("../../assets/source-images/Cafe Images/bbq section.png", import.meta.url).href;
const cafeCookingArea = new URL("../../assets/source-images/Cafe Images/cooking area.png", import.meta.url).href;
const cafeBirthdaySequence = new URL("../../assets/source-images/Cafe Images/birthday sequence.png", import.meta.url).href;
const cafeChickBranding = new URL("../../assets/source-images/Cafe Images/chick branding.png", import.meta.url).href;
const cafeClassFarewell = new URL("../../assets/source-images/Cafe Images/class 10 farewull.png", import.meta.url).href;
const cafeCrockery = new URL("../../assets/source-images/Cafe Images/crockery.png", import.meta.url).href;
const cafeCrockerySetting = new URL("../../assets/source-images/Cafe Images/crockery setting.png", import.meta.url).href;
const cafeChefOne = new URL("../../assets/source-images/Cafe Images/chef 1.png", import.meta.url).href;
const cafeChefTwo = new URL("../../assets/source-images/Cafe Images/chef 2.png", import.meta.url).href;
const cafeChefThree = new URL("../../assets/source-images/Cafe Images/chef 3.png", import.meta.url).href;
const cafeDeliveryBikes = new URL("../../assets/source-images/Cafe Images/delevery bikes.png", import.meta.url).href;
const cafeEatingInCafe = new URL("../../assets/source-images/Cafe Images/eating in cafe.png", import.meta.url).href;
const cafeGalleryVideo = new URL("../../assets/source-images/Cafe Images/gallery_page.mp4", import.meta.url).href;
const cafeGetTogether = new URL("../../assets/source-images/Cafe Images/get to gether.png", import.meta.url).href;
const cafeKidsEnjoying = new URL("../../assets/source-images/Cafe Images/kids enjoying at play area.png", import.meta.url).href;
const cafeLiveKitchenVideo = new URL("../../assets/source-images/Cafe Images/live kitchen.mp4", import.meta.url).href;
const cafeParking = new URL("../../assets/source-images/Cafe Images/parking.png", import.meta.url).href;
const cafePlayFestival = new URL("../../assets/source-images/Cafe Images/play area with festival.png", import.meta.url).href;
const cafePlayZoom = new URL("../../assets/source-images/Cafe Images/play area zoom.png", import.meta.url).href;
const cafeSaladBar2 = new URL("../../assets/source-images/Cafe Images/salad bar 2.png", import.meta.url).href;
const cafeSaladBarPeople = new URL("../../assets/source-images/Cafe Images/salad bar people.png", import.meta.url).href;
const cafeSaladBar = new URL("../../assets/source-images/Cafe Images/salad bar.png", import.meta.url).href;
const cafeSideposeFront = new URL("../../assets/source-images/Cafe Images/sidepose front.png", import.meta.url).href;
const cafeSittingLawn = new URL("../../assets/source-images/Cafe Images/sitting lawn.png", import.meta.url).href;
const cafeSittingPlayArea = new URL("../../assets/source-images/Cafe Images/sitting with play area.png", import.meta.url).href;
const cafeWorkingKitchen = new URL("../../assets/source-images/Cafe Images/working in kitchen.png", import.meta.url).href;
const pinterestBroast = new URL("../../assets/source-images/Arabic Broast/full arabic broast.png", import.meta.url).href;
const pinterestChickenTikka = new URL("../../assets/source-images/BBQ/Chicken Tikka.jpg", import.meta.url).href;
const pinterestBarBQPlatter = new URL("../../assets/source-images/bbq platter/Bar-B-Q Platter.jpg", import.meta.url).href;
const pinterestBlackPepper = new URL("../../assets/source-images/bbq platter/Black Pepper.jpg", import.meta.url).href;
const pinterestBurger = new URL("../../assets/source-images/Burger/Chicken Grilled Burger.png", import.meta.url).href;
const pinterestKarahi = new URL("../../assets/source-images/Continental/Chicken Makhni Karahi.jpg", import.meta.url).href;
const pinterestBrownie = new URL("../../assets/source-images/Deserts/Chocolate Brownie with Ice Cream.jpg", import.meta.url).href;
const pinterestBonelessFish = new URL("../../assets/source-images/Fish/Boneless Fish.jpg", import.meta.url).href;
const pinterestFish = new URL("../../assets/source-images/Fish/Grill Fish.jpg", import.meta.url).href;
const pinterestTawaFish = new URL("../../assets/source-images/Fish/Tawa Taka Tuck Fish.jpg", import.meta.url).href;
const pinterestFries = new URL("../../assets/source-images/Fries/fries.png", import.meta.url).href;
const pinterestPasta = new URL("../../assets/source-images/pasta/Chicken House Special Pasta.png", import.meta.url).href;
const pinterestPizza = new URL("../../assets/source-images/pizza/Chicken Tikka.jpg", import.meta.url).href;
const pinterestRice = new URL("../../assets/source-images/Rice & Biryani/Special Chicken Biryani.png", import.meta.url).href;
const pinterestSalad = new URL("../../assets/source-images/Raita & Salad/Fresh Salad.jpg", import.meta.url).href;
const pinterestChickenCornSoup = new URL("../../assets/source-images/Soups/Chicken Corn Soup.jpg", import.meta.url).href;
const pinterestSpecialSoup = new URL("../../assets/source-images/Soups/Chicken Special Soup.jpg", import.meta.url).href;
const pinterestHotSourSoup = new URL("../../assets/source-images/Soups/Hot & Sour Soup.jpg", import.meta.url).href;

const heroOrbitImages = [
  {
    title: "Front House",
    image: cafeFront,
    className: "left-[0%] top-[11.5rem] h-24 w-28 -rotate-[16deg] lg:left-[-1%] lg:top-[14.25rem] lg:h-40 lg:w-60 xl:left-[0%] xl:top-[14.5rem] xl:h-44 xl:w-72",
    mobileClassName: "-rotate-[8deg]",
  },
  {
    title: "Indoor Sitting",
    image: cafeIndoorSitting,
    className: "left-[17%] top-[5.8rem] h-24 w-28 -rotate-[8deg] lg:left-[15%] lg:top-[5.2rem] lg:h-40 lg:w-56 xl:left-[16%] xl:top-[5rem] xl:h-44 xl:w-64",
    mobileClassName: "-rotate-[3deg]",
  },
  {
    title: "Festival Garden",
    image: cafePlayFestival,
    className: "left-[31%] top-[0.45rem] h-28 w-36 -rotate-[2deg] lg:left-[31.5%] lg:top-[0.15rem] lg:h-44 lg:w-64 xl:left-[32%] xl:h-48 xl:w-72",
    mobileClassName: "-rotate-[2deg]",
  },
  {
    title: "Fresh Counter",
    image: cafeSaladBarPeople,
    className: "right-[31%] top-[0.45rem] h-28 w-36 rotate-[2deg] lg:right-[31.5%] lg:top-[0.15rem] lg:h-44 lg:w-64 xl:right-[32%] xl:h-48 xl:w-72",
    mobileClassName: "rotate-[4deg]",
  },
  {
    title: "Kitchen Craft",
    image: cafeWorkingKitchen,
    className: "right-[17%] top-[5.8rem] h-24 w-28 rotate-[8deg] lg:right-[15%] lg:top-[5.2rem] lg:h-40 lg:w-56 xl:right-[16%] xl:top-[5rem] xl:h-44 xl:w-64",
    mobileClassName: "rotate-[4deg]",
  },
  {
    title: "BBQ Section",
    image: cafeBbqSection,
    className: "right-[0%] top-[11.5rem] h-24 w-28 rotate-[16deg] lg:right-[-1%] lg:top-[14.25rem] lg:h-40 lg:w-60 xl:right-[0%] xl:top-[14.5rem] xl:h-44 xl:w-72",
    mobileClassName: "rotate-[7deg]",
  },
];

const heroFeatureItems = [
  { label: "Real Moments", icon: Camera },
  { label: "Real Flavors", icon: Flame },
  { label: "Real Hospitality", icon: Heart },
];

const spaceCards = [
  { title: "Front View", image: cafeSideposeFront },
  { title: "Cozy Lounge", image: cafeEntranceSitting },
  { title: "Salad Bar", image: cafeSaladBar2 },
  { title: "Lawn Seating", image: cafeSittingLawn },
  { title: "Live Kitchen", image: cafeCookingArea },
  { title: "Easy Parking", image: cafeParking },
  { title: "Table Style", image: cafeCrockery },
  { title: "Brand Wall", image: cafeChickBranding },
  { title: "Quick Delivery", image: cafeDeliveryBikes },
];

const foodStoryCards = [
  { title: "Chicken Tikka Pizza", image: pinterestPizza },
  { title: "Bar-B-Q Feast", image: pinterestBarBQPlatter },
  { title: "Makhni Karahi", image: pinterestKarahi },
  { title: "House Special Pasta", image: pinterestPasta },
  { title: "Garden Fresh Salad", image: pinterestSalad },
  { title: "Golden Fries", image: pinterestFries },
  { title: "Arabic Broast", image: pinterestBroast },
  { title: "Charcoal Chicken Tikka", image: pinterestChickenTikka },
  { title: "Winter Grill Fish", image: pinterestFish },
  { title: "Tawa Taka Tuck Fish", image: pinterestTawaFish },
  { title: "Boneless Fish Bites", image: pinterestBonelessFish },
  { title: "Hot & Sour Soup", image: pinterestHotSourSoup },
  { title: "Chicken Corn Soup", image: pinterestChickenCornSoup },
  { title: "Chicken Special Soup", image: pinterestSpecialSoup },
  { title: "Special Chicken Biryani", image: pinterestRice },
  { title: "Grilled Burger", image: pinterestBurger },
  { title: "Black Pepper Sizzle", image: pinterestBlackPepper },
  { title: "Brownie Ice Cream", image: pinterestBrownie },
];

const memoryPhotos = [
  { title: "Birthday", image: cafeBirthdaySequence, rotate: "-rotate-[7deg]" },
  { title: "Gathering", image: cafeGetTogether, rotate: "rotate-[4deg]" },
  { title: "Farewell", image: cafeClassFarewell, rotate: "-rotate-[2deg]" },
  { title: "Family Time", image: cafeEatingInCafe, rotate: "rotate-[6deg]" },
  { title: "Play Time", image: cafeKidsEnjoying, rotate: "-rotate-[4deg]" },
  { title: "Table Setup", image: cafeCrockerySetting, rotate: "rotate-[7deg]" },
];

const experienceCards = [
  { title: "Chef Craft", image: cafeChefOne, icon: ChefHat },
  { title: "Hot Counter", image: cafeChefTwo, icon: Flame },
  { title: "Plated With Care", image: cafeChefThree, icon: Heart },
  { title: "Kitchen Rhythm", image: cafeWorkingKitchen, icon: Users },
  { title: "Fresh Prep Station", image: cafeCookingArea, icon: UtensilsCrossed },
  { title: "BBQ Fire Station", image: cafeBbqSection, icon: Flame },
];

const galleryVideo = cafeGalleryVideo;
const eventVideo = cafeLiveKitchenVideo;

const sectionHeader = (title: string, text: string) => (
  <motion.div
    initial={{ opacity: 0, y: 22 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-90px" }}
    className="max-w-3xl"
  >
    <h2 className="font-display text-4xl font-bold leading-tight md:text-5xl">{title}</h2>
    <p className="mt-4 text-base leading-8 text-white/64 md:text-lg">{text}</p>
  </motion.div>
);

const CurveMotionGallerySection = () => (
  <section className="premium-curve-gallery relative isolate min-h-screen overflow-hidden bg-[#040201] px-4 pb-20 pt-36 text-[#fff6df] sm:px-6 sm:pt-40 lg:px-8">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_17%,rgba(244,189,98,0.3),transparent_26%),radial-gradient(circle_at_78%_30%,rgba(234,151,48,0.18),transparent_30%),radial-gradient(circle_at_16%_76%,rgba(127,18,21,0.22),transparent_30%),linear-gradient(180deg,#050201_0%,#0d0503_42%,#150804_74%,#070302_100%)]" />
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(244,189,98,0.06)_0_1px,transparent_1px_42px)] opacity-40" />
    <div className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-screen">
      <div className="gallery-smoke gallery-smoke-one" />
      <div className="gallery-smoke gallery-smoke-two" />
      <div className="gallery-smoke gallery-smoke-three" />
    </div>
    <motion.div
      aria-hidden="true"
      animate={{ opacity: [0.18, 0.38, 0.18], x: [0, 24, 0] }}
      transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      className="pointer-events-none absolute right-0 top-20 h-px w-2/3 bg-gradient-to-r from-transparent via-amber-300/80 to-transparent shadow-[0_0_34px_rgba(245,185,76,0.65)]"
    />

    <div className="relative mx-auto flex min-h-[calc(100vh-9rem)] max-w-[110rem] items-center justify-center">
      <div className="relative w-full">
        <div className="mb-8 grid grid-cols-2 gap-3 rounded-[1.8rem] border border-[#f4bd62]/18 bg-white/[0.045] p-2 shadow-[0_22px_80px_rgba(0,0,0,0.34)] backdrop-blur-sm md:hidden">
          {heroOrbitImages.slice(0, 2).map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.5 }}
              className="h-32 overflow-hidden rounded-[1.25rem] border border-[#f4bd62]/30 bg-black/30 shadow-[0_14px_38px_rgba(0,0,0,0.36)]"
            >
              <img src={item.image} alt={item.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            </motion.div>
          ))}
        </div>

        <motion.svg
          aria-hidden="true"
          viewBox="0 0 1000 390"
          initial={{ opacity: 0, pathLength: 0.35 }}
          animate={{ opacity: 1, pathLength: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="pointer-events-none absolute left-1/2 top-0 hidden h-[25rem] w-[92rem] max-w-[100vw] -translate-x-1/2 md:block"
        >
          <defs>
            <linearGradient id="galleryHeroArc" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#f4bd62" stopOpacity="0" />
              <stop offset="20%" stopColor="#f4bd62" stopOpacity="0.55" />
              <stop offset="50%" stopColor="#ffe3a3" stopOpacity="0.9" />
              <stop offset="80%" stopColor="#f4bd62" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#f4bd62" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M54 354 C180 44 820 44 946 354" fill="none" stroke="#f4bd62" strokeWidth="34" strokeLinecap="round" opacity="0.07" />
          <motion.path
            d="M54 354 C180 44 820 44 946 354"
            fill="none"
            stroke="url(#galleryHeroArc)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="drop-shadow(0 0 16px rgba(244,189,98,0.6))"
          />
          <path d="M110 382 C250 118 750 118 890 382" fill="none" stroke="#f4bd62" strokeWidth="1.5" strokeLinecap="round" opacity="0.28" />
        </motion.svg>

        <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-[26rem] md:block">
          {heroOrbitImages.map((item, index) => (
            <div
              key={item.title}
              className={`pointer-events-auto absolute ${item.className}`}
            >
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.08, duration: 0.64, ease: "easeOut" }}
                whileHover={{ y: -10, scale: 1.035 }}
                className="h-full w-full overflow-hidden rounded-[1.35rem] border border-[#f4bd62]/45 bg-black/30 shadow-[0_24px_80px_rgba(0,0,0,0.48),0_0_38px_rgba(244,189,98,0.22)] backdrop-blur"
              >
                <img src={item.image} alt={item.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              </motion.div>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.74, ease: "easeOut" }}
          className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center md:pt-[21rem] lg:pt-[22rem]"
        >
          <div className="inline-flex items-center gap-3 sm:gap-4">
            <span className="text-[11px] font-black uppercase tracking-[0.28em] text-[#f4bd62] sm:text-xs sm:tracking-[0.38em]">Our Gallery</span>
            <span className="h-px w-16 bg-gradient-to-r from-transparent via-[#f4bd62] to-transparent sm:w-24" />
            <Sparkles size={15} className="text-[#f4bd62]" />
          </div>

          <h1 className="mt-6 font-display text-[clamp(3rem,14vw,4.25rem)] font-black leading-[0.94] tracking-normal text-white sm:mt-7 sm:text-7xl xl:text-8xl">
            <span className="block">
              A <span className="text-[#e5b85f]">Virtual</span>
            </span>
            <span className="block">Look Inside</span>
          </h1>

          <div className="mt-6 flex items-center gap-3 text-[#d8a82f] sm:mt-7">
            <span className="h-px w-20 bg-gradient-to-r from-transparent to-[#d8a82f]" />
            <Sparkles size={18} />
            <span className="h-px w-20 bg-gradient-to-l from-transparent to-[#d8a82f]" />
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-2 sm:mt-8 sm:gap-3">
            {heroFeatureItems.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-amber-200/15 bg-white/[0.06] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/70 backdrop-blur sm:px-4 sm:text-[11px] sm:tracking-[0.22em]"
              >
                <Icon size={14} className="text-[#f4bd62]" />
                {label}
              </span>
            ))}
          </div>

          <div className="mt-8 flex w-full max-w-xs flex-col justify-center gap-3 sm:mt-9 sm:max-w-none sm:flex-row sm:flex-wrap sm:gap-4">
            <a
              href="#gallery-grid"
              className="group inline-flex items-center justify-center gap-3 rounded-full border border-[#f4bd62]/85 bg-[#f4bd62] px-6 py-3 text-sm font-bold text-[#120805] shadow-[0_0_34px_rgba(245,158,11,0.22)] transition hover:-translate-y-1 hover:bg-[#ffd98a] sm:px-7 sm:py-4 sm:text-base"
            >
              Explore Gallery
              <ChevronRight size={18} className="transition group-hover:translate-x-1" />
            </a>
            <Link
              to="/booking"
              className="inline-flex items-center justify-center gap-3 rounded-full border border-[#f4bd62]/45 bg-black/25 px-6 py-3 text-sm font-bold text-[#ffd98a] shadow-[0_0_28px_rgba(245,158,11,0.12)] backdrop-blur-md transition hover:-translate-y-1 hover:border-[#f4bd62] hover:bg-white/10 hover:text-white sm:px-7 sm:py-4 sm:text-base"
            >
              <CalendarDays size={18} />
              Book a Table
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const RealCafeShowcase = () => {
  const featureCards = [
    {
      title: "Where Every Corner Feels Like Home.",
      image: cafeEatingInCafe,
      className: "md:col-span-2 lg:col-span-6 lg:row-span-2",
    },
    {
      title: "Table Setting",
      image: cafeCrockerySetting,
      className: "lg:col-span-3",
    },
    {
      title: "Birthday Lights",
      image: cafeBirthdaySequence,
      className: "lg:col-span-3",
    },
    {
      title: "Group Gathering",
      image: cafeGetTogether,
      className: "lg:col-span-3",
    },
    {
      title: "Class Celebration",
      image: cafeClassFarewell,
      className: "lg:col-span-3",
    },
  ];

  return (
    <section className="relative overflow-hidden border-y border-[#d8a82f]/10 bg-[linear-gradient(180deg,#080302_0%,#100604_54%,#0b0403_100%)] px-4 py-20 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(245,158,11,0.16),transparent_28%),radial-gradient(circle_at_86%_74%,rgba(127,18,21,0.18),transparent_30%)]" />
      <div className="relative mx-auto max-w-[94rem]">
        <div className="mb-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-90px" }}
          >
            <div className="inline-flex items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-amber-300 sm:text-base">
              <Camera size={17} />
              Visual Story
            </div>
            <h2 className="mt-5 font-display text-4xl font-black leading-tight text-white sm:text-5xl">
              Where Every Corner <span className="text-[#d8a82f]">Feels Like Home.</span>
            </h2>
          </motion.div>
        </div>

        <div className="grid auto-rows-[15rem] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[12.5rem]">
          {featureCards.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true, margin: "-90px" }}
              className={`group relative overflow-hidden rounded-lg border border-[#d8a82f]/28 bg-white/5 shadow-[0_24px_90px_rgba(0,0,0,0.36),0_0_22px_rgba(216,168,47,0.1)] ${card.className}`}
            >
              <img src={card.image} alt={card.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/16 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">{card.title}</h3>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

const GalleryPage = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-[#0b0403] text-white">
      <CurveMotionGallerySection />

      <section className="border-y border-[#d8a82f]/10 bg-[#060302] py-4">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="flex min-w-max gap-12 whitespace-nowrap text-xs font-bold uppercase tracking-[0.42em] text-[#d8a82f]/36"
        >
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index}>Live Kitchen / Food Aesthetics / Family Moments / Event Nights / Signature Dishes</span>
          ))}
        </motion.div>
      </section>

      <RealCafeShowcase />

      <section id="gallery-grid" className="relative overflow-hidden bg-[linear-gradient(180deg,#0b0403_0%,#130805_100%)] px-4 py-24 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute left-[-10rem] top-16 h-80 w-80 rounded-full border border-[#d8a82f]/12" />
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#d8a82f]/25 to-transparent" />
        <div className="relative mx-auto max-w-[92rem]">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-[#d8a82f] sm:text-base">
              <Home size={16} />
              Explore Our Spaces
            </div>
            <h2 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl">Explore Our Spaces</h2>
          </div>

          <div className="gallery-scrollbar mt-12 flex snap-x gap-3 overflow-x-auto pb-8 sm:gap-5">
            {spaceCards.map((card, index) => (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true, margin: "-80px" }}
                className="group relative h-72 w-[14rem] shrink-0 snap-center overflow-hidden rounded-lg border border-[#d8a82f]/30 bg-white/5 shadow-[0_24px_70px_rgba(0,0,0,0.34)] sm:w-[18rem] md:w-[21rem]"
              >
                <img src={card.image} alt={card.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/12 to-transparent" />
                <h3 className="absolute inset-x-0 bottom-0 p-5 text-center font-display text-2xl font-bold text-white">{card.title}</h3>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-[#d8a82f]/10 bg-[radial-gradient(circle_at_50%_50%,rgba(216,168,47,0.12),transparent_34%),linear-gradient(180deg,#100604_0%,#080302_100%)] px-4 py-24 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-[92rem]">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-[#d8a82f] sm:text-base">
              <UtensilsCrossed size={16} />
              House Favorites
            </div>
            <h2 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl">Made Fresh. Served with Love.</h2>
          </div>

          <div className="gallery-scrollbar mt-14 flex snap-x items-end gap-5 overflow-x-auto pb-9">
            {foodStoryCards.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -12, rotate: index % 2 === 0 ? -1.2 : 1.2 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true, margin: "-90px" }}
                className="group relative h-48 w-40 shrink-0 snap-center overflow-hidden rounded-lg border border-[#d8a82f]/30 bg-black/28 shadow-[0_24px_70px_rgba(0,0,0,0.34)] transition-[width,height,transform] duration-500 sm:h-64 sm:w-56 sm:hover:h-80 sm:hover:w-64 md:h-72 md:w-60 md:hover:h-96 md:hover:w-72"
              >
                <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/10 to-transparent" />
                <h3 className="absolute inset-x-0 bottom-0 p-5 text-center font-display text-xl font-bold text-white">{item.title}</h3>
              </motion.article>
            ))}
          </div>

          <div className="mt-2 text-center">
            <Link to="/menu" className="inline-flex items-center gap-3 rounded-full border border-[#d8a82f]/55 bg-black/28 px-7 py-3 font-bold text-[#ffd98a] transition hover:-translate-y-1 hover:bg-[#d8a82f] hover:text-[#120805]">
              View Full Menu
              <ChevronRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#0b0403_0%,#140805_100%)] py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d8a82f]/30 to-transparent" />
        <div className="mx-auto grid max-w-[92rem] items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="relative overflow-hidden rounded-[4rem_1.2rem_4rem_1.2rem] border border-[#d8a82f]/28 bg-black/35 shadow-[0_30px_90px_rgba(0,0,0,0.42)]"
          >
            <div className="relative h-[24rem] overflow-hidden bg-black sm:h-[32rem]">
              <video autoPlay muted loop playsInline controls className="h-full w-full object-cover">
                <source src={galleryVideo} type="video/mp4" />
              </video>
            </div>
            <div className="absolute left-6 top-6 rounded-full border border-[#d8a82f]/30 bg-black/42 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-[#ffd98a] backdrop-blur-md">
              Video Gallery
            </div>
          </motion.div>
          <div>
            {sectionHeader("A Walk Through Chicken House", "Entrance, seating, garden mood, and the warm movement of the real place in one cinematic pass.")}
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[cafeEntrance, cafeSittingLawn, cafePlayFestival].map((image, index) => (
                <motion.div
                  key={image}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  viewport={{ once: true, margin: "-90px" }}
                  className="aspect-square overflow-hidden rounded-lg border border-[#d8a82f]/22 bg-white/5"
                >
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#140805_0%,#0b0403_100%)] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[92rem] items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            {sectionHeader("Kids Play Area", "A family-friendly corner that makes longer dinners easier, calmer, and more memorable.")}
          </div>
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-90px" }}
            className="relative grid gap-4 md:grid-cols-[0.65fr_0.35fr]"
          >
            <div className="relative min-h-[24rem] overflow-hidden rounded-[1.2rem_4rem_1.2rem_4rem] border border-[#d8a82f]/28 bg-white/5 shadow-[0_30px_90px_rgba(0,0,0,0.36)]">
              <img src={cafeKidsEnjoying} alt="Kids enjoying Chicken House play area" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-transparent to-transparent" />
              <h3 className="absolute bottom-6 left-6 font-display text-3xl font-bold">Family Comfort</h3>
            </div>
            <div className="grid gap-4">
              {[cafePlayZoom, cafeSittingPlayArea].map((image, index) => (
                <div key={image} className={`overflow-hidden border border-[#d8a82f]/22 bg-white/5 ${index === 0 ? "rounded-[3rem_1rem_1rem_1rem]" : "rounded-[1rem_1rem_3rem_1rem]"}`}>
                  <img src={image} alt="" className="h-40 w-full object-cover sm:h-48 md:h-full" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-[#d8a82f]/10 bg-[linear-gradient(180deg,#080302_0%,#120704_100%)] px-4 py-24 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-x-6 top-1/2 hidden h-px bg-gradient-to-r from-transparent via-[#d8a82f]/55 to-transparent md:block" />
        <div className="relative mx-auto max-w-[92rem]">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-[#d8a82f] sm:text-base">
              <Camera size={16} />
              Photo String
            </div>
            <h2 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl">Moments That Stay With You</h2>
          </div>
          <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-6">
            {memoryPhotos.map((photo, index) => (
              <motion.article
                key={photo.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -12, rotate: 0 }}
                transition={{ delay: index * 0.04 }}
                viewport={{ once: true, margin: "-90px" }}
                className={`relative bg-[#fff8ea] p-3 pb-8 text-[#120805] shadow-[0_24px_70px_rgba(0,0,0,0.35)] ${photo.rotate}`}
              >
                <span className="absolute -top-4 left-1/2 h-7 w-5 -translate-x-1/2 rounded-sm border border-[#d8a82f]/25 bg-[#caa45c] shadow-lg" />
                <img src={photo.image} alt={photo.title} className="h-44 w-full object-cover" referrerPolicy="no-referrer" />
                <h3 className="mt-3 text-center font-display text-lg font-bold">{photo.title}</h3>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#120704_0%,#0b0403_100%)] py-24">
        <div className="absolute right-[-8rem] top-24 hidden h-80 w-80 rounded-full border border-[#d8a82f]/10 lg:block" />
        <div className="mx-auto grid max-w-[92rem] items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            {sectionHeader("Live Kitchen in Motion", "A quick look at the kitchen rhythm, fresh handling, and the movement behind a prepared meal.")}
            <div className="mt-8 flex flex-wrap gap-3">
              {["Fresh Prep", "Hot Grill", "Daily Service"].map((label) => (
                <span key={label} className="rounded-full border border-[#d8a82f]/24 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#ffd98a]">
                  {label}
                </span>
              ))}
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-90px" }}
            className="overflow-hidden rounded-[5rem_1.2rem_5rem_1.2rem] border border-[#d8a82f]/28 bg-white/5 shadow-[0_30px_90px_rgba(0,0,0,0.4)]"
          >
            <div className="relative h-[24rem] overflow-hidden bg-black sm:h-[31rem]">
              <video autoPlay muted loop playsInline controls className="h-full w-full object-cover">
                <source src={eventVideo} type="video/mp4" />
              </video>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#0b0403_0%,#130805_100%)] px-4 py-24 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-[92rem]">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-[#d8a82f] sm:text-base">
              <Sparkles size={16} />
              Experience Chicken House
            </div>
            <h2 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl">Experience Chicken House</h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {experienceCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.article
                  key={card.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -10 }}
                  transition={{ delay: index * 0.04 }}
                  viewport={{ once: true, margin: "-90px" }}
                  className="group relative h-72 overflow-hidden rounded-lg border border-[#d8a82f]/28 bg-white/5 shadow-[0_24px_70px_rgba(0,0,0,0.32)]"
                >
                  <img src={card.image} alt={card.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/18 to-transparent" />
                  <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#d8a82f]/35 bg-black/34 text-[#ffd98a] backdrop-blur">
                    <Icon size={17} />
                  </div>
                  <h3 className="absolute bottom-0 p-5 font-display text-2xl font-bold text-white">{card.title}</h3>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-4 pb-32 pt-12 text-center sm:px-6 lg:px-8">
        <div className="absolute inset-x-0 top-12 mx-auto h-48 max-w-5xl rounded-[50%] border border-[#d8a82f]/14" />
        <div className="relative mx-auto grid max-w-[92rem] overflow-hidden rounded-lg border border-[#d8a82f]/24 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(216,168,47,0.08),rgba(255,255,255,0.02))] shadow-[0_30px_90px_rgba(0,0,0,0.36)] lg:grid-cols-[0.85fr_1.15fr]">
          <div className="min-h-[20rem] overflow-hidden">
            <img src={cafeEntrance} alt="Chicken House entrance" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col items-center justify-center px-6 py-12 lg:items-start lg:text-left">
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-90px" }}
              className="font-display text-4xl font-black leading-tight md:text-6xl"
            >
              MAKE THE GALLERY FEEL
              <span className="block text-[#d8a82f]">LIKE A REAL PLACE.</span>
            </motion.h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/62">
              Visit us, dine with us, and create your own memories at Chicken House.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
              <Link to="/menu" className="inline-flex items-center gap-2 rounded-full bg-[#d8a82f] px-8 py-4 font-black text-[#120805] transition hover:-translate-y-1 hover:bg-white">
                Explore Menu
                <UtensilsCrossed size={18} />
              </Link>
              <Link to="/booking" className="inline-flex items-center gap-2 rounded-full border border-[#d8a82f]/35 bg-black/25 px-8 py-4 font-black text-white transition hover:-translate-y-1 hover:bg-white/10">
                Book A Table
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GalleryPage;
