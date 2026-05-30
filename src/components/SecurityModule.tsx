import { motion } from "motion/react";
import { Shield, Lock, Eye, EyeOff, Key, UserCheck, AlertCircle, ChevronRight, Search, Filter } from "lucide-react";

const SecurityModule = () => {
  const logs = [
    { id: "LOG-001", user: "Admin (Zainab)", action: "Login", status: "Success", time: "5 mins ago", ip: "192.168.1.1" },
    { id: "LOG-002", user: "Unknown", action: "Failed Login", status: "Blocked", time: "1 hour ago", ip: "45.12.34.56" },
    { id: "LOG-003", user: "Manager (Ali)", action: "Update Menu", status: "Success", time: "2 hours ago", ip: "192.168.1.5" },
    { id: "LOG-004", user: "Admin (Zainab)", action: "Export Finance", status: "Success", time: "5 hours ago", ip: "192.168.1.1" },
  ];

  return (
    <div className="space-y-8">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Shield size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Security Status</p>
          <p className="text-2xl font-display font-bold text-green-500">Secure</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Blocked IPs</p>
          <p className="text-2xl font-display font-bold text-dark">12 IPs</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
            <UserCheck size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Active Sessions</p>
          <p className="text-2xl font-display font-bold text-dark">5 Sessions</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
            <Key size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Last Audit</p>
          <p className="text-2xl font-display font-bold text-dark">2 Days Ago</p>
        </motion.div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <h2 className="text-2xl font-bold text-dark">Security Audit Logs</h2>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                placeholder="Search logs..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
            <button className="p-3 rounded-xl bg-surface text-dark hover:bg-primary hover:text-white transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Log ID</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">User</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Action</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">IP Address</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Status</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log, index) => (
                <tr key={index} className="group hover:bg-surface transition-colors">
                  <td className="py-6 font-mono text-xs text-muted">{log.id}</td>
                  <td className="py-6 font-bold text-dark">{log.user}</td>
                  <td className="py-6 font-medium text-dark">{log.action}</td>
                  <td className="py-6 font-mono text-xs text-muted">{log.ip}</td>
                  <td className="py-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      log.status === "Success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-6 text-muted text-sm">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecurityModule;
