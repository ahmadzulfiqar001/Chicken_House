import { motion } from "motion/react";
import { Star, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BestSellersSection = () => {
  const navigate = useNavigate();
  const bestSellers = [
    {
      id: "BS-001",
      name: "Zinger Burger",
      price: "Rs. 450",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
      reviews: 1240
    },
    {
      id: "BS-002",
      name: "Chicken Wings (12pc)",
      price: "Rs. 850",
      image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80",
      rating: 4.9,
      reviews: 850
    },
    {
      id: "BS-003",
      name: "Peri Peri Chicken",
      price: "Rs. 1,200",
      image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80",
      rating: 4.7,
      reviews: 450
    },
    {
      id: "BS-004",
      name: "Chicken Tikka",
      price: "Rs. 350",
      image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
      rating: 4.9,
      reviews: 2100
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <span className="text-primary font-bold uppercase tracking-widest text-sm mb-4 block">Best Sellers</span>
            <h2 className="text-4xl font-display font-bold text-dark mb-6">
              Our Most <span className="text-primary">Popular</span> Items.
            </h2>
            <p className="text-muted text-lg">
              The dishes that our customers can't get enough of. Freshly prepared and delivered with love.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {bestSellers.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-surface p-4 rounded-[2.5rem] group hover:bg-white hover:shadow-2xl transition-all duration-500"
            >
              <div className="relative rounded-[2rem] overflow-hidden mb-6 aspect-square shadow-lg">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate("/menu")}
                  aria-label={`Order ${item.name} from the menu`}
                  className="absolute bottom-4 right-4 w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
                >
                  <Plus size={24} />
                </motion.button>
              </div>
              
              <div className="px-2">
                <div className="flex items-center gap-1 text-accent mb-2">
                  <Star size={14} fill="currentColor" />
                  <span className="text-dark font-bold text-sm">{item.rating}</span>
                  <span className="text-muted text-xs font-medium">({item.reviews})</span>
                </div>
                <h3 className="text-xl font-bold text-dark mb-2 group-hover:text-primary transition-colors">{item.name}</h3>
                <p className="text-primary font-bold text-lg">{item.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellersSection;
