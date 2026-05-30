import { useState } from "react";
import { motion } from "motion/react";
import { ShoppingCart, Package, Truck, CreditCard, Search, Filter, Download, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";

const EcommerceModule = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const onlineOrders = [
    { id: "ORD-E001", customer: "Ahmed Raza", items: 3, total: "Rs. 2,450", status: "Processing", payment: "EasyPaisa", time: "10 mins ago" },
    { id: "ORD-E002", customer: "Sana Malik", items: 1, total: "Rs. 550", status: "Shipped", payment: "COD", time: "25 mins ago" },
    { id: "ORD-E003", customer: "Zubair Khan", items: 5, total: "Rs. 4,800", status: "Delivered", payment: "Bank Transfer", time: "1 hour ago" },
    { id: "ORD-E004", customer: "Farhan Ali", items: 2, total: "Rs. 1,200", status: "Cancelled", payment: "JazzCash", time: "2 hours ago" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-dark">E-commerce Management</h2>
          <p className="text-muted">Manage online orders, shipping, and delivery.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-white text-dark rounded-xl font-bold flex items-center gap-2 shadow-sm border border-gray-100">
            <Download size={20} />
            Export Orders
          </button>
          <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20">
            <Plus size={20} />
            Add Manual Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <ShoppingCart size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-muted uppercase tracking-widest">Total Orders</p>
              <h3 className="text-2xl font-bold text-dark">1,240</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-500 text-sm font-bold">
            <ArrowUpRight size={16} />
            <span>+12% vs last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-muted uppercase tracking-widest">Revenue</p>
              <h3 className="text-2xl font-bold text-dark">Rs. 850k</h3>
            </div>
          </div>
          <p className="text-muted text-xs">Online sales only</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-500 flex items-center justify-center">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-muted uppercase tracking-widest">Pending</p>
              <h3 className="text-2xl font-bold text-dark">45</h3>
            </div>
          </div>
          <p className="text-muted text-xs">Awaiting processing</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center">
              <Truck size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-muted uppercase tracking-widest">In Transit</p>
              <h3 className="text-2xl font-bold text-dark">12</h3>
            </div>
          </div>
          <p className="text-muted text-xs">Out for delivery</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search online orders..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-3 rounded-xl bg-surface text-dark font-bold flex items-center gap-2 hover:bg-surface-strong transition-all">
              <Filter size={18} />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface text-muted text-xs font-bold uppercase tracking-widest">
                <th className="px-8 py-4">Order ID</th>
                <th className="px-8 py-4">Customer</th>
                <th className="px-8 py-4">Items</th>
                <th className="px-8 py-4">Total</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Payment</th>
                <th className="px-8 py-4">Time</th>
                <th className="px-8 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {onlineOrders.map((order) => (
                <tr key={order.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-8 py-6 font-mono text-sm">{order.id}</td>
                  <td className="px-8 py-6 font-bold text-dark">{order.customer}</td>
                  <td className="px-8 py-6 text-sm text-muted">{order.items} items</td>
                  <td className="px-8 py-6 font-bold text-primary">{order.total}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      order.status === 'Delivered' ? 'bg-green-50 text-green-500' : 
                      order.status === 'Processing' ? 'bg-blue-50 text-blue-500' : 
                      order.status === 'Shipped' ? 'bg-yellow-50 text-yellow-500' : 'bg-red-50 text-red-500'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm text-muted">{order.payment}</td>
                  <td className="px-8 py-6 text-sm text-muted">{order.time}</td>
                  <td className="px-8 py-6">
                    <button className="text-primary font-bold hover:underline">Track Order</button>
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

export default EcommerceModule;
