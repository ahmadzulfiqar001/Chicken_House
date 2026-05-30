import { motion } from "motion/react";
import { Package, AlertTriangle, RefreshCw, Search, Filter, Plus, ChevronRight, BarChart3 } from "lucide-react";

const InventoryModule = () => {
  const inventory = [
    { id: "INV-001", name: "Chicken (Whole)", stock: 45.5, unit: "kg", threshold: 15, status: "Healthy" },
    { id: "INV-002", name: "Basmati Rice", stock: 120, unit: "kg", threshold: 50, status: "Healthy" },
    { id: "INV-003", name: "Cooking Oil", stock: 12, unit: "L", threshold: 20, status: "Low Stock" },
    { id: "INV-004", name: "Spices Mix (CH)", stock: 5, unit: "kg", threshold: 10, status: "Critical" },
    { id: "INV-005", name: "Potatoes", stock: 85, unit: "kg", threshold: 30, status: "Healthy" },
  ];

  return (
    <div className="space-y-8">
      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Package size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Total Items</p>
          <p className="text-2xl font-display font-bold text-dark">124 SKU</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center mb-4">
            <AlertTriangle size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Low Stock</p>
          <p className="text-2xl font-display font-bold text-dark">8 Items</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
            <AlertTriangle size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Critical</p>
          <p className="text-2xl font-display font-bold text-dark">3 Items</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
            <RefreshCw size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Turnover Rate</p>
          <p className="text-2xl font-display font-bold text-dark">4.2x / mo</p>
        </motion.div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <h2 className="text-2xl font-bold text-dark">Stock Management</h2>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                placeholder="Search inventory..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
            <button className="p-3 rounded-xl bg-surface text-dark hover:bg-primary hover:text-white transition-all">
              <Filter size={20} />
            </button>
            <button className="px-6 py-3 rounded-xl bg-primary text-white font-bold flex items-center gap-2 hover:bg-primary-strong transition-all shadow-lg shadow-primary/20">
              <Plus size={20} />
              Add Stock
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">SKU</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Item Name</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Current Stock</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Threshold</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Status</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {inventory.map((item, index) => (
                <tr key={index} className="group hover:bg-surface transition-colors">
                  <td className="py-6 font-mono text-xs text-muted">{item.id}</td>
                  <td className="py-6 font-bold text-dark">{item.name}</td>
                  <td className="py-6">
                    <div className="flex items-center gap-2">
                      <span className="text-dark font-bold">{item.stock}</span>
                      <span className="text-muted text-xs uppercase">{item.unit}</span>
                    </div>
                  </td>
                  <td className="py-6 text-muted font-medium">{item.threshold} {item.unit}</td>
                  <td className="py-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === "Healthy" ? "bg-green-500/10 text-green-500" :
                      item.status === "Low Stock" ? "bg-yellow-500/10 text-yellow-500" :
                      "bg-red-500/10 text-red-500"
                    }`}>
                      {item.status}
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

      {/* AI Insights */}
      <div className="bg-dark rounded-[3rem] p-10 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
            <BarChart3 size={40} className="text-primary" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">AI Demand Forecasting</h3>
            <p className="text-white/60 max-w-2xl">
              Based on historical data and upcoming events in Renala Khurd, we predict a <span className="text-primary font-bold">25% increase</span> in Chicken demand for the next weekend. We recommend increasing stock levels by Thursday.
            </p>
          </div>
          <button className="px-8 py-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary-strong transition-all shadow-xl shadow-primary/20">
            View Analysis
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
      </div>
    </div>
  );
};

export default InventoryModule;
