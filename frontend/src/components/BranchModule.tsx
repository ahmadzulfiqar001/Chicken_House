import { motion } from "motion/react";
import { MapPin, TrendingUp, Users, ShoppingBag, ChevronRight, Plus, Search, Filter } from "lucide-react";

const BranchModule = () => {
  const branches = [
    { id: "BR-001", name: "Renala Khurd (Main)", manager: "Zainab Bibi", revenue: "Rs. 1.2M", orders: 450, staff: 18, status: "Open" },
    { id: "BR-002", name: "Okara City", manager: "Ali Raza", revenue: "Rs. 850k", orders: 320, staff: 12, status: "Open" },
    { id: "BR-003", name: "Sahiwal Bypass", manager: "Usman Khan", revenue: "Rs. 620k", orders: 210, staff: 8, status: "Closed" },
    { id: "BR-004", name: "Lahore Model Town", manager: "Sara Ahmed", revenue: "Rs. 2.1M", orders: 890, staff: 25, status: "Open" },
  ];

  return (
    <div className="space-y-8">
      {/* Branch Overview */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-bold text-dark mb-2">Multi-Branch Management</h2>
          <p className="text-muted">Monitor and manage performance across all Chicken House locations.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="Search branches..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            />
          </div>
          <button className="px-6 py-3 rounded-xl bg-primary text-white font-bold flex items-center gap-2 hover:bg-primary-strong transition-all shadow-lg shadow-primary/20">
            <Plus size={20} />
            New Branch
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
            className="bg-white rounded-[3rem] p-8 shadow-xl shadow-dark/5 border border-gray-50 group hover:border-primary/20 transition-all"
          >
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <MapPin size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark">{branch.name}</h3>
                  <span className={`text-xs font-bold uppercase tracking-widest ${branch.status === "Open" ? "text-green-500" : "text-red-500"}`}>
                    {branch.status}
                  </span>
                </div>
              </div>
              <button className="p-3 rounded-xl bg-surface-strong text-dark group-hover:bg-primary group-hover:text-white transition-all">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-surface">
                <span className="text-muted text-[10px] font-bold uppercase tracking-widest block mb-1">Revenue</span>
                <div className="flex items-center gap-1 text-dark font-bold">
                  <TrendingUp size={14} className="text-green-500" />
                  {branch.revenue}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-surface">
                <span className="text-muted text-[10px] font-bold uppercase tracking-widest block mb-1">Orders</span>
                <div className="flex items-center gap-1 text-dark font-bold">
                  <ShoppingBag size={14} className="text-primary" />
                  {branch.orders}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-surface">
                <span className="text-muted text-[10px] font-bold uppercase tracking-widest block mb-1">Staff</span>
                <div className="flex items-center gap-1 text-dark font-bold">
                  <Users size={14} className="text-blue-500" />
                  {branch.staff}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-strong flex items-center justify-center text-[10px] font-bold text-dark">
                  {branch.manager.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="text-sm font-medium text-muted">Manager: <span className="text-dark font-bold">{branch.manager}</span></span>
              </div>
              <button className="text-xs font-bold text-primary hover:underline">View Analytics</button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BranchModule;
