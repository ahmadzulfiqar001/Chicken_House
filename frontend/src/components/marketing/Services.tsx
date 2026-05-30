import { motion } from "motion/react";
import { Utensils, Truck, Calendar, ShoppingBag, Clock, ShieldCheck } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: <Utensils size={32} />,
      title: "Fine Dine-in",
      description: "Experience luxury dining with our premium ambiance and world-class service.",
      color: "bg-orange-50 text-orange-600"
    },
    {
      icon: <Truck size={32} />,
      title: "Fast Delivery",
      description: "Hot and fresh food delivered to your doorstep within 45 minutes guaranteed.",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: <Calendar size={32} />,
      title: "Event Catering",
      description: "From weddings to corporate events, we provide full-service catering solutions.",
      color: "bg-purple-50 text-purple-600"
    },
    {
      icon: <ShoppingBag size={32} />,
      title: "Takeaway",
      description: "Quick and convenient pickup options for your busy lifestyle.",
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      icon: <Clock size={32} />,
      title: "24/7 Support",
      description: "Our customer service team is always here to help with your orders and queries.",
      color: "bg-pink-50 text-pink-600"
    },
    {
      icon: <ShieldCheck size={32} />,
      title: "Quality Assured",
      description: "We follow strict hygiene protocols and use only the freshest ingredients.",
      color: "bg-amber-50 text-amber-600"
    }
  ];

  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-primary font-bold uppercase tracking-widest text-sm mb-4 block">Our Services</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-dark mb-6">
            Beyond Just <span className="text-accent italic">Great Food</span>
          </h2>
          <p className="text-muted text-lg">
            We provide a comprehensive range of services to ensure your culinary journey with us is seamless and memorable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-dark/5 border border-gray-50 group transition-all duration-300"
            >
              <div className={`w-16 h-16 rounded-2xl ${service.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold text-dark mb-4">{service.title}</h3>
              <p className="text-muted leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
