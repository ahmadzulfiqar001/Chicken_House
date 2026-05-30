import { motion } from "motion/react";
import { Star, ArrowRight, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const SpecialtiesSection = () => {
  const specialties = [
    {
      id: "CH-001",
      name: "Chicken Karahi",
      type: "Traditional",
      description: "Slow-cooked in a traditional iron wok with fresh tomatoes and our secret spice blend.",
      price: "1,450",
      image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
      tag: "Chef's Special",
      specs: { heat: "Medium", time: "25m", serves: "2-3" }
    },
    {
      id: "CH-002",
      name: "BBQ Platter",
      type: "Signature",
      description: "A grand assortment of Seekh Kabab, Malai Boti, and Chicken Tikka, served with fresh mint chutney.",
      price: "2,800",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      tag: "Best Seller",
      specs: { heat: "Mild", time: "35m", serves: "4-5" }
    },
    {
      id: "CH-003",
      name: "Chicken Pulao",
      type: "Premium",
      description: "Fragrant Basmati rice cooked with succulent chicken pieces and aromatic spices.",
      price: "950",
      image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80",
      tag: "Must Try",
      specs: { heat: "Mild", time: "20m", serves: "1-2" }
    }
  ];

  return (
    <section className="py-32 bg-dark text-white overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12 border-b border-white/10 pb-12">
          <div className="max-w-3xl">
            <span className="text-accent font-mono text-xs uppercase tracking-[0.5em] mb-8 block">The Catalog</span>
            <h2 className="text-7xl md:text-9xl font-anton uppercase leading-[0.8] tracking-tighter mb-12">
              Signature <br />
              <span className="text-stroke text-accent">Specialties</span>
            </h2>
            <p className="text-white/40 text-xl font-light max-w-xl">
              Each dish is a technical achievement in flavor engineering. 
              Meticulously crafted, rigorously tested, and served with absolute precision.
            </p>
          </div>
          <Link to="/menu">
            <motion.button 
              whileHover={{ scale: 1.05, x: 10 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-6 rounded-full bg-white text-dark font-bold text-xl flex items-center gap-4 hover:bg-accent transition-all"
            >
              Full Inventory
              <ArrowRight size={24} />
            </motion.button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[1px] bg-white/10 border border-white/10 perspective-1000">
          {specialties.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              className="bg-dark p-12 group hover:bg-white transition-all duration-700 preserve-3d hover:rotate-y-10 hover:shadow-2xl"
            >
              <div className="flex justify-between items-start mb-12">
                <span className="font-mono text-xs text-white/40 group-hover:text-dark/40 uppercase tracking-widest">
                  {item.id} // {item.type}
                </span>
                <motion.div 
                  whileHover={{ rotate: 45 }}
                  className="w-12 h-12 rounded-full border border-white/10 group-hover:border-dark/10 flex items-center justify-center"
                >
                  <ChevronRight size={20} className="group-hover:text-dark" />
                </motion.div>
              </div>

              <div className="relative aspect-square mb-12 overflow-hidden rounded-3xl group-hover:shadow-xl transition-all duration-700">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6 px-4 py-2 bg-accent text-dark font-bold text-[10px] uppercase tracking-widest z-10">
                  {item.tag}
                </div>
                
                {/* Quick View Overlay */}
                <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="px-6 py-3 bg-white text-dark font-bold rounded-full text-sm uppercase tracking-widest"
                  >
                    Quick View
                  </motion.button>
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-5xl font-anton uppercase leading-none group-hover:text-dark transition-colors">
                  {item.name}
                </h3>
                
                <p className="text-white/40 group-hover:text-dark/60 text-lg font-light leading-relaxed">
                  {item.description}
                </p>

                <div className="grid grid-cols-3 gap-4 border-t border-white/10 group-hover:border-dark/10 pt-8">
                  {Object.entries(item.specs).map(([key, value]) => (
                    <div key={key}>
                      <span className="block font-mono text-[10px] text-white/20 group-hover:text-dark/20 uppercase tracking-widest mb-1">
                        {key}
                      </span>
                      <span className="block font-bold group-hover:text-dark">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-end pt-8">
                  <div className="flex items-center gap-2 group-hover:text-dark">
                    <Star size={16} fill="currentColor" className="text-accent" />
                    <span className="font-bold">4.9</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-mono text-[10px] text-white/20 group-hover:text-dark/20 uppercase tracking-widest mb-1">
                      Price (PKR)
                    </span>
                    <span className="text-3xl font-anton text-accent group-hover:text-primary transition-colors">
                      {item.price}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialtiesSection;
