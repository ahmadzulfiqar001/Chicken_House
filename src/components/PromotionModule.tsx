import { motion } from "motion/react";
import { Megaphone, Image as ImageIcon, Send, Plus, ChevronRight, Search, Filter, Calendar, TrendingUp } from "lucide-react";

const PromotionModule = () => {
  const promotions = [
    { id: "PR-001", name: "Ramadan Family Deal", status: "Active", reach: "12.5k", conversion: "8.2%", type: "Social Media" },
    { id: "PR-002", name: "Weekend Karahi Special", status: "Scheduled", reach: "0", conversion: "0%", type: "WhatsApp" },
    { id: "PR-003", name: "New Branch Launch", status: "Active", reach: "45.2k", conversion: "12.5%", type: "Multi-Channel" },
    { id: "PR-004", name: "Student Discount", status: "Draft", reach: "0", conversion: "0%", type: "In-Store" },
  ];

  return (
    <div className="space-y-8">
      {/* Promotion Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[3rem] shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
            <Megaphone size={28} />
          </div>
          <h3 className="text-muted text-sm font-bold uppercase tracking-widest mb-1">Active Campaigns</h3>
          <p className="text-3xl font-display font-bold text-dark">12 Active</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-[3rem] shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
            <TrendingUp size={28} />
          </div>
          <h3 className="text-muted text-sm font-bold uppercase tracking-widest mb-1">Total Reach</h3>
          <p className="text-3xl font-display font-bold text-dark">125.4k</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-[3rem] shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-14 h-14 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-6">
            <Send size={28} />
          </div>
          <h3 className="text-muted text-sm font-bold uppercase tracking-widest mb-1">Avg. Conversion</h3>
          <p className="text-3xl font-display font-bold text-dark">9.8%</p>
        </motion.div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <h2 className="text-2xl font-bold text-dark">Marketing Campaigns</h2>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <button className="px-6 py-3 rounded-xl bg-primary text-white font-bold flex items-center gap-2 hover:bg-primary-strong transition-all shadow-lg shadow-primary/20">
              <Plus size={20} />
              New Campaign
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Campaign</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Type</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Reach</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Conversion</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Status</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {promotions.map((promo, index) => (
                <tr key={index} className="group hover:bg-surface transition-colors">
                  <td className="py-6">
                    <span className="text-dark font-bold block">{promo.name}</span>
                    <span className="text-muted text-xs">{promo.id}</span>
                  </td>
                  <td className="py-6 font-medium text-dark">{promo.type}</td>
                  <td className="py-6 font-bold text-dark">{promo.reach}</td>
                  <td className="py-6 font-bold text-primary">{promo.conversion}</td>
                  <td className="py-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      promo.status === "Active" ? "bg-green-500/10 text-green-500" :
                      promo.status === "Scheduled" ? "bg-blue-500/10 text-blue-500" :
                      "bg-surface-strong text-muted"
                    }`}>
                      {promo.status}
                    </span>
                  </td>
                  <td className="py-6">
                    <button className="p-2 rounded-lg bg-surface-strong text-dark hover:bg-primary hover:text-white transition-all">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Media Library Preview */}
      <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-dark">Media Library</h2>
          <button className="text-primary font-bold text-sm hover:underline">View All Assets</button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="aspect-square rounded-2xl bg-surface relative overflow-hidden group cursor-pointer"
            >
              <img 
                src={`https://picsum.photos/seed/promo${i}/400/400`} 
                alt="Promotion Asset" 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-dark/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ImageIcon size={24} className="text-white" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionModule;
