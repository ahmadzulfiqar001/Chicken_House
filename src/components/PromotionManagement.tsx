import { motion } from "motion/react";
import { Megaphone, Plus, Search, Filter, Edit2, Trash2, Eye, TrendingUp, Calendar, CheckCircle, XCircle } from "lucide-react";

const PromotionManagement = () => {
  const campaigns = [
    { id: "CP-001", name: "Eid Special Offer", type: "Discount", status: "Active", reach: "12k", conversion: "8.5%", end: "Mar 30" },
    { id: "CP-002", name: "Weekend BOGO", type: "Buy 1 Get 1", status: "Active", reach: "5k", conversion: "12%", end: "Mar 25" },
    { id: "CP-003", name: "New Branch Launch", type: "Event", status: "Scheduled", reach: "0", conversion: "0%", end: "Apr 15" },
    { id: "CP-004", name: "Winter Deal", type: "Bundle", status: "Expired", reach: "25k", conversion: "15%", end: "Feb 28" },
  ];

  return (
    <div className="space-y-8">
      {/* Promotion Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Megaphone size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Active Campaigns</p>
          <p className="text-2xl font-display font-bold text-dark">5 Active</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
            <TrendingUp size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Total Reach</p>
          <p className="text-2xl font-display font-bold text-dark">42k Users</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
            <CheckCircle size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Avg. Conversion</p>
          <p className="text-2xl font-display font-bold text-dark">10.2%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
            <Calendar size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Upcoming</p>
          <p className="text-2xl font-display font-bold text-dark">3 Planned</p>
        </motion.div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <h2 className="text-2xl font-bold text-dark">Marketing Campaigns</h2>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                placeholder="Search campaigns..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
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
                <th className="pb-6 text-muted text-xs font-bold uppercase tracking-widest">Campaign Name</th>
                <th className="pb-6 text-muted text-xs font-bold uppercase tracking-widest">Type</th>
                <th className="pb-6 text-muted text-xs font-bold uppercase tracking-widest">Status</th>
                <th className="pb-6 text-muted text-xs font-bold uppercase tracking-widest">Reach</th>
                <th className="pb-6 text-muted text-xs font-bold uppercase tracking-widest">Ends On</th>
                <th className="pb-6 text-muted text-xs font-bold uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {campaigns.map((cp, index) => (
                <tr key={index} className="group hover:bg-surface transition-colors">
                  <td className="py-6">
                    <span className="text-dark font-bold block">{cp.name}</span>
                    <span className="text-muted text-xs">{cp.id}</span>
                  </td>
                  <td className="py-6">
                    <span className="px-3 py-1 rounded-full bg-surface-strong text-dark text-xs font-bold">
                      {cp.type}
                    </span>
                  </td>
                  <td className="py-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      cp.status === "Active" ? "bg-green-500/10 text-green-500" :
                      cp.status === "Scheduled" ? "bg-blue-500/10 text-blue-500" :
                      "bg-surface-strong text-muted"
                    }`}>
                      {cp.status}
                    </span>
                  </td>
                  <td className="py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-dark font-bold text-sm">{cp.reach}</span>
                      <span className="text-muted text-[10px] font-bold uppercase tracking-widest">{cp.conversion} Conv.</span>
                    </div>
                  </td>
                  <td className="py-6 text-muted text-sm font-bold">{cp.end}</td>
                  <td className="py-6">
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg bg-surface-strong text-dark hover:bg-primary hover:text-white transition-all">
                        <Edit2 size={18} />
                      </button>
                      <button className="p-2 rounded-lg bg-surface-strong text-dark hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={18} />
                      </button>
                      <button className="p-2 rounded-lg bg-surface-strong text-dark hover:bg-primary hover:text-white transition-all">
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PromotionManagement;
