import { motion } from "motion/react";
import { Truck, Clock, ShieldCheck, MapPin, Users, Heart } from "lucide-react";

const features = [
  {
    id: 1,
    title: "Fast Delivery",
    description: "Our 5-rider fleet ensures your food reaches you hot and fresh within minutes.",
    icon: <Truck size={32} />,
    color: "bg-primary/10 text-primary",
  },
  {
    id: 2,
    title: "Real-time Tracking",
    description: "Track your order lifecycle from pending to cooking to out for delivery.",
    icon: <Clock size={32} />,
    color: "bg-accent/10 text-accent",
  },
  {
    id: 3,
    title: "Quality Guaranteed",
    description: "We use only the freshest ingredients and maintain strict hygiene standards.",
    icon: <ShieldCheck size={32} />,
    color: "bg-green-500/10 text-green-500",
  },
  {
    id: 4,
    title: "Mitchell’s Landmark",
    description: "Located conveniently near Mitchell’s Fair Price Shop in Renala Khurd.",
    icon: <MapPin size={32} />,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    id: 5,
    title: "Family Friendly",
    description: "Spacious indoor and outdoor seating for over 280 guests.",
    icon: <Users size={32} />,
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    id: 6,
    title: "Made with Love",
    description: "Every dish is prepared with passion to give you an unforgettable taste.",
    icon: <Heart size={32} />,
    color: "bg-red-500/10 text-red-500",
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block"
          >
            Why Choose Us
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold text-dark mb-6"
          >
            The <span className="text-primary italic">Chicken House</span> Experience
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted max-w-2xl mx-auto text-lg"
          >
            We combine traditional flavors with modern technology to provide you with a seamless and premium dining experience.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group p-8 rounded-3xl bg-surface hover:bg-white hover:shadow-2xl hover:shadow-dark/5 transition-all duration-500 border border-transparent hover:border-surface-strong"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-dark mb-4 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted leading-relaxed group-hover:text-dark transition-colors">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
