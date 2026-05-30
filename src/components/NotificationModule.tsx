import { motion } from "motion/react";
import { Bell, BellOff, MessageSquare, Mail, Smartphone, Settings, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";

const NotificationModule = () => {
  const notifications = [
    { id: "NT-001", type: "Order", message: "New order received from Table 5", time: "2 mins ago", status: "Unread" },
    { id: "NT-002", type: "Inventory", message: "Low stock alert: Chicken Breast (5kg left)", time: "15 mins ago", status: "Unread" },
    { id: "NT-003", type: "System", message: "Daily backup completed successfully", time: "1 hour ago", status: "Read" },
    { id: "NT-004", type: "Support", message: "New support ticket from Ali Raza", time: "3 hours ago", status: "Read" },
  ];

  return (
    <div className="space-y-8">
      {/* Notification Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Bell size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Total Notifications</p>
          <p className="text-2xl font-display font-bold text-dark">124</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Unread</p>
          <p className="text-2xl font-display font-bold text-dark">12 Unread</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
            <MessageSquare size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">SMS Sent</p>
          <p className="text-2xl font-display font-bold text-dark">1,240</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
            <Mail size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Emails Sent</p>
          <p className="text-2xl font-display font-bold text-dark">450</p>
        </motion.div>
      </div>

      {/* Notification Settings & List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Notification List */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
          <h2 className="text-2xl font-bold text-dark mb-10">Recent Notifications</h2>
          <div className="space-y-6">
            {notifications.map((notif, index) => (
              <div key={index} className="flex items-start gap-6 p-6 rounded-3xl bg-surface hover:bg-surface-strong transition-all group cursor-pointer">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  notif.type === "Order" ? "bg-primary/10 text-primary" :
                  notif.type === "Inventory" ? "bg-red-500/10 text-red-500" :
                  "bg-blue-500/10 text-blue-500"
                }`}>
                  {notif.type === "Order" ? <Smartphone size={24} /> :
                   notif.type === "Inventory" ? <AlertCircle size={24} /> :
                   <Bell size={24} />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-dark font-bold">{notif.type} Notification</span>
                    <span className="text-muted text-xs font-bold uppercase tracking-widest">{notif.time}</span>
                  </div>
                  <p className="text-muted text-sm leading-relaxed">{notif.message}</p>
                </div>
                {notif.status === "Unread" && (
                  <div className="w-3 h-3 rounded-full bg-primary mt-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Channels */}
        <div className="bg-dark rounded-[3rem] p-10 text-white">
          <h3 className="text-xl font-bold mb-10 flex items-center gap-3">
            <Settings size={24} className="text-primary" />
            Channels
          </h3>
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Smartphone size={20} className="text-primary" />
                </div>
                <span className="font-bold">Push Notifications</span>
              </div>
              <div className="w-12 h-6 rounded-full bg-primary relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Mail size={20} className="text-primary" />
                </div>
                <span className="font-bold">Email Alerts</span>
              </div>
              <div className="w-12 h-6 rounded-full bg-primary relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <MessageSquare size={20} className="text-primary" />
                </div>
                <span className="font-bold">SMS Marketing</span>
              </div>
              <div className="w-12 h-6 rounded-full bg-white/20 relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-white/60 text-xs leading-relaxed">
              Automated notifications are sent based on system triggers. You can customize these in the global settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModule;
