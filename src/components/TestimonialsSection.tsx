import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const testimonials = [
    {
      name: "Ahmed Raza",
      role: "Local Foodie",
      text: "The Chicken Karahi here is unmatched. I've tried many places in Okara and Sahiwal, but Chicken House Renala has a unique taste that keeps me coming back every week.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
    },
    {
      name: "Sana Malik",
      role: "Traveler",
      text: "Stopped here while traveling from Lahore to Multan. The service was lightning fast, and the BBQ platter was incredibly juicy. A must-stop for anyone on the GT Road!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
    },
    {
      name: "Zubair Khan",
      role: "Business Owner",
      text: "We often host our corporate lunches here. The ambiance is great, and the staff is very professional. Their hygiene standards are the best in the region.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
    }
  ];

  const nextTestimonial = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const timer = setInterval(nextTestimonial, 8000);
    return () => clearInterval(timer);
  }, []);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 45 : -45
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 45 : -45
    })
  };

  return (
    <section className="py-32 bg-dark relative overflow-hidden">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 atmosphere opacity-40" />
      
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-24 gap-12">
          <div className="text-left">
            <span className="text-accent font-mono text-xs uppercase tracking-[0.5em] mb-8 block">Voices</span>
            <h2 className="text-6xl md:text-8xl font-anton uppercase leading-[0.8] tracking-tighter text-white">
              Guest <br />
              <span className="text-stroke text-accent">Experiences</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 h-[1px] bg-white/20" />
            <span className="text-white/40 font-mono text-xs uppercase tracking-widest">Scroll to explore</span>
          </div>
        </div>
        
        <div className="relative h-[600px] flex items-center justify-center perspective-1000">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.5 },
                scale: { duration: 0.5 },
                rotateY: { duration: 0.5 }
              }}
              className="absolute w-full max-w-4xl glass-morphism p-12 md:p-20 rounded-[4rem] border-white/10 relative group hover:bg-white/10 transition-all duration-500 shadow-2xl"
            >
              <div className="absolute -top-10 -left-10 w-24 h-24 bg-accent rounded-full flex items-center justify-center shadow-2xl z-20">
                <Quote size={40} className="text-dark" fill="currentColor" />
              </div>
              
              <div className="flex items-center gap-2 text-accent mb-12">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} size={20} fill="currentColor" />
                ))}
              </div>
              
              <p className="text-white text-3xl md:text-5xl font-light italic leading-tight mb-16 font-serif tracking-tight">
                "{testimonials[currentIndex].text}"
              </p>
              
              <div className="flex items-center gap-8 pt-12 border-t border-white/10">
                <img 
                  src={testimonials[currentIndex].image} 
                  alt={testimonials[currentIndex].name} 
                  className="w-24 h-24 rounded-[2rem] object-cover transition-all duration-500 shadow-xl"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-white font-bold text-3xl mb-2">{testimonials[currentIndex].name}</h4>
                  <p className="text-accent font-mono text-xs uppercase tracking-[0.3em]">{testimonials[currentIndex].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-8 z-30">
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
              whileTap={{ scale: 0.9 }}
              onClick={prevTestimonial}
              className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </motion.button>
            
            <div className="flex gap-3">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > currentIndex ? 1 : -1);
                    setCurrentIndex(i);
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-500 ${i === currentIndex ? "bg-accent w-12" : "bg-white/20 hover:bg-white/40"}`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
              whileTap={{ scale: 0.9 }}
              onClick={nextTestimonial}
              className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight size={24} />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
