import { motion } from "motion/react";
import { ShieldCheck, Leaf, Zap, Clock } from "lucide-react";

const USPSection = () => {
  const usps = [
    {
      icon: <ShieldCheck className="text-primary" size={32} />,
      title: "100% Halal & Fresh",
      description: "We source our chicken daily from certified local farms to ensure maximum freshness and quality."
    },
    {
      icon: <Leaf className="text-green-500" size={32} />,
      title: "Farm to Plate",
      description: "Our commitment to organic sourcing means you get the most natural taste in every bite."
    },
    {
      icon: <Zap className="text-accent" size={32} />,
      title: "Secret Spice Blend",
      description: "Our signature taste comes from a unique blend of 24 hand-picked spices, aged to perfection."
    },
    {
      icon: <Clock className="text-blue-500" size={32} />,
      title: "Lightning Fast Delivery",
      description: "We guarantee delivery within 30 minutes in Renala Khurd, or your next meal is on us."
    }
  ];

  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-primary font-bold uppercase tracking-widest text-sm mb-4 block">Why Choose Us</span>
          <h2 className="text-4xl font-display font-bold text-dark">The Chicken House <span className="text-primary">Difference</span></h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {usps.map((usp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-[2rem] shadow-xl shadow-dark/5 border border-gray-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-surface-strong flex items-center justify-center mb-6">
                {usp.icon}
              </div>
              <h3 className="text-xl font-bold text-dark mb-4">{usp.title}</h3>
              <p className="text-muted text-sm leading-relaxed">
                {usp.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default USPSection;
