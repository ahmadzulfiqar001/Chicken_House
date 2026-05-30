import { motion } from "motion/react";
import { Utensils, Plus, ChevronRight, Search, Filter, Edit2, Trash2, Eye } from "lucide-react";

const MenuModule = () => {
  const menuItems = [
    { id: "MN-001", name: "Chicken Karahi", category: "Main Course", price: 2400, status: "Available", popularity: "High" },
    { id: "MN-002", name: "Seekh Kabab", category: "BBQ", price: 800, status: "Available", popularity: "Medium" },
    { id: "MN-003", name: "Chicken Pulao", category: "Rice", price: 850, status: "Out of Stock", popularity: "Medium" },
    { id: "MN-004", name: "Garlic Naan", category: "Tandoor", price: 80, status: "Available", popularity: "Very High" },
    { id: "MN-005", name: "Mint Raita", category: "Sides", price: 120, status: "Available", popularity: "Low" },
  ];

  return (
    <div className="space-y-8">
      {/* Menu Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Utensils size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Total Items</p>
          <p className="text-2xl font-display font-bold text-dark">85 Dishes</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
            <Plus size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">New This Month</p>
          <p className="text-2xl font-display font-bold text-dark">12 Items</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center mb-4">
            <Filter size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Categories</p>
          <p className="text-2xl font-display font-bold text-dark">8 Groups</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
            <Eye size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Menu Views</p>
          <p className="text-2xl font-display font-bold text-dark">12.4k</p>
        </motion.div>
      </div>

      {/* Menu Table */}
      <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <h2 className="text-2xl font-bold text-dark">Menu Management</h2>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                placeholder="Search menu..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
            <button className="px-6 py-3 rounded-xl bg-primary text-white font-bold flex items-center gap-2 hover:bg-primary-strong transition-all shadow-lg shadow-primary/20">
              <Plus size={20} />
              Add Item
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Dish</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Category</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Price</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Popularity</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Status</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {menuItems.map((item, index) => (
                <tr key={index} className="group hover:bg-surface transition-colors">
                  <td className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-surface-strong overflow-hidden">
                        <img src={`https://picsum.photos/seed/${item.name}/100/100`} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <span className="text-dark font-bold block">{item.name}</span>
                        <span className="text-muted text-xs">{item.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 font-medium text-dark">{item.category}</td>
                  <td className="py-6 font-bold text-primary">Rs. {item.price}</td>
                  <td className="py-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.popularity === "Very High" ? "bg-purple-500/10 text-purple-500" :
                      item.popularity === "High" ? "bg-blue-500/10 text-blue-500" :
                      "bg-surface-strong text-muted"
                    }`}>
                      {item.popularity}
                    </span>
                  </td>
                  <td className="py-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === "Available" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-6">
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg bg-surface-strong text-dark hover:bg-primary hover:text-white transition-all">
                        <Edit2 size={18} />
                      </button>
                      <button className="p-2 rounded-lg bg-surface-strong text-dark hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={18} />
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

export default MenuModule;
