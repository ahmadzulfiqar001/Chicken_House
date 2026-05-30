import { motion } from "motion/react";
import { HelpCircle, MessageSquare, Phone, Mail, ChevronRight, Search, Filter, CheckCircle, Clock } from "lucide-react";

const SupportModule = () => {
  const tickets = [
    { id: "TKT-001", customer: "Ali Raza", subject: "Order Delayed", priority: "High", status: "Open", time: "10 mins ago" },
    { id: "TKT-002", customer: "Sara Ahmed", subject: "Payment Failed", priority: "Medium", status: "In Progress", time: "1 hour ago" },
    { id: "TKT-003", customer: "Usman Khan", subject: "Wrong Item Received", priority: "High", status: "Open", time: "2 hours ago" },
    { id: "TKT-004", customer: "Zainab Bibi", subject: "Refund Request", priority: "Low", status: "Resolved", time: "1 day ago" },
  ];

  return (
    <div className="space-y-8">
      {/* Support Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <HelpCircle size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Total Tickets</p>
          <p className="text-2xl font-display font-bold text-dark">24 Tickets</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
            <Clock size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Open Tickets</p>
          <p className="text-2xl font-display font-bold text-dark">8 Open</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
            <CheckCircle size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Resolved</p>
          <p className="text-2xl font-display font-bold text-dark">16 Resolved</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
            <MessageSquare size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Avg. Response</p>
          <p className="text-2xl font-display font-bold text-dark">12 Mins</p>
        </motion.div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <h2 className="text-2xl font-bold text-dark">Support Tickets</h2>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                placeholder="Search tickets..."
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
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Ticket ID</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Customer</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Subject</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Priority</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Status</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tickets.map((ticket, index) => (
                <tr key={index} className="group hover:bg-surface transition-colors">
                  <td className="py-6">
                    <span className="text-dark font-bold block">{ticket.id}</span>
                    <span className="text-muted text-xs">{ticket.time}</span>
                  </td>
                  <td className="py-6 font-medium text-dark">{ticket.customer}</td>
                  <td className="py-6 text-muted text-sm max-w-xs truncate">{ticket.subject}</td>
                  <td className="py-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      ticket.priority === "High" ? "bg-red-500/10 text-red-500" :
                      ticket.priority === "Medium" ? "bg-yellow-500/10 text-yellow-500" :
                      "bg-blue-500/10 text-blue-500"
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="py-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      ticket.status === "Open" ? "bg-red-500/10 text-red-500" :
                      ticket.status === "In Progress" ? "bg-blue-500/10 text-blue-500" :
                      "bg-green-500/10 text-green-500"
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="py-6">
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg bg-surface-strong text-dark hover:bg-primary hover:text-white transition-all">
                        <MessageSquare size={18} />
                      </button>
                      <button className="p-2 rounded-lg bg-surface-strong text-dark hover:bg-primary hover:text-white transition-all">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupportModule;
