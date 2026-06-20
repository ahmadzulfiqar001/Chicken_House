import { motion } from "motion/react";
import { Star } from "lucide-react";

const chefOne = new URL("../../../assets/source-images/Cafe Images/chef 1.png", import.meta.url).href;
const chefTwo = new URL("../../../assets/source-images/Cafe Images/chef 2.png", import.meta.url).href;
const chefThree = new URL("../../../assets/source-images/Cafe Images/chef 3.png", import.meta.url).href;

const chefs = [
  {
    image: chefOne,
    description: "Focused live-kitchen preparation with clean handling and careful service.",
    badge: "Live Kitchen"
  },
  {
    image: chefTwo,
    description: "Fresh ingredients are prepared daily for reliable taste and quality.",
    badge: "Fresh Prep"
  },
  {
    image: chefThree,
    description: "Fresh ingredients are prepared daily with care and packed with love.",
    badge: "Grill Craft"
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
                  alt={chef.description} 
                  className="w-full h-full object-cover transition-all duration-1000 md:grayscale md:group-hover:scale-110 md:group-hover:grayscale-0"
                />

                {/* Experience Badge */}
                <div className="absolute top-6 left-6 px-4 py-2 bg-accent text-dark font-bold text-[10px] uppercase tracking-widest rounded-full shadow-lg">
                  {chef.badge}
                </div>
              </div>

              {/* Info */}
              <div className="text-center">
                <div className="flex items-start justify-center gap-2 text-accent">
                  <Star size={14} fill="currentColor" />
                  <span className="max-w-xs text-dark font-bold text-base leading-7">{chef.description}</span>
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
