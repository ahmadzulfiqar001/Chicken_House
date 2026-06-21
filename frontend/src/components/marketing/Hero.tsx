import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ChevronRight, Play, Star, ArrowDown } from "lucide-react";
import { siteConfig } from "../../lib/site";

const tickerItems = [
  "Authentic BBQ",
  "Desi Karahi",
  "Smart Booking",
  "Premium Dining",
  "Fast Delivery",
];

const Hero = () => {
  return (
    <section className="relative min-h-[92dvh] flex items-center justify-center overflow-hidden bg-dark">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.94 }}
        transition={{ duration: 1.8 }}
        className="absolute inset-0 z-0"
      >
        <video
          className="h-full w-full scale-105 object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={siteConfig.imageFallback}
          aria-hidden="true"
        >
          <source src={siteConfig.heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,170,73,0.14),transparent_34%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-dark/42 via-dark/28 to-dark/58" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/58 via-dark/20 to-dark/28" />
      </motion.div>

      <div className="absolute inset-0 atmosphere pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 pt-32 pb-36 md:pt-36 md:pb-40">
        <div className="relative flex flex-col items-start">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-10 right-0 h-36 w-36 hidden xl:flex items-center justify-center opacity-70"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path
                id="circlePath"
                d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                fill="none"
              />
              <text className="text-[8px] font-mono uppercase tracking-[0.2em] fill-accent/40">
                <textPath xlinkHref="#circlePath">
                  Premium Dining Experience - Authentic Pakistani BBQ -
                </textPath>
              </text>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Star size={24} className="text-accent/40" fill="currentColor" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6 inline-flex max-w-full items-center gap-3 sm:mb-8 sm:gap-4"
          >
            <div className="h-px w-12 flex-shrink-0 bg-accent sm:w-24" />
            <span className="text-accent font-mono text-xs tracking-normal uppercase sm:text-sm">
              Live Kitchen - Renala Khurd
            </span>
          </motion.div>

          <div className="mb-7 max-w-[980px] sm:mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
              className="text-[clamp(2.25rem,10.5vw,3.25rem)] sm:text-[clamp(4.8rem,13vw,8.5rem)] md:text-[clamp(5.6rem,10vw,9.5rem)] font-anton leading-none text-white uppercase tracking-normal sm:leading-[0.88]"
            >
              Chicken <br />
              <span className="text-accent drop-shadow-[0_10px_30px_rgba(255,171,73,0.22)]">
                House
              </span>
            </motion.h1>
          </div>

          <div className="w-full max-w-[820px]">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="max-w-[18rem] text-base font-display font-semibold leading-snug text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:max-w-3xl sm:text-3xl md:text-4xl"
            >
              Traditional Taste, Homelike Comfort, and a Warm Atmosphere.
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4"
            >
              <Link to="/menu" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05, rotate: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex w-full items-center justify-center gap-3 rounded-full bg-accent px-8 py-4 text-base font-bold text-dark shadow-2xl shadow-accent/40 group md:px-10 md:py-5 md:text-lg"
                >
                  Explore Menu
                  <ChevronRight
                    size={22}
                    className="group-hover:translate-x-2 transition-transform"
                  />
                </motion.button>
              </Link>
              <Link to="/booking" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-base font-bold text-white backdrop-blur-xl transition-all hover:bg-white/10 md:px-10 md:py-5 md:text-lg"
                >
                  <Play size={22} fill="currentColor" />
                  Book A Table
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 overflow-hidden border-t border-white/5 bg-accent/5 py-4 backdrop-blur-sm sm:py-5 md:py-6">
        <div className="marquee-track font-anton text-xl uppercase text-white/45 sm:text-2xl md:text-3xl">
          {[0, 1].map((groupIndex) => (
            <div
              key={groupIndex}
              className="marquee-group"
              aria-hidden={groupIndex === 1}
            >
              {tickerItems.map((item) => (
                <span className="marquee-item" key={`${groupIndex}-${item}`}>
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-28 left-1/2 -translate-x-1/2 text-white/45 hidden md:flex flex-col items-center gap-3"
      >
        <span className="text-[10px] uppercase tracking-[0.5em] font-mono">
          Scroll
        </span>
        <ArrowDown size={20} />
      </motion.div>
    </section>
  );
};

export default Hero;
