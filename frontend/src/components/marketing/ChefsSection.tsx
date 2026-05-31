import { motion } from "motion/react";
import { Instagram, Facebook, Twitter, Star } from "lucide-react";

const chefs = [
  {
    name: "Chef Imran Qureshi",
    role: "Executive Chef",
    image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=600&q=80",
    specialty: "BBQ & Grill Specialist",
    experience: "15 Years"
  },
  {
    name: "Chef Salman Raza",
    role: "Head Karahi Chef",
    image: "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?auto=format&fit=crop&w=600&q=80",
    specialty: "Karahi Expert",
    experience: "12 Years"
  },
  {
    name: "Chef Naveed Akram",
    role: "Sous Chef",
    image: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=600&q=80",
    specialty: "Desi Meals & Platters",
    experience: "8 Years"
  }
];

const ChefsSection = () => {
  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24">
          <span className="text-primary font-mono text-xs uppercase tracking-[0.5em] mb-8 block">Our Team</span>
          <h2 className="text-6xl md:text-8xl font-display font-bold text-dark mb-6 tracking-tighter">
            Meet Our <span className="text-primary">Culinary</span> Masters.
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto font-light">
            Behind every great dish is a team of passionate experts dedicated to the art of cooking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {chefs.map((chef, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              className="group relative"
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl mb-8">
                <img 
                  src={chef.image} 
                  alt={chef.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale group-hover:grayscale-0"
                  referrerPolicy="no-referrer"
                />
                
                {/* Social Overlay */}
                <div className="absolute inset-0 bg-dark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4">
                  {[Instagram, Facebook, Twitter].map((Icon, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.2, backgroundColor: "#FF6B6B" }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors"
                    >
                      <Icon size={20} />
                    </motion.button>
                  ))}
                </div>

                {/* Experience Badge */}
                <div className="absolute top-6 left-6 px-4 py-2 bg-accent text-dark font-bold text-[10px] uppercase tracking-widest rounded-full shadow-lg">
                  {chef.experience} Exp.
                </div>
              </div>

              {/* Info */}
              <div className="text-center">
                <h3 className="text-3xl font-display font-bold text-dark mb-2 group-hover:text-primary transition-colors">
                  {chef.name}
                </h3>
                <p className="text-muted font-mono text-xs uppercase tracking-widest mb-4">
                  {chef.role}
                </p>
                <div className="flex items-center justify-center gap-2 text-accent">
                  <Star size={14} fill="currentColor" />
                  <span className="text-dark font-bold text-sm">{chef.specialty}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ChefsSection;
