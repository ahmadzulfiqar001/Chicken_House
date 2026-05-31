import { motion } from "motion/react";
import { BarChart3, Users, ShoppingBag, Star, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const formatCurrency = (value) => {
  const amount = Number(value ?? 0);
  if (amount >= 1000000) return `Rs. ${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `Rs. ${(amount / 1000).toFixed(0)}k`;
  return `Rs. ${Math.round(amount)}`;
};

const AnalyticsOverview = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [dailySeries, setDailySeries] = useState([]);
  const [monthlySeries, setMonthlySeries] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [chartWindow, setChartWindow] = useState("monthly");

  const computeTopItems = (orders) => {
    const counts: Record<string, any> = {};
    orders.forEach((order) => {
      const details = Array.isArray(order?.details) ? order.details : [];
      if (details.length > 0) {
        details.forEach((detail) => {
          const name = String(detail?.name ?? "").trim();
          if (!name) return;
          const quantity = Number(detail?.quantity ?? 1) || 1;
          const price = Number(detail?.price ?? 0);
          if (!counts[name]) counts[name] = { name, sales: 0, revenue: 0 };
          counts[name].sales += quantity;
          counts[name].revenue += price * quantity;
        });
      } else if (typeof order?.items === "string" && order.items.trim()) {
        // Fall back to parsing the items summary string e.g. "2x Classic Zinger (Large), 1x Hot Wings"
        order.items.split(",").forEach((chunk) => {
          const text = chunk.trim();
          if (!text) return;
          const match = text.match(/^(\d+)\s*x\s*(.+)$/i);
          const quantity = match ? Number(match[1]) || 1 : 1;
          const name = (match ? match[2] : text).replace(/\s*\(.*?\)\s*/g, "").trim();
          if (!name) return;
          if (!counts[name]) counts[name] = { name, sales: 0, revenue: 0 };
          counts[name].sales += quantity;
        });
      }
    });

    return Object.values(counts)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [financeRes, ordersRes] = await Promise.all([
        fetch("/api/finance/summary"),
        fetch("/api/orders"),
      ]);

      const financeData = await financeRes.json();
      const ordersData = await ordersRes.json();

      if (financeRes.ok && financeData) {
        setOverview(financeData.overview ?? null);
        setDailySeries(Array.isArray(financeData.dailySeries) ? financeData.dailySeries : []);
        setMonthlySeries(Array.isArray(financeData.monthlySeries) ? financeData.monthlySeries : []);
      }

      if (ordersRes.ok && Array.isArray(ordersData)) {
        setTopItems(computeTopItems(ordersData));
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAnalytics();
  }, []);

  // Map finance series ({label, sales}) into the shape the chart expects ({name, sales}).
  const activeSeries = chartWindow === "weekly" ? dailySeries : monthlySeries;
  const chartData = activeSeries.map((point) => ({
    name: point.label,
    sales: Number(point.sales ?? 0),
  }));

  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(overview?.totalRevenue),
      icon: BarChart3,
      iconClass: "bg-primary/10 text-primary",
    },
    {
      label: "Net Profit",
      value: formatCurrency(overview?.netProfit),
      icon: Users,
      iconClass: "bg-blue-500/10 text-blue-500",
      negative: Number(overview?.netProfit ?? 0) < 0,
    },
    {
      label: "Profit Margin",
      value: `${Number(overview?.profitMargin ?? 0)}%`,
      icon: Star,
      iconClass: "bg-yellow-500/10 text-yellow-500",
      negative: Number(overview?.profitMargin ?? 0) < 0,
    },
    {
      label: "This Month Sales",
      value: formatCurrency(overview?.monthSales),
      icon: ShoppingBag,
      iconClass: "bg-purple-500/10 text-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Analytics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
            >
              <div className={`w-12 h-12 rounded-2xl ${stat.iconClass} flex items-center justify-center mb-4`}>
                <Icon size={24} />
              </div>
              <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-display font-bold text-dark">{loading ? "—" : stat.value}</p>
              <div className={`flex items-center gap-1 text-[10px] font-bold mt-2 ${stat.negative ? "text-red-500" : "text-green-500"}`}>
                {stat.negative ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                {stat.negative ? "Below target" : "On track"}
              </div>
            </motion.div>
          );
        })}
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
                <button
                  onClick={() => setChartWindow("weekly")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    chartWindow === "weekly"
                      ? "bg-primary text-white shadow-sm"
                      : "bg-surface text-muted hover:bg-primary hover:text-white"
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setChartWindow("monthly")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    chartWindow === "monthly"
                      ? "bg-primary text-white shadow-sm"
                      : "bg-surface text-muted hover:bg-primary hover:text-white"
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
          </div>

          <div className="h-[350px] w-full">
            {!loading && chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted text-sm font-bold">
                No sales data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
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
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
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
            )}
          </div>
        </div>

        {/* Top Items */}
        <div className="bg-dark rounded-[3rem] p-10 text-white">
          <h3 className="text-xl font-bold mb-10">Top Selling Items</h3>
          {!loading && topItems.length === 0 ? (
            <div className="text-white/40 text-sm font-bold">No sales yet</div>
          ) : (
            <div className="space-y-8">
              {topItems.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <span className="font-bold block">{item.name}</span>
                      <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{item.sales} Sold</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold block">{item.revenue > 0 ? formatCurrency(item.revenue) : "—"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;
