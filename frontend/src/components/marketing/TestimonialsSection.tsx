import { useState, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, Quote, ChevronLeft, ChevronRight, Send } from "lucide-react";

const initialTestimonials = [
  {
    name: "Ahmed Raza",
    role: "Regular Guest",
    text: "Chicken House feels like our regular family spot. The food is fresh, the taste is simple and rich, and the staff always treats us well.",
    rating: 5,
  },
  {
    name: "Bilal Akhtar",
    role: "Winter Fish Lover",
    text: "Every winter we buy fish from Chicken House because the taste and freshness are always reliable. It has become a family habit for us.",
    rating: 5,
  },
  {
    name: "Hassan Javed",
    role: "Family Host",
    text: "Whenever we have to host guests, Chicken House is the first name that comes to mind. We trust their food, service, and timing.",
    rating: 5,
  },
  {
    name: "Usman Tariq",
    role: "Local Customer",
    text: "Their BBQ and karahi both have a homelike comfort. It is the kind of place where everyone can find something they enjoy.",
    rating: 5,
  },
  {
    name: "Farhan Malik",
    role: "GT Road Traveler",
    text: "I stopped here on GT Road and the food was fresh, hot, and served quickly. Now I recommend it to friends who pass through Renala Khurd.",
    rating: 5,
  },
  {
    name: "Danish Ali",
    role: "Weekend Visitor",
    text: "The atmosphere is comfortable for families, and the taste feels consistent every time. That is why we keep coming back.",
    rating: 5,
  }
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const mapReview = (review) => ({
  name: review.customerName,
  role: review.source === "website" ? "Verified Guest" : (review.source || "Guest Review"),
  text: review.comment,
  rating: review.rating || 5,
});

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [reviewForm, setReviewForm] = useState({ name: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const nextTestimonial = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch("/api/reviews?limit=12");
        const data = await response.json();

        if (response.ok && Array.isArray(data) && data.length > 0) {
          setTestimonials(data.map(mapReview));
          setCurrentIndex(0);
        }
      } catch (error) {
        console.error("Failed to load reviews", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const handleReviewSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = reviewForm.name.trim();
    const text = reviewForm.text.trim();

    if (!name || !text || submitting) {
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: name, comment: text, rating: 5 })
      });
      const data = await response.json();

      if (!response.ok) {
        setFeedback({ type: "error", message: data?.message || "Could not post your review. Please try again." });
        return;
      }

      const newTestimonial = mapReview(data);
      setTestimonials((items) => [newTestimonial, ...items]);
      setDirection(-1);
      setCurrentIndex(0);
      setReviewForm({ name: "", text: "" });
      setFeedback({ type: "success", message: "Thanks for sharing! Your review now appears in the carousel." });
    } catch (error) {
      console.error("Failed to post review", error);
      setFeedback({ type: "error", message: "Could not post your review. Please try again." });
    } finally {
      setSubmitting(false);
    }
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
            <span className="text-white/40 font-mono text-xs uppercase tracking-widest">
              {loading ? "Loading reviews..." : "Scroll to explore"}
            </span>
          </div>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="relative flex flex-col items-center justify-center gap-6 perspective-1000 md:min-h-[540px] md:gap-0">
            <AnimatePresence initial={false} custom={direction} mode="wait">
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
                className="relative w-full max-w-3xl glass-morphism rounded-[2rem] border-white/10 p-6 shadow-2xl transition-all duration-500 hover:bg-white/10 sm:p-8 md:absolute md:p-12"
              >
                <div className="absolute -left-3 -top-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-accent shadow-2xl sm:-left-6 sm:-top-6 sm:h-16 sm:w-16">
                  <Quote size={26} className="text-dark sm:size-7" fill="currentColor" />
                </div>

                <div className="mb-7 flex items-center gap-2 text-accent sm:mb-8">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>

                <p className="mb-8 font-serif text-[1.55rem] font-light italic leading-snug text-white sm:text-2xl md:mb-10 md:text-[2.35rem] md:leading-tight lg:text-4xl">
                  "{testimonials[currentIndex].text}"
                </p>

                <div className="flex items-center gap-4 border-t border-white/10 pt-6 sm:gap-5 md:pt-8">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] bg-accent text-lg font-bold text-dark shadow-xl sm:h-[4.5rem] sm:w-[4.5rem] sm:rounded-[1.4rem] sm:text-xl">
                    {getInitials(testimonials[currentIndex].name)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="mb-1 text-xl font-bold leading-tight text-white sm:text-2xl">{testimonials[currentIndex].name}</h4>
                    <p className="font-mono text-[10px] uppercase leading-relaxed text-accent sm:text-xs">{testimonials[currentIndex].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="relative z-30 flex items-center gap-4 sm:gap-6 md:absolute md:bottom-0 md:left-1/2 md:-translate-x-1/2">
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                whileTap={{ scale: 0.9 }}
                onClick={prevTestimonial}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 text-white transition-colors"
                aria-label="Previous review"
              >
                <ChevronLeft size={20} />
              </motion.button>

              <div className="flex max-w-[48vw] flex-wrap justify-center gap-2 sm:max-w-none">
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
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 text-white transition-colors"
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
            <button
              type="submit"
              disabled={submitting}
              className="mt-5 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-accent px-6 py-4 font-bold text-dark transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Posting..." : "Post Review"}
              <Send size={18} />
            </button>
            {feedback ? (
              <p className={`mt-4 text-sm leading-6 ${feedback.type === "error" ? "text-red-300" : "text-accent"}`}>
                {feedback.message}
              </p>
            ) : (
              <p className="mt-4 text-sm leading-6 text-white/45">Your review appears instantly on this page for preview.</p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
