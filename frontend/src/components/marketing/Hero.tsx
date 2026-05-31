import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ChevronRight, Play, Star, ArrowDown } from "lucide-react";
import { siteConfig } from "../../lib/site";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark">
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
          <source src="/bg-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,170,73,0.14),transparent_34%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-dark/42 via-dark/28 to-dark/58" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/58 via-dark/20 to-dark/28" />
      </motion.div>

      <div className="absolute inset-0 atmosphere pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 pt-36 pb-44 md:pt-40 md:pb-48">
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
            className="inline-flex items-center gap-4 mb-8"
          >
            <div className="h-px w-24 bg-accent" />
            <span className="text-accent font-mono text-sm tracking-[0.3em] uppercase">
              Live Kitchen - Renala Khurd
            </span>
          </motion.div>

          <div className="mb-8 max-w-[980px]">
            <motion.h1
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
              className="text-[clamp(4.6rem,12vw,9rem)] md:text-[clamp(5.6rem,10vw,9.5rem)] font-anton leading-[0.88] text-white uppercase tracking-[-0.05em]"
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
              className="max-w-3xl text-2xl font-display font-semibold leading-snug text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:text-3xl md:text-4xl"
            >
              Traditional Taste, Homelike Comfort, and a Warm Atmosphere.
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link to="/menu">
                <motion.button
                  whileHover={{ scale: 1.05, rotate: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 md:px-10 py-4 md:py-5 rounded-full bg-accent text-dark font-bold text-base md:text-lg flex items-center gap-3 shadow-2xl shadow-accent/40 group"
                >
                  Explore Menu
                  <ChevronRight
                    size={22}
                    className="group-hover:translate-x-2 transition-transform"
                  />
                </motion.button>
              </Link>
              <Link to="/booking">
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 md:px-10 py-4 md:py-5 rounded-full bg-white/5 backdrop-blur-xl text-white font-bold text-base md:text-lg flex items-center gap-3 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <Play size={22} fill="currentColor" />
                  Book A Table
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 py-6 bg-accent/5 backdrop-blur-sm border-t border-white/5 overflow-hidden">
        <div className="marquee-track flex whitespace-nowrap gap-10 text-white/20 font-anton text-2xl md:text-3xl uppercase tracking-[0.18em]">
          <span>Authentic BBQ</span>
          <span>/</span>
          <span>Desi Karahi</span>
          <span>/</span>
          <span>Smart Booking</span>
          <span>/</span>
          <span>Premium Dining</span>
          <span>/</span>
          <span>Fast Delivery</span>
          <span>/</span>
          <span>Authentic BBQ</span>
          <span>/</span>
          <span>Desi Karahi</span>
          <span>/</span>
          <span>Smart Booking</span>
          <span>/</span>
          <span>Premium Dining</span>
          <span>/</span>
          <span>Fast Delivery</span>
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
