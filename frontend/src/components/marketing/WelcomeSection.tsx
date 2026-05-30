import { motion } from "motion/react";

const WelcomeSection = () => {
  return (
    <section className="py-32 bg-white overflow-hidden relative">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
            className="relative"
          >
            <div className="absolute -top-20 -left-20 text-[20vw] font-anton text-surface-strong/50 -z-10 select-none">
              1998
            </div>
            <span className="text-primary font-mono text-xs uppercase tracking-[0.5em] mb-8 block">Our Legacy</span>
            <h2 className="text-6xl md:text-8xl font-display font-bold text-dark mb-12 leading-[0.9] tracking-tighter">
              A Tradition of <br />
              <span className="text-primary italic">Excellence</span>.
            </h2>
            <div className="space-y-8 max-w-xl">
              <p className="text-muted text-xl leading-relaxed font-light">
                For over a decade, Chicken House has been the heart of culinary delight in Renala Khurd. 
                We blend traditional recipes with modern techniques to bring you the most succulent chicken 
                and authentic BBQ in the region.
              </p>
              <p className="text-muted text-lg leading-relaxed font-light italic border-l-4 border-primary pl-8">
                "Our commitment to quality and hygiene is what sets us apart. We don't just serve food; we serve memories."
              </p>
            </div>
            
            <div className="mt-16 flex gap-12">
              <div className="flex flex-col">
                <span className="text-5xl font-anton text-dark">12+</span>
                <span className="text-muted font-mono text-[10px] uppercase tracking-widest mt-2">Years of Legacy</span>
              </div>
              <div className="flex flex-col">
                <span className="text-5xl font-anton text-dark">50k+</span>
                <span className="text-muted font-mono text-[10px] uppercase tracking-widest mt-2">Happy Customers</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 1.1, rotate: 5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
            className="relative flex items-center justify-center p-12"
          >
            {/* Main Large Image */}
            <div className="relative z-10 w-full max-w-[500px] aspect-[3/4] rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] group">
              <img 
                src="https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=1200&q=80" 
                alt="Chicken House Interior" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/40 to-transparent" />
              
              {/* Play Video Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-24 h-24 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-primary shadow-2xl"
                >
                  <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-primary border-b-[12px] border-b-transparent ml-2" />
                </motion.button>
              </div>
            </div>

            {/* Overlapping Smaller Image */}
            <motion.div
              initial={{ opacity: 0, x: 50, y: 50 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute -bottom-12 -right-12 w-72 h-72 rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl z-20 hidden md:block"
            >
              <img 
                src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80" 
                alt="Chicken House Food" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            
            {/* Floating Badge */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-12 -left-12 w-48 h-48 bg-accent rounded-full flex items-center justify-center shadow-2xl z-20"
            >
              <div className="text-center">
                <span className="text-dark font-anton text-4xl block">#1</span>
                <span className="text-dark/60 font-mono text-[10px] uppercase tracking-widest">In Renala</span>
              </div>
            </motion.div>

            {/* Experience Badge */}
            <div className="absolute top-1/2 -right-24 -translate-y-1/2 rotate-90 hidden xl:block">
              <span className="text-dark/10 font-anton text-9xl uppercase tracking-tighter whitespace-nowrap">
                Authentic Taste
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
