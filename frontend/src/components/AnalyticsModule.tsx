import { motion } from "motion/react";
import { BarChart3, TrendingUp, Users, ShoppingBag, PieChart, Calendar, ChevronRight, Download, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart as RePieChart, Pie, Cell } from "recharts";
import axios from "axios";

const AnalyticsModule = () => {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<any[]>([]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // For now, we'll derive some analytics from orders or use mock data if needed
      // Let's create a mock sales trend for the chart
      const mockSales = [
        { name: "Mon", sales: 45000 },
        { name: "Tue", sales: 52000 },
        { name: "Wed", sales: 48000 },
        { name: "Thu", sales: 61000 },
        { name: "Fri", sales: 75000 },
        { name: "Sat", sales: 92000 },
        { name: "Sun", sales: 88000 },
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

  const COLORS = ["#F27D26", "#141414", "#E4E3E0", "#8E9299"];

  return (
    <div className="space-y-8">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <TrendingUp size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Growth Rate</p>
          <p className="text-2xl font-display font-bold text-dark">+24.5%</p>
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
            <ShoppingBag size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Avg. Order Value</p>
          <p className="text-2xl font-display font-bold text-dark">Rs. 1,850</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
            <PieChart size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Retention Rate</p>
          <p className="text-2xl font-display font-bold text-dark">68.2%</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold text-dark">Sales Performance</h2>
            <div className="flex gap-4">
              <button 
                onClick={fetchAnalytics}
                className="p-2 rounded-xl bg-surface-strong text-dark hover:bg-primary hover:text-white transition-all"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              </button>
              <button className="p-2 rounded-xl bg-surface-strong text-dark hover:bg-primary hover:text-white transition-all">
                <Download size={18} />
              </button>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
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
                  tickFormatter={(value) => `Rs.${value/1000}k`}
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
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Items */}
        <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
          <h2 className="text-2xl font-bold text-dark mb-8">Top Selling Items</h2>
          <div className="space-y-6">
            {[
              { name: "Chicken Karahi", sales: 450, growth: "+12%" },
              { name: "Seekh Kabab", sales: 380, growth: "+8%" },
              { name: "Chicken Pulao", sales: 310, growth: "+15%" },
              { name: "Naan (Garlic)", sales: 890, growth: "+22%" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-surface group hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white text-primary flex items-center justify-center font-bold shadow-sm">
                    {index + 1}
                  </div>
                  <div>
                    <span className="text-dark font-bold block">{item.name}</span>
                    <span className="text-muted text-xs">{item.sales} orders this week</span>
                  </div>
                </div>
                <span className="text-green-500 font-bold text-sm">{item.growth}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Sentiment Analysis */}
      <div className="bg-primary rounded-[3rem] p-10 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border border-white/30 shrink-0 backdrop-blur-md">
            <Users size={40} className="text-white" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">AI Sentiment Analysis</h3>
            <p className="text-white/80 max-w-2xl">
              Customer feedback across social media and reviews is <span className="text-accent font-bold">92% Positive</span>. Key highlights: "Excellent Karahi taste" and "Fast delivery in Okara branch".
            </p>
          </div>
          <button className="px-8 py-4 rounded-2xl bg-white text-primary font-bold hover:bg-accent hover:text-dark transition-all shadow-xl shadow-white/10">
            View Feedback
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px]" />
      </div>
    </div>
  );
};

export default AnalyticsModule;
