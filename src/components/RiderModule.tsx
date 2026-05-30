import { motion } from "motion/react";
import { Bike, MapPin, Clock, CheckCircle, XCircle, ChevronRight, Search, Filter, Phone } from "lucide-react";

const RiderModule = () => {
  const riders = [
    { id: "RD-001", name: "Bilal Ahmed", status: "On Delivery", location: "Renala Khurd", orders: 12, rating: 4.8 },
    { id: "RD-002", name: "Usman Ghani", status: "Available", location: "Okara City", orders: 8, rating: 4.5 },
    { id: "RD-003", name: "Ali Raza", status: "Offline", location: "Sahiwal Bypass", orders: 15, rating: 4.9 },
    { id: "RD-004", name: "Sara Ahmed", status: "On Delivery", location: "Lahore Model Town", orders: 22, rating: 4.7 },
  ];

  return (
    <div className="space-y-8">
      {/* Rider Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Bike size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Total Riders</p>
          <p className="text-2xl font-display font-bold text-dark">24 Riders</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
            <CheckCircle size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Active Now</p>
          <p className="text-2xl font-display font-bold text-dark">18 Active</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center mb-4">
            <Clock size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Avg. Delivery</p>
          <p className="text-2xl font-display font-bold text-dark">28 Mins</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
            <MapPin size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Total Distance</p>
          <p className="text-2xl font-display font-bold text-dark">1,240 km</p>
        </motion.div>
      </div>

      {/* Riders Table */}
      <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <h2 className="text-2xl font-bold text-dark">Rider Management</h2>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                placeholder="Search riders..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
            <button className="p-3 rounded-xl bg-surface text-dark hover:bg-primary hover:text-white transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Rider</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Location</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Orders</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Rating</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Status</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {riders.map((rider, index) => (
                <tr key={index} className="group hover:bg-surface transition-colors">
                  <td className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface-strong flex items-center justify-center text-dark font-bold">
                        {rider.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <span className="text-dark font-bold block">{rider.name}</span>
                        <span className="text-muted text-xs">{rider.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 font-medium text-dark">{rider.location}</td>
                  <td className="py-6 font-bold text-dark">{rider.orders}</td>
                  <td className="py-6 font-bold text-primary">{rider.rating} / 5.0</td>
                  <td className="py-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      rider.status === "Available" ? "bg-green-500/10 text-green-500" :
                      rider.status === "On Delivery" ? "bg-blue-500/10 text-blue-500" :
                      "bg-surface-strong text-muted"
                    }`}>
                      {rider.status}
                    </span>
                  </td>
                  <td className="py-6">
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg bg-surface-strong text-dark hover:bg-primary hover:text-white transition-all">
                        <Phone size={18} />
                      </button>
                      <button className="p-2 rounded-lg bg-surface-strong text-dark hover:bg-primary hover:text-white transition-all">
                        <ChevronRight size={18} />
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

export default RiderModule;
