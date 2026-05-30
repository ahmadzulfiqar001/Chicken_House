import { motion } from "motion/react";
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Wallet, ArrowUpRight, ArrowDownRight, Search, Filter, Download } from "lucide-react";

const FinanceOverview = () => {
  const transactions = [
    { id: "TX-001", type: "Order", amount: "+ Rs. 2,450", status: "Completed", time: "5 mins ago", method: "Digital Wallet" },
    { id: "TX-002", type: "Inventory", amount: "- Rs. 15,000", status: "Pending", time: "1 hour ago", method: "Bank Transfer" },
    { id: "TX-003", type: "Salary", amount: "- Rs. 45,000", status: "Completed", time: "2 hours ago", method: "Cash" },
    { id: "TX-004", type: "Order", amount: "+ Rs. 1,250", status: "Completed", time: "5 hours ago", method: "Credit Card" },
  ];

  return (
    <div className="space-y-8">
      {/* Finance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark p-8 rounded-[2.5rem] text-white relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mb-6 border border-primary/30">
              <DollarSign size={24} />
            </div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</p>
            <p className="text-3xl font-display font-bold mb-4">Rs. 1.2M</p>
            <div className="flex items-center gap-2 text-green-500 text-xs font-bold">
              <ArrowUpRight size={16} />
              +12.5% from last month
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-6">
            <TrendingDown size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Total Expenses</p>
          <p className="text-3xl font-display font-bold text-dark mb-4">Rs. 450k</p>
          <div className="flex items-center gap-2 text-red-500 text-xs font-bold">
            <ArrowDownRight size={16} />
            +5% from last month
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-6">
            <TrendingUp size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Net Profit</p>
          <p className="text-3xl font-display font-bold text-dark mb-4">Rs. 750k</p>
          <div className="flex items-center gap-2 text-green-500 text-xs font-bold">
            <ArrowUpRight size={16} />
            +18% from last month
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
            <Wallet size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Reserve Fund</p>
          <p className="text-3xl font-display font-bold text-dark mb-4">Rs. 2.5M</p>
          <div className="flex items-center gap-2 text-blue-500 text-xs font-bold">
            <CheckCircle size={16} className="text-green-500" />
            Healthy Reserve
          </div>
        </motion.div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <h2 className="text-2xl font-bold text-dark">Recent Transactions</h2>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
            <button className="p-3 rounded-xl bg-surface text-dark hover:bg-primary hover:text-white transition-all">
              <Download size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-6 text-muted text-xs font-bold uppercase tracking-widest">Transaction ID</th>
                <th className="pb-6 text-muted text-xs font-bold uppercase tracking-widest">Type</th>
                <th className="pb-6 text-muted text-xs font-bold uppercase tracking-widest">Amount</th>
                <th className="pb-6 text-muted text-xs font-bold uppercase tracking-widest">Method</th>
                <th className="pb-6 text-muted text-xs font-bold uppercase tracking-widest">Status</th>
                <th className="pb-6 text-muted text-xs font-bold uppercase tracking-widest">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((tx, index) => (
                <tr key={index} className="group hover:bg-surface transition-colors">
                  <td className="py-6 font-mono text-xs text-muted">{tx.id}</td>
                  <td className="py-6 font-bold text-dark">{tx.type}</td>
                  <td className={`py-6 font-bold ${tx.amount.startsWith('+') ? "text-green-500" : "text-red-500"}`}>
                    {tx.amount}
                  </td>
                  <td className="py-6">
                    <div className="flex items-center gap-2 text-muted text-sm">
                      <CreditCard size={14} />
                      {tx.method}
                    </div>
                  </td>
                  <td className="py-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      tx.status === "Completed" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-6 text-muted text-sm">{tx.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CheckCircle = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default FinanceOverview;
