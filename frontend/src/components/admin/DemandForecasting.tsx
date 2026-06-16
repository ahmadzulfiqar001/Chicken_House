import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { BarChart3, TrendingUp, TrendingDown, Calendar, Info, CheckCircle2, RefreshCw } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useRealtime } from "../../lib/realtime";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(Number.isFinite(value) ? value : 0);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const weekdayShort = (date: Date) =>
  new Intl.DateTimeFormat("en-PK", { weekday: "short" }).format(date);

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const DemandForecasting = () => {
  const [dailySeries, setDailySeries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [metric, setMetric] = useState("revenue"); // "revenue" | "orders"
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  const fetchData = async (preserveState = true) => {
    if (!preserveState) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError("");

    try {
      const [summaryResponse, ordersResponse] = await Promise.all([
        fetch("/api/finance/summary"),
        fetch("/api/orders"),
      ]);

      const [summaryData, ordersData] = await Promise.all([
        summaryResponse.json(),
        ordersResponse.json(),
      ]);

      if (!summaryResponse.ok) {
        throw new Error(summaryData.message ?? "Forecast data could not be loaded.");
      }
      if (!ordersResponse.ok) {
        throw new Error(ordersData.message ?? "Orders could not be loaded.");
      }

      setDailySeries(Array.isArray(summaryData.dailySeries) ? summaryData.dailySeries : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setUpdatedAt(new Date());
    } catch (fetchError) {
      console.error(fetchError);
      setError("Forecast data could not be loaded.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchData(false);
  }, []);

  useRealtime("orders", () => void fetchData());

  // Build a last-7-day window aligned to the same buckets the finance summary uses.
  const last7Days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return { date, label: weekdayShort(date) };
    });
  }, []);

  // Per-day order counts derived from the real orders list (excluding cancelled).
  const orderCountsByDay = useMemo(
    () =>
      last7Days.map(({ date, label }) => {
        const count = orders.filter((order) => {
          if (!order?.time) {
            return false;
          }
          const status = String(order.status ?? "").toLowerCase();
          if (status === "cancelled" || status === "rejected") {
            return false;
          }
          const orderDate = new Date(order.time);
          return !Number.isNaN(orderDate.getTime()) && isSameDay(orderDate, date);
        }).length;
        return { label, value: count };
      }),
    [orders, last7Days],
  );

  // The chart/insight series for the currently selected metric.
  const chartData = useMemo(() => {
    if (metric === "orders") {
      return orderCountsByDay.map((entry) => ({ label: entry.label, value: entry.value }));
    }
    return dailySeries.map((entry) => ({ label: entry.label, value: Number(entry.sales ?? 0) }));
  }, [metric, orderCountsByDay, dailySeries]);

  const isRevenue = metric === "revenue";
  const metricLabel = isRevenue ? "Revenue" : "Orders";
  const formatValue = (value: number) => (isRevenue ? formatCurrency(value) : formatNumber(value));

  // --- Real (simple, clearly-labeled) forecast derived from the last 7 days ---
  const last7Total = useMemo(
    () => chartData.reduce((sum, entry) => sum + Number(entry.value ?? 0), 0),
    [chartData],
  );

  const dailyAverage = chartData.length > 0 ? last7Total / chartData.length : 0;

  // Next-7-day projection = average of the last 7 days, repeated across 7 days.
  const projectedDailyAvg = dailyAverage;
  const projectedWeekTotal = projectedDailyAvg * 7;

  // Simple trend: most recent day vs the prior-6-day average.
  const trendPct = useMemo(() => {
    if (chartData.length < 2) {
      return 0;
    }
    const latest = Number(chartData[chartData.length - 1].value ?? 0);
    const prior = chartData.slice(0, -1);
    const priorAvg =
      prior.reduce((sum, entry) => sum + Number(entry.value ?? 0), 0) / (prior.length || 1);
    if (priorAvg === 0) {
      return latest > 0 ? 100 : 0;
    }
    return ((latest - priorAvg) / priorAvg) * 100;
  }, [chartData]);

  const busiestDay = useMemo(() => {
    if (chartData.length === 0) {
      return null;
    }
    return chartData.reduce(
      (best, entry) => (Number(entry.value ?? 0) > Number(best.value ?? 0) ? entry : best),
      chartData[0],
    );
  }, [chartData]);

  const trendUp = trendPct >= 0;
  const hasData = chartData.some((entry) => Number(entry.value ?? 0) > 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold text-dark mb-2">Demand Forecasting</h2>
          <p className="text-muted">Simple data-driven projections from the last 7 days of activity.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => void fetchData()}
            className="px-4 py-2 rounded-xl bg-surface-strong text-dark text-sm font-bold flex items-center gap-2 hover:bg-primary hover:text-white transition-all"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
          <div className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-bold flex items-center gap-2">
            <CheckCircle2 size={16} />
            {updatedAt
              ? `Updated ${updatedAt.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}`
              : "Loading..."}
          </div>
        </div>
      </div>

      {error ? <p className="text-sm font-medium text-red-500">{error}</p> : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Forecast Chart */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-bold text-dark">Last 7 Days {metricLabel}</h3>
              <p className="text-muted text-xs mt-1">Actuals per day. Projections below are estimates.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setMetric("orders")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  metric === "orders"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface text-muted hover:bg-primary hover:text-white"
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setMetric("revenue")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  metric === "revenue"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface text-muted hover:bg-primary hover:text-white"
                }`}
              >
                Revenue
              </button>
            </div>
          </div>

          {loading ? (
            <div className="aspect-[16/9] bg-surface rounded-[2rem] flex items-center justify-center text-muted">
              <RefreshCw size={32} className="animate-spin opacity-40" />
            </div>
          ) : !hasData ? (
            <div className="aspect-[16/9] bg-surface rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-muted gap-4">
              <BarChart3 size={48} className="opacity-20" />
              <p className="italic">No {metricLabel.toLowerCase()} recorded in the last 7 days yet.</p>
            </div>
          ) : (
            <div className="h-[240px] md:h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8E9299", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8E9299", fontSize: 12 }}
                    tickFormatter={(value) =>
                      isRevenue ? `Rs.${formatNumber(Number(value) / 1000)}k` : formatNumber(Number(value))
                    }
                    width={70}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatValue(Number(value)), metricLabel]}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                      padding: "12px",
                    }}
                  />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={36}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={busiestDay && entry.label === busiestDay.label ? "#d24a15" : "#F27D26"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Insight cards derived from the data */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="p-5 rounded-2xl bg-surface">
              <p className="text-muted text-[10px] font-bold uppercase tracking-widest mb-2">Last 7 Days {metricLabel}</p>
              <p className="text-2xl font-display font-bold text-dark">{formatValue(last7Total)}</p>
              <p className={`flex items-center gap-1 text-[11px] font-bold mt-2 ${trendUp ? "text-green-500" : "text-red-500"}`}>
                {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {trendUp ? "+" : ""}
                {trendPct.toFixed(0)}% latest day vs prior avg
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface">
              <p className="text-muted text-[10px] font-bold uppercase tracking-widest mb-2">
                Next 7 Days (estimate)
              </p>
              <p className="text-2xl font-display font-bold text-dark">{formatValue(projectedWeekTotal)}</p>
              <p className="text-muted text-[11px] font-bold mt-2">
                projected (7-day avg) · {formatValue(projectedDailyAvg)}/day
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface">
              <p className="text-muted text-[10px] font-bold uppercase tracking-widest mb-2">Busiest Day</p>
              <p className="text-2xl font-display font-bold text-dark">{busiestDay ? busiestDay.label : "—"}</p>
              <p className="text-muted text-[11px] font-bold mt-2">
                {busiestDay ? formatValue(Number(busiestDay.value ?? 0)) : "No data"}
              </p>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="space-y-8">
          <div className="bg-dark rounded-[3rem] p-10 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mb-6 border border-primary/30">
                {trendUp ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
              </div>
              <h3 className="text-xl font-bold mb-4">{metricLabel} Outlook</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                Based on the last 7 days, {metricLabel.toLowerCase()} is trending{" "}
                <span className={`font-bold ${trendUp ? "text-primary" : "text-red-400"}`}>
                  {trendUp ? "up" : "down"} {Math.abs(trendPct).toFixed(0)}%
                </span>{" "}
                versus the prior daily average. These figures are estimates, not guarantees.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs font-bold">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Projected next 7 days: {formatValue(projectedWeekTotal)} (est.)
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Plan extra capacity for {busiestDay ? busiestDay.label : "the busiest day"}
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          </div>

          <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
            <h3 className="text-xl font-bold text-dark mb-6 flex items-center gap-3">
              <Calendar size={24} className="text-primary" />
              7-Day Breakdown
            </h3>
            <div className="space-y-4">
              {loading ? (
                <p className="text-muted text-xs">Loading breakdown...</p>
              ) : chartData.length === 0 ? (
                <p className="text-muted text-xs">No data yet.</p>
              ) : (
                chartData.map((entry, index) => {
                  const max = Math.max(...chartData.map((item) => Number(item.value ?? 0)), 1);
                  const pct = (Number(entry.value ?? 0) / max) * 100;
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <span className="w-10 text-dark font-bold text-sm">{entry.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-muted text-xs font-bold w-20 text-right">
                        {formatValue(Number(entry.value ?? 0))}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            <div className="mt-6 p-4 rounded-2xl bg-surface flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white text-primary flex items-center justify-center shadow-sm shrink-0">
                <Info size={16} />
              </div>
              <p className="text-muted text-[11px] leading-relaxed">
                Projection is a simple 7-day moving average and does not account for promotions, holidays, or seasonality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandForecasting;
