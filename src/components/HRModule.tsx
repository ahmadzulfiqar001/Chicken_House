import { motion } from "motion/react";
import { Users, UserPlus, Clock, Calendar, CheckCircle, XCircle, ChevronRight, Search, Filter } from "lucide-react";

const HRModule = () => {
  const employees = [
    { id: "EMP-001", name: "Ahmad Ali", role: "Head Chef", status: "Active", shift: "Morning", attendance: "98%" },
    { id: "EMP-002", name: "Saira Khan", role: "Waitress", status: "Active", shift: "Evening", attendance: "95%" },
    { id: "EMP-003", name: "Bilal Ahmed", role: "Rider", status: "On Leave", shift: "Night", attendance: "92%" },
    { id: "EMP-004", name: "Zainab Bibi", role: "Manager", status: "Active", shift: "Morning", attendance: "100%" },
    { id: "EMP-005", name: "Usman Ghani", role: "Cleaner", status: "Active", shift: "Morning", attendance: "88%" },
  ];

  return (
    <div className="space-y-8">
      {/* HR Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Total Staff</p>
          <p className="text-2xl font-display font-bold text-dark">42 Members</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
            <CheckCircle size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Present Today</p>
          <p className="text-2xl font-display font-bold text-dark">38 Present</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center mb-4">
            <Calendar size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">On Leave</p>
          <p className="text-2xl font-display font-bold text-dark">4 Members</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
            <Clock size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Avg. Attendance</p>
          <p className="text-2xl font-display font-bold text-dark">94.5%</p>
        </motion.div>
      </div>

      {/* Staff Management Table */}
      <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <h2 className="text-2xl font-bold text-dark">Staff Directory</h2>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                placeholder="Search staff..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
            <button className="p-3 rounded-xl bg-surface text-dark hover:bg-primary hover:text-white transition-all">
              <Filter size={20} />
            </button>
            <button className="px-6 py-3 rounded-xl bg-primary text-white font-bold flex items-center gap-2 hover:bg-primary-strong transition-all shadow-lg shadow-primary/20">
              <UserPlus size={20} />
              Add Employee
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Employee</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Role</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Shift</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Attendance</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Status</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees.map((emp, index) => (
                <tr key={index} className="group hover:bg-surface transition-colors">
                  <td className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface-strong flex items-center justify-center text-dark font-bold">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <span className="text-dark font-bold block">{emp.name}</span>
                        <span className="text-muted text-xs">{emp.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 font-medium text-dark">{emp.role}</td>
                  <td className="py-6">
                    <span className="text-muted text-sm">{emp.shift}</span>
                  </td>
                  <td className="py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-surface rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: emp.attendance }}
                        />
                      </div>
                      <span className="text-xs font-bold text-dark">{emp.attendance}</span>
                    </div>
                  </td>
                  <td className="py-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      emp.status === "Active" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-6">
                    <button className="p-2 rounded-lg bg-surface-strong text-dark hover:bg-primary hover:text-white transition-all">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payroll Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
          <h3 className="text-xl font-bold text-dark mb-6">Payroll Overview</h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-muted">Next Pay Date</span>
              <span className="text-dark font-bold">April 01, 2026</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted">Total Payroll Amount</span>
              <span className="text-dark font-bold">Rs. 450,000</span>
            </div>
            <button className="w-full py-4 rounded-2xl bg-dark text-white font-bold hover:bg-primary transition-colors">
              Process Payroll
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
          <h3 className="text-xl font-bold text-dark mb-6">Shift Schedule</h3>
          <div className="space-y-6">
            <p className="text-muted text-sm">Next week's schedule is ready for review.</p>
            <div className="flex -space-x-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-surface-strong flex items-center justify-center text-[10px] font-bold">
                  {i}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                +37
              </div>
            </div>
            <button className="w-full py-4 rounded-2xl bg-surface-strong text-dark font-bold hover:bg-primary hover:text-white transition-colors">
              Manage Shifts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRModule;
