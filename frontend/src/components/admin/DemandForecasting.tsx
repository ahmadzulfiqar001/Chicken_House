import { motion } from "motion/react";
import { BarChart3, TrendingUp, Calendar, Info, AlertCircle, CheckCircle2 } from "lucide-react";

const DemandForecasting = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold text-dark mb-2">Demand Forecasting</h2>
          <p className="text-muted">AI-powered predictions for stock and staff requirements.</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-bold flex items-center gap-2">
            <CheckCircle2 size={16} />
            Model Updated: 2 hours ago
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Forecast Chart Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-bold text-dark">Next 7 Days Prediction</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded-lg bg-surface text-xs font-bold text-muted hover:bg-primary hover:text-white transition-all">Orders</button>
              <button className="px-3 py-1 rounded-lg bg-primary text-xs font-bold text-white shadow-sm">Revenue</button>
            </div>
          </div>
          
          <div className="aspect-[16/9] bg-surface rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-muted gap-4">
            <BarChart3 size={48} className="opacity-20" />
            <p className="italic">Interactive Demand Forecast Chart Coming Soon...</p>
          </div>
        </div>

        {/* Insights */}
        <div className="space-y-8">
          <div className="bg-dark rounded-[3rem] p-10 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mb-6 border border-primary/30">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-bold mb-4">Weekend Surge Alert</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                Due to the upcoming festival in Okara, we predict a <span className="text-primary font-bold">40% spike</span> in dine-in traffic this Sunday.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs font-bold">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Recommend +4 Staff Members
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Increase Chicken Stock by 50kg
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          </div>

          <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
            <h3 className="text-xl font-bold text-dark mb-6 flex items-center gap-3">
              <Calendar size={24} className="text-primary" />
              Seasonal Trends
            </h3>
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-surface flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white text-primary flex items-center justify-center shadow-sm">
                  <Info size={20} />
                </div>
                <div>
                  <span className="text-dark font-bold block text-sm">Ramadan Preparation</span>
                  <span className="text-muted text-[10px] font-bold uppercase tracking-widest">Starts in 12 days</span>
                </div>
              </div>
              <p className="text-muted text-xs leading-relaxed">
                Historical data shows a shift towards late-night orders (Iftar/Sehri) during this period. We suggest adjusting shift timings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandForecasting;
