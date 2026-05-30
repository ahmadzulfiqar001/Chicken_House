import { motion } from "motion/react";
import { BarChart3, TrendingUp, TrendingDown, Users, ShoppingBag, Star, ArrowUpRight, ArrowDownRight, Search, Filter, Download, PieChart, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const AnalyticsOverview = () => {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<any[]>([]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Mock data for sales performance
      const mockSales = [
        { name: "Jan", sales: 2400000 },
        { name: "Feb", sales: 2800000 },
        { name: "Mar", sales: 3200000 },
        { name: "Apr", sales: 3000000 },
        { name: "May", sales: 3800000 },
        { name: "Jun", sales: 4200000 },
      ];
      setSalesData(mockSales);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const topItems = [
    { name: "Classic Zinger", sales: 1240, revenue: "Rs. 558k", growth: "+15%" },
    { name: "Family Bucket", sales: 850, revenue: "Rs. 2.1M", growth: "+22%" },
    { name: "Hot Wings", sales: 2100, revenue: "Rs. 1.3M", growth: "+8%" },
    { name: "Peri Peri Chicken", sales: 450, revenue: "Rs. 562k", growth: "+12%" },
  ];

  return (
    <div className="space-y-8">
      {/* Analytics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <BarChart3 size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Total Sales</p>
          <p className="text-2xl font-display font-bold text-dark">Rs. 4.2M</p>
          <div className="flex items-center gap-1 text-green-500 text-[10px] font-bold mt-2">
            <ArrowUpRight size={14} />
            +15% vs last month
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">New Customers</p>
          <p className="text-2xl font-display font-bold text-dark">1,240</p>
          <div className="flex items-center gap-1 text-green-500 text-[10px] font-bold mt-2">
            <ArrowUpRight size={14} />
            +8% vs last month
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center mb-4">
            <Star size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Avg. Rating</p>
          <p className="text-2xl font-display font-bold text-dark">4.8 / 5.0</p>
          <div className="flex items-center gap-1 text-green-500 text-[10px] font-bold mt-2">
            <ArrowUpRight size={14} />
            +0.2 from last month
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
            <ShoppingBag size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Avg. Order Value</p>
          <p className="text-2xl font-display font-bold text-dark">Rs. 1,450</p>
          <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold mt-2">
            <ArrowDownRight size={14} />
            -2% vs last month
          </div>
        </motion.div>
      </div>

      {/* Charts & Top Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-bold text-dark">Sales Performance</h3>
            <div className="flex gap-4">
              <button 
                onClick={fetchAnalytics}
                className="p-2 rounded-xl bg-surface-strong text-dark hover:bg-primary hover:text-white transition-all"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              </button>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded-lg bg-surface text-xs font-bold text-muted hover:bg-primary hover:text-white transition-all">Weekly</button>
                <button className="px-3 py-1 rounded-lg bg-primary text-xs font-bold text-white shadow-sm">Monthly</button>
              </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSalesOverview" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F27D26" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F27D26" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#8E9299", fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#8E9299", fontSize: 12 }}
                  tickFormatter={(value) => `Rs.${value/1000000}M`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: "16px", 
                    border: "none", 
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    padding: "12px"
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#F27D26" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSalesOverview)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Items */}
        <div className="bg-dark rounded-[3rem] p-10 text-white">
          <h3 className="text-xl font-bold mb-10">Top Selling Items</h3>
          <div className="space-y-8">
            {topItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <span className="font-bold block">{item.name}</span>
                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{item.sales} Sales</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold block">{item.revenue}</span>
                  <span className="text-green-500 text-[10px] font-bold">{item.growth}</span>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-12 py-4 rounded-2xl bg-white/10 text-white font-bold text-sm hover:bg-primary transition-all">
            View Full Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;
