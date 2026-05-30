import { motion } from "motion/react";
import { ShoppingBag, Clock, CheckCircle, XCircle, ChevronRight, Search, Filter, MapPin, Phone } from "lucide-react";

const OrdersModule = () => {
  const orders = [
    { id: "CH-12345", customer: "Ali Raza", items: "Chicken Karahi, Naan", total: 2560, status: "Preparing", time: "5 mins ago", type: "Delivery" },
    { id: "CH-12346", customer: "Sara Ahmed", items: "Seekh Kabab, Raita", total: 1200, status: "Ready", time: "12 mins ago", type: "Dine-in" },
    { id: "CH-12347", customer: "Usman Khan", items: "Chicken Pulao, Coke", total: 850, status: "Delivered", time: "45 mins ago", type: "Delivery" },
    { id: "CH-12348", customer: "Zainab Bibi", items: "Family Platter", total: 5200, status: "Cancelled", time: "1 hour ago", type: "Takeaway" },
  ];

  return (
    <div className="space-y-8">
      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <ShoppingBag size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Total Orders</p>
          <p className="text-2xl font-display font-bold text-dark">156 Today</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center mb-4">
            <Clock size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Pending</p>
          <p className="text-2xl font-display font-bold text-dark">12 Orders</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
            <CheckCircle size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Completed</p>
          <p className="text-2xl font-display font-bold text-dark">140 Orders</p>
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
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Avg. Delivery</p>
          <p className="text-2xl font-display font-bold text-dark">28 Mins</p>
        </motion.div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <h2 className="text-2xl font-bold text-dark">Live Orders</h2>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                placeholder="Search orders..."
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
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Order ID</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Customer</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Items</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Total</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Status</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order, index) => (
                <tr key={index} className="group hover:bg-surface transition-colors">
                  <td className="py-6">
                    <span className="text-dark font-bold block">{order.id}</span>
                    <span className="text-muted text-xs">{order.time}</span>
                  </td>
                  <td className="py-6">
                    <div className="flex items-center gap-2">
                      <span className="text-dark font-medium">{order.customer}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        order.type === "Delivery" ? "bg-blue-500/10 text-blue-500" :
                        order.type === "Dine-in" ? "bg-purple-500/10 text-purple-500" :
                        "bg-orange-500/10 text-orange-500"
                      }`}>
                        {order.type}
                      </span>
                    </div>
                  </td>
                  <td className="py-6 text-muted text-sm max-w-xs truncate">{order.items}</td>
                  <td className="py-6 font-bold text-dark">Rs. {order.total}</td>
                  <td className="py-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === "Preparing" ? "bg-yellow-500/10 text-yellow-500" :
                      order.status === "Ready" ? "bg-blue-500/10 text-blue-500" :
                      order.status === "Delivered" ? "bg-green-500/10 text-green-500" :
                      "bg-red-500/10 text-red-500"
                    }`}>
                      {order.status}
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

export default OrdersModule;
