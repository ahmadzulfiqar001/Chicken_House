import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Star, ShoppingCart } from "lucide-react";
import { siteConfig } from "../../lib/site";

const chickenKarahiImage = new URL("../../../assets/source-images/Continental/Chicken Makhni Karahi.jpg", import.meta.url).href;
const bbqPlatterImage = new URL("../../../assets/source-images/bbq platter/Bar-B-Q Platter.jpg", import.meta.url).href;
const bbqPizzaImage = new URL("../../../assets/source-images/pizza/Bar-B-Q Pizza.jpg", import.meta.url).href;
const friesImage = new URL("../../../assets/source-images/Fries/fries.png", import.meta.url).href;

type PreviewDish = {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: string;
  category: string;
  recommended?: boolean;
  startingPrice: number;
};

const fallbackPreview: PreviewDish[] = [
  {
    id: "preview-1",
    name: "Chicken Karahi",
    price: 1200,
    rating: 4.9,
    image: chickenKarahiImage,
    category: "Desi (Pakistani)",
    recommended: true,
    startingPrice: 600,
  },
  {
    id: "preview-2",
    name: "Mixed BBQ Platter",
    price: 1000,
    rating: 4.8,
    image: bbqPlatterImage,
    category: "BBQ",
    recommended: true,
    startingPrice: 700,
  },
  {
    id: "preview-3",
    name: "BBQ Chicken Pizza",
    price: 900,
    rating: 4.8,
    image: bbqPizzaImage,
    category: "Pizza",
    recommended: true,
    startingPrice: 600,
  },
  {
    id: "preview-4",
    name: "Golden Fries",
    price: 250,
    rating: 4.9,
    image: friesImage,
    category: "Fries",
    recommended: true,
    startingPrice: 250,
  },
];

const MenuPreview = () => {
  const [dishes, setDishes] = useState<PreviewDish[]>(fallbackPreview);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const response = await fetch("/api/menu");
        if (!response.ok) return;

        const data = (await response.json()) as PreviewDish[];
        const recommended = data
          .filter((item) => item.recommended)
          .slice(0, 4)
          .map((item) => ({
            ...item,
            price: item.startingPrice,
          }));

        if (recommended.length) {
          setDishes(recommended);
        }
      } catch (error) {
        console.error(error);
      }
    };

    void fetchPreview();
  }, []);

  return (
    <section className="relative overflow-hidden bg-surface py-24">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 flex flex-col items-end justify-between gap-8 md:flex-row">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="mb-4 block text-sm font-bold uppercase tracking-widest text-primary">
              Our Signature Selection
            </span>
            <h2 className="text-4xl font-display font-bold leading-tight text-dark md:text-6xl">
              Taste the <span className="text-primary italic">Excellence</span>
            </h2>
          </motion.div>

          <Link to="/menu">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full border-2 border-primary px-8 py-4 font-bold text-primary transition-all duration-300 hover:bg-primary hover:text-white"
            >
              Explore Full Menu
            </motion.button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {dishes.map((dish, index) => (
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className="group overflow-hidden rounded-3xl bg-white shadow-xl shadow-dark/5"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={dish.image}
                  alt={dish.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  onError={(event) => {
                    event.currentTarget.src = siteConfig.imageFallback;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="absolute bottom-4 left-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-dark shadow-lg backdrop-blur-sm">
                  <Star size={14} fill="#d8a82f" className="text-accent" />
                  {dish.rating}
                </div>
              </div>

              <div className="p-6">
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-primary">
                  {dish.category}
                </span>
                <h3 className="mb-4 text-xl font-bold text-dark transition-colors group-hover:text-primary">
                  {dish.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-display font-bold text-dark">
                    Rs. {dish.price}
                  </span>
                  <Link
                    to="/menu"
                    className="rounded-2xl bg-surface-strong p-3 text-dark transition-colors hover:bg-primary hover:text-white"
                  >
                    <ShoppingCart size={20} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-96 w-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-accent/5 blur-3xl" />
    </section>
  );
};

export default MenuPreview;
