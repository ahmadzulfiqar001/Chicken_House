import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";

type RecommendationItem = {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  image: string;
  rating: number;
  startingPrice: number;
  stockStatus: string;
  available: boolean;
  recommended?: boolean;
};

const RecommendationsSection = () => {
  const [items, setItems] = useState<RecommendationItem[]>([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch("/api/menu");
        const data = await response.json();

        if (!response.ok) return;

        const recommendedItems = data
          .filter((item: RecommendationItem) => item.recommended)
          .slice(0, 4);

        setItems(recommendedItems);
      } catch (error) {
        console.error("Failed to load recommendations", error);
      }
    };

    fetchRecommendations();
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-14">
          <div>
            <span className="text-primary font-bold uppercase tracking-widest text-sm mb-4 block">
              Recommendations
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-dark">
              Home Page <span className="text-accent italic">Recommendations</span>
            </h2>
          </div>

          <Link
            to="/menu"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-white font-bold hover:bg-primary-strong transition-colors shadow-xl shadow-primary/20"
          >
            Open Full Menu
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="bg-surface rounded-[2.5rem] overflow-hidden shadow-xl shadow-dark/5 border border-gray-50"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-5 left-5 px-3 py-2 rounded-full bg-white text-dark text-[10px] font-bold uppercase tracking-widest shadow-lg">
                  {item.stockStatus}
                </div>
              </div>

              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-muted mb-2">
                  {item.category} / {item.subcategory}
                </p>
                <h3 className="text-2xl font-bold text-dark mb-4">{item.name}</h3>

                <div className="flex items-center justify-between mb-5">
                  <span className="inline-flex items-center gap-2 text-dark font-bold">
                    <Star size={16} fill="#d8a82f" className="text-accent" />
                    {item.rating.toFixed(1)}
                  </span>
                  <span className="text-primary font-display font-bold text-2xl">
                    Rs. {item.startingPrice}
                  </span>
                </div>

                <Link
                  to="/menu"
                  className={`w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-colors ${
                    item.available
                      ? "bg-white text-dark hover:bg-primary hover:text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  View in Menu
                  <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendationsSection;
