import { motion } from "motion/react";
import { Users, Utensils, Award, Clock } from "lucide-react";

const stats = [
  {
    icon: <Users size={32} />,
    value: "50k+",
    label: "Happy Customers",
    color: "text-primary"
  },
  {
    icon: <Utensils size={32} />,
    value: "120+",
    label: "Menu Items",
    color: "text-accent"
  },
  {
    icon: <Award size={32} />,
    value: "15+",
    label: "Years Experience",
    color: "text-blue-500"
  },
  {
    icon: <Clock size={32} />,
    value: "24/7",
    label: "Service Available",
    color: "text-orange-500"
  }
];

const StatsSection = () => {
  return (
    <section className="py-24 bg-dark relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full atmosphere opacity-20" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              className="text-center group"
            >
              <div className={`w-20 h-20 mx-auto rounded-3xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-white/10 transition-all duration-500 ${stat.color}`}>
                {stat.icon}
              </div>
              <h3 className="text-4xl md:text-5xl font-anton text-white mb-2 tracking-tight">
                {stat.value}
              </h3>
              <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.2em]">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
