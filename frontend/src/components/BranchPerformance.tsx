import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Users, DollarSign, Star, MapPin, ChevronRight, Search, Filter } from "lucide-react";

const BranchPerformance = () => {
  const branches = [
    { name: "Okara Main", revenue: "Rs. 450k", growth: "+12%", customers: "1,240", rating: 4.8, status: "Top Performing" },
    { name: "Sahiwal Bypass", revenue: "Rs. 320k", growth: "+5%", customers: "850", rating: 4.5, status: "Stable" },
    { name: "Renala Khurd", revenue: "Rs. 180k", growth: "-2%", customers: "420", rating: 4.2, status: "Needs Attention" },
    { name: "Lahore Model Town", revenue: "Rs. 850k", growth: "+25%", customers: "2,400", rating: 4.9, status: "New & Growing" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold text-dark mb-2">Branch Performance</h2>
          <p className="text-muted">Detailed analytics for all Chicken House locations.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            Compare Branches
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {branches.map((branch, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50 group hover:border-primary/20 transition-all"
          >
            <div className="flex justify-between items-start mb-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center text-primary">
                  <MapPin size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-dark">{branch.name}</h3>
                  <span className={`text-xs font-bold uppercase tracking-widest ${
                    branch.status === "Top Performing" ? "text-green-500" :
                    branch.status === "Needs Attention" ? "text-red-500" :
                    "text-blue-500"
                  }`}>{branch.status}</span>
                </div>
              </div>
              <div className={`flex items-center gap-1 text-sm font-bold ${
                branch.growth.startsWith('+') ? "text-green-500" : "text-red-500"
              }`}>
                {branch.growth.startsWith('+') ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {branch.growth}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-10">
              <div className="p-4 rounded-2xl bg-surface">
                <p className="text-muted text-[10px] font-bold uppercase tracking-widest mb-1">Revenue</p>
                <p className="text-lg font-bold text-dark">{branch.revenue}</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface">
                <p className="text-muted text-[10px] font-bold uppercase tracking-widest mb-1">Customers</p>
                <p className="text-lg font-bold text-dark">{branch.customers}</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface">
                <p className="text-muted text-[10px] font-bold uppercase tracking-widest mb-1">Rating</p>
                <p className="text-lg font-bold text-primary flex items-center gap-1">
                  <Star size={16} fill="currentColor" />
                  {branch.rating}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-50">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-surface-strong flex items-center justify-center text-[10px] font-bold">
                    S{i}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                  +12
                </div>
              </div>
              <button className="text-primary font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                View Detailed Report
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BranchPerformance;
