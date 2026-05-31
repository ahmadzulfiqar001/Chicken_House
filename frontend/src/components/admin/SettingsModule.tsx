import { useEffect, useState } from "react";
import { Settings, Shield, Bell, Globe, Database, Save, User, Lock, RefreshCw, CheckCircle } from "lucide-react";

const TABS = [
  { id: "general", name: "General Settings", icon: Settings },
  { id: "security", name: "Security & Access", icon: Shield },
  { id: "notifications", name: "Notifications", icon: Bell },
  { id: "branches", name: "Branch Config", icon: Globe },
  { id: "database", name: "Database & Backup", icon: Database },
];

const SettingsModule = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("general");

  const [form, setForm] = useState({
    brandName: "",
    contactEmail: "",
    contactPhone: "",
    whatsappNumber: "",
    addressLine1: "",
    city: "",
  });
  const [settings, setSettings] = useState({
    currency: "",
    timezone: "",
    twoFactorAuth: false,
    autoBackup: true,
    orderNotifications: true,
  });

  const fetchSettings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to load settings.");
      setForm({
        brandName: data.brandName ?? "",
        contactEmail: data.contactEmail ?? "",
        contactPhone: data.contactPhone ?? "",
        whatsappNumber: data.whatsappNumber ?? "",
        addressLine1: data.addressLine1 ?? "",
        city: data.city ?? "",
      });
      setSettings({
        currency: data.settings?.currency ?? "",
        timezone: data.settings?.timezone ?? "",
        twoFactorAuth: Boolean(data.settings?.twoFactorAuth),
        autoBackup: data.settings?.autoBackup !== false,
        orderNotifications: data.settings?.orderNotifications !== false,
      });
    } catch (fetchError) {
      console.error(fetchError);
      setError("Settings could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateField = (field, value) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateSetting = (field, value) => {
    setSaved(false);
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const saveChanges = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const payload = {
        brandName: form.brandName,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        whatsappNumber: form.whatsappNumber,
        addressLine1: form.addressLine1,
        city: form.city,
        settings: {
          currency: settings.currency,
          timezone: settings.timezone,
          twoFactorAuth: settings.twoFactorAuth,
          autoBackup: settings.autoBackup,
          orderNotifications: settings.orderNotifications,
        },
      };
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to save settings.");
      setSaved(true);
    } catch (saveError) {
      console.error(saveError);
      setError("Settings could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ on, onToggle }) => (
    <div
      onClick={onToggle}
      className={`w-14 h-8 rounded-full relative cursor-pointer transition-colors ${on ? "bg-primary" : "bg-gray-300"}`}
    >
      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${on ? "right-1" : "left-1"}`} />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold text-dark">System Settings</h2>
        <div className="flex items-center gap-4">
          {saved && (
            <span className="flex items-center gap-2 text-sm font-bold text-green-600">
              <CheckCircle size={18} />
              Saved
            </span>
          )}
          {error && <span className="text-sm font-medium text-red-500">{error}</span>}
          <button
            onClick={saveChanges}
            disabled={saving || loading}
            className="px-8 py-3 rounded-xl bg-primary text-white font-bold flex items-center gap-2 hover:bg-primary-strong transition-all shadow-lg shadow-primary/20 disabled:opacity-60"
          >
            <Save size={20} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Sidebar Navigation */}
        <div className="space-y-4">
          {TABS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all ${
                activeTab === item.id ? "bg-primary text-white shadow-xl shadow-primary/20" : "bg-white text-muted hover:bg-surface"
              }`}
            >
              <item.icon size={20} />
              <span className="font-bold">{item.name}</span>
            </button>
          ))}
        </div>

        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-8">
          {loading ? (
            <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50 flex items-center justify-center gap-3 text-muted">
              <RefreshCw size={20} className="animate-spin" />
              Loading settings...
            </div>
          ) : activeTab === "general" ? (
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
                    value={form.brandName}
                    onChange={(e) => updateField("brandName", e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-widest">Support Email</label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => updateField("contactEmail", e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-widest">Contact Phone</label>
                  <input
                    type="text"
                    value={form.contactPhone}
                    onChange={(e) => updateField("contactPhone", e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-widest">WhatsApp Number</label>
                  <input
                    type="text"
                    value={form.whatsappNumber}
                    onChange={(e) => updateField("whatsappNumber", e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-widest">Address</label>
                  <input
                    type="text"
                    value={form.addressLine1}
                    onChange={(e) => updateField("addressLine1", e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-widest">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-widest">Currency</label>
                  <input
                    type="text"
                    value={settings.currency}
                    onChange={(e) => updateSetting("currency", e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-widest">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => updateSetting("timezone", e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                  >
                    <option value="Asia/Karachi">Asia/Karachi (Pakistan Standard Time)</option>
                    <option value="Asia/Dubai">Asia/Dubai (Gulf Standard Time)</option>
                    <option value="Asia/Riyadh">Asia/Riyadh (Arabia Standard Time)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
            </div>
          ) : activeTab === "security" ? (
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
                  <Toggle on={settings.twoFactorAuth} onToggle={() => updateSetting("twoFactorAuth", !settings.twoFactorAuth)} />
                </div>

                <div className="flex items-center justify-between p-6 rounded-3xl bg-surface">
                  <div>
                    <span className="text-dark font-bold block">Auto-Backup Database</span>
                    <span className="text-muted text-xs">Backup to cloud every 24 hours.</span>
                  </div>
                  <Toggle on={settings.autoBackup} onToggle={() => updateSetting("autoBackup", !settings.autoBackup)} />
                </div>
              </div>
            </div>
          ) : activeTab === "notifications" ? (
            <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
              <h3 className="text-xl font-bold text-dark mb-8 flex items-center gap-3">
                <Bell size={24} className="text-primary" />
                Notification Preferences
              </h3>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 rounded-3xl bg-surface">
                  <div>
                    <span className="text-dark font-bold block">Order Notifications</span>
                    <span className="text-muted text-xs">Alert staff when new orders arrive.</span>
                  </div>
                  <Toggle on={settings.orderNotifications} onToggle={() => updateSetting("orderNotifications", !settings.orderNotifications)} />
                </div>
              </div>
            </div>
          ) : activeTab === "database" ? (
            <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
              <h3 className="text-xl font-bold text-dark mb-8 flex items-center gap-3">
                <Database size={24} className="text-primary" />
                Database & Backup
              </h3>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 rounded-3xl bg-surface">
                  <div>
                    <span className="text-dark font-bold block">Auto-Backup Database</span>
                    <span className="text-muted text-xs">Backup to cloud every 24 hours.</span>
                  </div>
                  <Toggle on={settings.autoBackup} onToggle={() => updateSetting("autoBackup", !settings.autoBackup)} />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-dark/5 border border-gray-50">
              <h3 className="text-xl font-bold text-dark mb-8 flex items-center gap-3">
                <Globe size={24} className="text-primary" />
                Branch Config
              </h3>
              <p className="text-muted">Branch configuration is managed in the Branches module.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModule;
