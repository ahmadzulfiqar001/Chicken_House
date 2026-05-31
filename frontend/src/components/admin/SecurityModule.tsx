import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Shield, Key, UserCheck, AlertCircle, Search, RefreshCw } from "lucide-react";

const formatWhen = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
};

const SecurityModule = () => {
  const [sessions, setSessions] = useState([]);
  const [activity, setActivity] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSecurity = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/security");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to load security data.");
      setSessions(data.sessions ?? []);
      setActivity(data.activity ?? []);
      setMetrics(data.metrics ?? null);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Security data could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurity();
  }, []);

  const filteredSessions = useMemo(
    () =>
      sessions.filter((session) =>
        [session.email, session.role, session.ipAddress, session.deviceLabel, session.userAgent]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      ),
    [sessions, searchQuery],
  );

  const filteredActivity = useMemo(
    () =>
      activity.filter((entry) =>
        [entry.action, entry.detail, entry.staffName, entry.role]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      ),
    [activity, searchQuery],
  );

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
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Active Sessions</p>
          <p className="text-2xl font-display font-bold text-dark">{metrics?.activeSessions ?? 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
            <UserCheck size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Active Users</p>
          <p className="text-2xl font-display font-bold text-dark">{metrics?.uniqueActiveUsers ?? 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
        >
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Suspended Accounts</p>
          <p className="text-2xl font-display font-bold text-dark">{metrics?.suspendedAccounts ?? 0}</p>
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
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Last Login</p>
          <p className="text-lg font-display font-bold text-dark">{formatWhen(metrics?.lastLoginAt)}</p>
          <p className="text-xs text-muted mt-1">{metrics?.uniqueIps ?? 0} unique IPs</p>
        </motion.div>
      </div>

      {/* Active Sessions Table */}
      <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <h2 className="text-2xl font-bold text-dark">Active Sessions</h2>

          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                placeholder="Search sessions & activity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
            <button
              onClick={fetchSecurity}
              className="p-3 rounded-xl bg-surface text-dark hover:bg-primary hover:text-white transition-all"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {error && <p className="mb-4 text-sm font-medium text-red-500">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">User</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Role</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">IP Address</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Device</th>
                <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Last Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSessions.map((session) => (
                <tr key={session.id} className="group hover:bg-surface transition-colors">
                  <td className="py-6 font-bold text-dark">{session.email}</td>
                  <td className="py-6 font-medium text-dark">{session.role}</td>
                  <td className="py-6 font-mono text-xs text-muted">{session.ipAddress || "—"}</td>
                  <td className="py-6 text-sm text-muted max-w-xs truncate" title={session.userAgent}>
                    {session.deviceLabel || session.userAgent || "Unknown device"}
                  </td>
                  <td className="py-6 text-muted text-sm">{formatWhen(session.lastSeenAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredSessions.length === 0 && (
            <div className="p-10 text-center text-muted">No active sessions yet.</div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
        <h2 className="text-2xl font-bold text-dark mb-10">Recent Activity</h2>

        <div className="space-y-4">
          {filteredActivity.map((entry, index) => (
            <div key={index} className="flex items-start gap-4 p-4 rounded-2xl bg-surface">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Shield size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-dark">{entry.action}</p>
                {entry.detail && <p className="text-sm text-muted">{entry.detail}</p>}
                <p className="text-xs text-muted mt-1">
                  {entry.staffName || "System"}
                  {entry.role ? ` · ${entry.role}` : ""}
                </p>
              </div>
              <span className="text-xs text-muted whitespace-nowrap">{formatWhen(entry.createdAt)}</span>
            </div>
          ))}
          {!loading && filteredActivity.length === 0 && (
            <div className="p-10 text-center text-muted">No recent activity yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityModule;
