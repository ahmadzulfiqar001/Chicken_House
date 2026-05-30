import { motion } from "motion/react";
import { Settings, Shield, Bell, Globe, Database, Save, User, Lock } from "lucide-react";

const SettingsModule = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold text-dark">System Settings</h2>
        <button className="px-8 py-3 rounded-xl bg-primary text-white font-bold flex items-center gap-2 hover:bg-primary-strong transition-all shadow-lg shadow-primary/20">
          <Save size={20} />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Sidebar Navigation */}
        <div className="space-y-4">
          {[
            { id: "general", name: "General Settings", icon: Settings },
            { id: "security", name: "Security & Access", icon: Shield },
            { id: "notifications", name: "Notifications", icon: Bell },
            { id: "branches", name: "Branch Config", icon: Globe },
            { id: "database", name: "Database & Backup", icon: Database },
          ].map((item, index) => (
            <button
              key={index}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all ${
                index === 0 ? "bg-primary text-white shadow-xl shadow-primary/20" : "bg-white text-muted hover:bg-surface"
              }`}
            >
              <item.icon size={20} />
              <span className="font-bold">{item.name}</span>
            </button>
          ))}
        </div>

        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
            <h3 className="text-xl font-bold text-dark mb-8 flex items-center gap-3">
              <User size={24} className="text-primary" />
              General Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-widest">Restaurant Name</label>
                <input
                  type="text"
                  defaultValue="Chicken House"
                  className="w-full px-6 py-4 rounded-2xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-widest">Support Email</label>
                <input
                  type="email"
                  defaultValue="support@chickenhouse.pk"
                  className="w-full px-6 py-4 rounded-2xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-widest">Currency Symbol</label>
                <input
                  type="text"
                  defaultValue="Rs."
                  className="w-full px-6 py-4 rounded-2xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-widest">Timezone</label>
                <select className="w-full px-6 py-4 rounded-2xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold">
                  <option>GMT+5 (Pakistan Standard Time)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
            <h3 className="text-xl font-bold text-dark mb-8 flex items-center gap-3">
              <Lock size={24} className="text-primary" />
              Security Settings
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 rounded-3xl bg-surface">
                <div>
                  <span className="text-dark font-bold block">Two-Factor Authentication</span>
                  <span className="text-muted text-xs">Require a code for all admin logins.</span>
                </div>
                <div className="w-14 h-8 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full shadow-sm" />
                </div>
              </div>

              <div className="flex items-center justify-between p-6 rounded-3xl bg-surface">
                <div>
                  <span className="text-dark font-bold block">Auto-Backup Database</span>
                  <span className="text-muted text-xs">Backup to cloud every 24 hours.</span>
                </div>
                <div className="w-14 h-8 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModule;
