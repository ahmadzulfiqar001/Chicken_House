import { motion } from "motion/react";
import { DollarSign, TrendingUp, TrendingDown, PieChart, ArrowUpRight, ArrowDownRight, Wallet, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import axios from "axios";

const FinanceModule = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/finance");
      setTransactions(res.data);
    } catch (error) {
      console.error("Error fetching finance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const chartData = [
    { name: "Mon", revenue: 45000, expense: 32000 },
    { name: "Tue", revenue: 52000, expense: 38000 },
    { name: "Wed", revenue: 48000, expense: 35000 },
    { name: "Thu", revenue: 61000, expense: 42000 },
    { name: "Fri", revenue: 55000, expense: 40000 },
    { name: "Sat", revenue: 75000, expense: 55000 },
    { name: "Sun", revenue: 82000, expense: 60000 },
  ];

  const pieData = [
    { name: "Inventory", value: 45, color: "#FF6321" },
    { name: "Salaries", value: 30, color: "#141414" },
    { name: "Utilities", value: 15, color: "#F27D26" },
    { name: "Marketing", value: 10, color: "#E4E3E0" },
  ];

  return (
    <div className="space-y-8">
      {/* Finance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[3rem] shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center">
              <TrendingUp size={28} />
            </div>
            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full">+15.4%</span>
          </div>
          <h3 className="text-muted text-sm font-bold uppercase tracking-widest mb-1">Total Revenue</h3>
          <p className="text-3xl font-display font-bold text-dark">Rs. 2,450,000</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-[3rem] shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <TrendingDown size={28} />
            </div>
            <span className="text-xs font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-full">-2.1%</span>
          </div>
          <h3 className="text-muted text-sm font-bold uppercase tracking-widest mb-1">Total Expenses</h3>
          <p className="text-3xl font-display font-bold text-dark">Rs. 850,000</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-primary p-8 rounded-[3rem] shadow-xl shadow-primary/20 text-white relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center backdrop-blur-md">
                <Wallet size={28} />
              </div>
              <span className="text-xs font-bold text-white bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">10% Reserve</span>
            </div>
            <h3 className="text-white/60 text-sm font-bold uppercase tracking-widest mb-1">Utility Reserve Fund</h3>
            <p className="text-3xl font-display font-bold text-white">Rs. 245,000</p>
          </div>
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
          <h2 className="text-2xl font-bold text-dark mb-8">Revenue vs Expenses</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6321" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#FF6321" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9e9e9e'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9e9e9e'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#FF6321" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                <Area type="monotone" dataKey="expense" stroke="#141414" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
          <h2 className="text-2xl font-bold text-dark mb-8">Expense Breakdown</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pieData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#141414', fontWeight: 'bold'}} width={100} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={30}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ledger Table */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold text-dark">Digital Ledger</h2>
            <div className="flex gap-4">
              <button 
                onClick={fetchData}
                className="w-10 h-10 rounded-xl bg-surface-strong flex items-center justify-center text-dark hover:bg-primary hover:text-white transition-all"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              </button>
              <button className="px-4 py-2 rounded-xl bg-surface-strong text-dark text-sm font-bold hover:bg-primary hover:text-white transition-all">Daily</button>
              <button className="px-4 py-2 rounded-xl bg-surface-strong text-dark text-sm font-bold hover:bg-primary hover:text-white transition-all">Monthly</button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">ID</th>
                  <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Source/Reason</th>
                  <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Amount</th>
                  <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Category</th>
                  <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map((tx, index) => (
                  <tr key={index} className="group hover:bg-surface transition-colors">
                    <td className="py-6 font-bold text-dark">{tx.id}</td>
                    <td className="py-6">
                      <span className="text-dark font-medium block">{tx.source}</span>
                      <span className="text-muted text-xs">{new Date(tx.date).toLocaleString()}</span>
                    </td>
                    <td className="py-6">
                      <div className="flex items-center gap-2">
                        {tx.type === "Credit" ? (
                          <ArrowUpRight size={16} className="text-green-500" />
                        ) : (
                          <ArrowDownRight size={16} className="text-red-500" />
                        )}
                        <span className={`font-bold ${tx.type === "Credit" ? "text-green-500" : "text-red-500"}`}>
                          Rs. {tx.amount}
                        </span>
                      </div>
                    </td>
                    <td className="py-6">
                      <span className="text-muted font-medium">{tx.category}</span>
                    </td>
                    <td className="py-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${tx.type === "Credit" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                        {tx.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* P&L Summary */}
        <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
          <h2 className="text-2xl font-bold text-dark mb-8">P&L Summary</h2>
          <div className="space-y-8">
            <div className="flex items-center justify-between p-6 rounded-3xl bg-green-500/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-500 text-white flex items-center justify-center">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <span className="text-muted text-xs font-bold uppercase tracking-widest block">Net Profit</span>
                  <span className="text-2xl font-display font-bold text-dark">Rs. 1.6M</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-muted font-medium">Rent & Utilities</span>
                <span className="text-dark font-bold">Rs. 120,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted font-medium">Staff Salaries</span>
                <span className="text-dark font-bold">Rs. 450,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted font-medium">Inventory Cost</span>
                <span className="text-dark font-bold">Rs. 280,000</span>
              </div>
              <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xl font-bold text-dark">Total P&L</span>
                <span className="text-2xl font-display font-bold text-green-500">+ Rs. 750,000</span>
              </div>
            </div>

            <button className="w-full py-4 rounded-2xl bg-dark text-white font-bold hover:bg-primary transition-colors flex items-center justify-center gap-2">
              <PieChart size={20} />
              Detailed Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceModule;
