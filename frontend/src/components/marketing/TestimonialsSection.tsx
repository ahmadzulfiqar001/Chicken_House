import { useState, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, Quote, ChevronLeft, ChevronRight, Send } from "lucide-react";

const initialTestimonials = [
  {
    name: "Ahmed Raza",
    role: "Regular Guest",
    text: "Chicken House feels like our regular family spot. The food is fresh, the taste is simple and rich, and the staff always treats us well.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
  },
  {
    name: "Bilal Akhtar",
    role: "Winter Fish Lover",
    text: "Every winter we buy fish from Chicken House because the taste and freshness are always reliable. It has become a family habit for us.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
  },
  {
    name: "Hassan Javed",
    role: "Family Host",
    text: "Whenever we have to host guests, Chicken House is the first name that comes to mind. We trust their food, service, and timing.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80"
  },
  {
    name: "Usman Tariq",
    role: "Local Customer",
    text: "Their BBQ and karahi both have a homelike comfort. It is the kind of place where everyone can find something they enjoy.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80"
  },
  {
    name: "Farhan Malik",
    role: "GT Road Traveler",
    text: "I stopped here on GT Road and the food was fresh, hot, and served quickly. Now I recommend it to friends who pass through Renala Khurd.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80"
  },
  {
    name: "Danish Ali",
    role: "Weekend Visitor",
    text: "The atmosphere is comfortable for families, and the taste feels consistent every time. That is why we keep coming back.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"
  }
];

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [reviewForm, setReviewForm] = useState({ name: "", text: "" });

  const nextTestimonial = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const handleReviewSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = reviewForm.name.trim();
    const text = reviewForm.text.trim();

    if (!name || !text) {
      return;
    }

    setTestimonials((items) => [
      ...items,
      {
        name,
        text,
        role: "Guest Review",
        rating: 5,
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80"
      }
    ]);
    setDirection(1);
    setCurrentIndex(testimonials.length);
    setReviewForm({ name: "", text: "" });
  };

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
    <section className="py-20 bg-dark relative overflow-hidden">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 atmosphere opacity-40" />
      
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-14 gap-8">
          <div className="text-left">
            <span className="text-accent font-mono text-xs uppercase tracking-[0.5em] mb-6 block">Voices</span>
            <h2 className="text-5xl md:text-7xl font-anton uppercase leading-[0.82] tracking-tighter text-white">
              Guest <br />
              <span className="text-stroke text-accent">Experiences</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 h-[1px] bg-white/20" />
            <span className="text-white/40 font-mono text-xs uppercase tracking-widest">Scroll to explore</span>
          </div>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-[1fr,360px]">
          <div className="relative h-[460px] flex items-center justify-center perspective-1000">
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
                className="absolute w-full max-w-3xl glass-morphism p-8 md:p-12 rounded-[2rem] border-white/10 relative group hover:bg-white/10 transition-all duration-500 shadow-2xl"
              >
                <div className="absolute -top-6 -left-6 w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-2xl z-20">
                  <Quote size={28} className="text-dark" fill="currentColor" />
                </div>

                <div className="flex items-center gap-2 text-accent mb-8">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>

                <p className="text-white text-2xl md:text-4xl font-light italic leading-tight mb-10 font-serif tracking-tight">
                  "{testimonials[currentIndex].text}"
                </p>

                <div className="flex items-center gap-5 pt-8 border-t border-white/10">
                  <img
                    src={testimonials[currentIndex].image}
                    alt={testimonials[currentIndex].name}
                    className="w-18 h-18 rounded-[1.4rem] object-cover transition-all duration-500 shadow-xl"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-white font-bold text-2xl mb-1">{testimonials[currentIndex].name}</h4>
                    <p className="text-accent font-mono text-[10px] uppercase tracking-[0.3em]">{testimonials[currentIndex].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-6 z-30">
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                whileTap={{ scale: 0.9 }}
                onClick={prevTestimonial}
                className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Previous review"
              >
                <ChevronLeft size={20} />
              </motion.button>

              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setDirection(i > currentIndex ? 1 : -1);
                      setCurrentIndex(i);
                    }}
                    className={`h-2.5 rounded-full transition-all duration-500 ${i === currentIndex ? "bg-accent w-10" : "w-2.5 bg-white/20 hover:bg-white/40"}`}
                    aria-label={`Open review ${i + 1}`}
                  />
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                whileTap={{ scale: 0.9 }}
                onClick={nextTestimonial}
                className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Next review"
              >
                <ChevronRight size={20} />
              </motion.button>
            </div>
          </div>

          <form onSubmit={handleReviewSubmit} className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
            <span className="text-accent font-mono text-[10px] uppercase tracking-[0.4em]">Add Your Review</span>
            <h3 className="mt-4 font-display text-3xl font-bold text-white">Share your Chicken House experience.</h3>
            <input
              value={reviewForm.name}
              onChange={(event) => setReviewForm({ ...reviewForm, name: event.target.value })}
              placeholder="Your name"
              className="mt-6 w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white outline-none placeholder:text-white/35 focus:border-accent"
            />
            <textarea
              value={reviewForm.text}
              onChange={(event) => setReviewForm({ ...reviewForm, text: event.target.value })}
              placeholder="Write a simple review..."
              rows={5}
              className="mt-4 w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white outline-none placeholder:text-white/35 focus:border-accent"
            />
            <button type="submit" className="mt-5 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-accent px-6 py-4 font-bold text-dark transition hover:bg-white">
              Post Review
              <Send size={18} />
            </button>
            <p className="mt-4 text-sm leading-6 text-white/45">Your review appears instantly on this page for preview.</p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
