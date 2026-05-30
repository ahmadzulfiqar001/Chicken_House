import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar,
  LayoutDashboard, 
  Utensils, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  ChevronRight, 
  DollarSign, 
  Package, 
  UserPlus,
  BarChart3,
  Layers,
  MapPin,
  Bot,
  Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import AccountsModule from "../components/AccountsModule";
import BranchesModule from "../components/BranchesModule";
import EcommerceModule from "../components/EcommerceModule";
import SettingsModule from "../components/SettingsModule";
import DemandForecasting from "../components/DemandForecasting";
import RiderModule from "../components/RiderModule";
import SupportModule from "../components/SupportModule";
import SecurityModule from "../components/SecurityModule";
import NotificationModule from "../components/NotificationModule";
import MenuManagement from "../components/MenuManagement";
import HRManagement from "../components/HRManagement";
import UserManagement from "../components/UserManagement";
import InventoryManagement from "../components/InventoryManagement";
import PromotionManagement from "../components/PromotionManagement";
import AnalyticsOverview from "../components/AnalyticsOverview";
import OrderManagement from "../components/OrderManagement";
import BookingManagement from "../components/BookingManagement";
import ChatbotInboxModule from "../components/ChatbotInboxModule";
import StaffWorkspace from "../components/StaffWorkspace";
import ManagerWorkspace from "../components/ManagerWorkspace";
import { useAuth, UserRole } from "../context/AuthContext";

type DashboardTabId =
  | "dashboard"
  | "ecommerce"
  | "orders"
  | "bookings"
  | "menu"
  | "accounts"
  | "hr"
  | "users"
  | "inventory"
  | "branches"
  | "chatbot"
  | "analytics"
  | "promotions"
  | "ai"
  | "riders"
  | "support"
  | "security"
  | "notifications"
  | "settings";

type SidebarLink = {
  id: DashboardTabId;
  name: string;
  icon: ReactNode;
  allow: UserRole[];
};

const DASHBOARD_LINKS: SidebarLink[] = [
  { id: "dashboard", name: "Dashboard", icon: <LayoutDashboard size={20} />, allow: ["admin", "manager", "staff"] },
  { id: "ecommerce", name: "E-commerce", icon: <ShoppingCart size={20} />, allow: ["admin"] },
  { id: "orders", name: "Orders", icon: <Layers size={20} />, allow: ["admin", "manager", "staff"] },
  { id: "bookings", name: "Bookings", icon: <Calendar size={20} />, allow: ["admin", "manager", "staff"] },
  { id: "menu", name: "Menu Management", icon: <Utensils size={20} />, allow: ["admin", "manager"] },
  { id: "accounts", name: "Accounts", icon: <DollarSign size={20} />, allow: ["admin", "manager"] },
  { id: "hr", name: "HR & Workforce", icon: <Users size={20} />, allow: ["admin", "manager"] },
  { id: "users", name: "User Management", icon: <UserPlus size={20} />, allow: ["admin"] },
  { id: "inventory", name: "Inventory & Stock", icon: <Package size={20} />, allow: ["admin", "manager"] },
  { id: "branches", name: "Branches", icon: <MapPin size={20} />, allow: ["admin"] },
  { id: "chatbot", name: "Chatbot Inbox", icon: <Bot size={20} />, allow: ["admin"] },
  { id: "analytics", name: "Analytics", icon: <BarChart3 size={20} />, allow: ["admin", "manager"] },
  { id: "promotions", name: "Promotions", icon: <TrendingUp size={20} />, allow: ["admin"] },
  { id: "ai", name: "Forecasting", icon: <BarChart3 size={20} />, allow: ["admin"] },
  { id: "riders", name: "Riders", icon: <Users size={20} />, allow: ["admin"] },
  { id: "support", name: "Support", icon: <Bell size={20} />, allow: ["admin"] },
  { id: "security", name: "Security", icon: <Shield size={20} />, allow: ["admin"] },
  { id: "notifications", name: "Notifications", icon: <Bell size={20} />, allow: ["admin"] },
  { id: "settings", name: "Settings", icon: <Settings size={20} />, allow: ["admin"] },
];

const PANEL_META: Record<UserRole, { title: string; authority: string }> = {
  admin: { title: "Admin Panel", authority: "Admin Authority" },
  manager: { title: "Manager Panel", authority: "Operations Access" },
  rider: { title: "Rider Panel", authority: "Delivery Access" },
  staff: { title: "Staff Panel", authority: "Task-Based Access" },
  user: { title: "Customer Panel", authority: "Customer Access" },
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<DashboardTabId>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentRole = user?.role ?? "admin";
  const staffWorkspaceRoles: UserRole[] = ["rider", "staff"];

  if (staffWorkspaceRoles.includes(currentRole)) {
    return <StaffWorkspace />;
  }

  if (currentRole === "manager") {
    return <ManagerWorkspace />;
  }

  const panelMeta = PANEL_META[currentRole];
  const sidebarLinks = useMemo(
    () => DASHBOARD_LINKS.filter((link) => link.allow.includes(currentRole)),
    [currentRole],
  );

  useEffect(() => {
    if (!sidebarLinks.some((link) => link.id === activeTab)) {
      setActiveTab(sidebarLinks[0]?.id ?? "dashboard");
    }
  }, [activeTab, sidebarLinks]);

  const stats = useMemo(() => {
    return [
      { name: "Total Sales", value: "Rs. 1,245,000", change: "+12.5%", icon: <DollarSign size={24} />, color: "bg-green-500/10 text-green-500" },
      { name: "Active Orders", value: "48", change: "+5.2%", icon: <ShoppingCart size={24} />, color: "bg-blue-500/10 text-blue-500" },
      { name: "New Customers", value: "124", change: "+8.1%", icon: <UserPlus size={24} />, color: "bg-purple-500/10 text-purple-500" },
      { name: "Inventory Alerts", value: "12", change: "-2.4%", icon: <Package size={24} />, color: "bg-red-500/10 text-red-500" },
    ];
  }, [currentRole]);

  const recentOrders = [
    { id: "CH-12345", customer: "John Doe", items: "Chicken Karahi, Naan", total: "2,560", status: "Cooking", time: "5 mins ago" },
    { id: "CH-12346", customer: "Jane Smith", items: "Special BBQ Platter", total: "5,200", status: "Pending", time: "12 mins ago" },
    { id: "CH-12347", customer: "Ali Khan", items: "Premium Pizza", total: "1,800", status: "Delivered", time: "25 mins ago" },
    { id: "CH-12348", customer: "Sara Ahmed", items: "Hot & Sour Soup", total: "900", status: "Out for Delivery", time: "40 mins ago" },
  ];

  const quickActions = useMemo(() => {
    return [
      { label: "Add Item", icon: <Utensils size={24} />, className: "bg-primary/5 text-primary hover:bg-primary hover:text-white" },
      { label: "Add Staff", icon: <Users size={24} />, className: "bg-accent/5 text-accent hover:bg-accent hover:text-dark" },
      { label: "Reports", icon: <TrendingUp size={24} />, className: "bg-green-500/5 text-green-500 hover:bg-green-500 hover:text-white" },
      { label: "Notify", icon: <Bell size={24} />, className: "bg-purple-500/5 text-purple-500 hover:bg-purple-500 hover:text-white" },
    ];
  }, [currentRole]);

  const spotlightCard = useMemo(() => {
    return {
      title: "Inventory Alert",
      text: "12 items are below the safety threshold of 15%.",
      button: "Manage Stock",
      icon: <Package size={32} className="mb-4" />,
    };
  }, [currentRole]);

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-dark text-white flex flex-col fixed h-full z-50 transition-all duration-300"
      >
              <div className="p-6 flex items-center gap-4 mb-8">
          <img
            src="/logo.jpg"
            alt="Chicken House"
            className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-lg border border-white/10"
          />
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-display text-xl font-bold whitespace-nowrap"
                >
                  {panelMeta.title}
                </motion.span>
              )}
            </div>

        <nav className="flex-1 px-4 space-y-2">
          {sidebarLinks.map((link) => (
            <motion.button
              key={link.id}
              whileHover={{ x: 5 }}
              onClick={() => setActiveTab(link.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                activeTab === link.id
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="shrink-0">{link.icon}</div>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium"
                >
                  {link.name}
                </motion.span>
              )}
            </motion.button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center gap-4 p-4 rounded-xl text-white/60 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-[280px]" : "ml-[80px]"}`}>
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-muted"
            >
              <ChevronRight className={`transition-transform duration-300 ${isSidebarOpen ? "rotate-180" : ""}`} />
            </button>
            <h1 className="text-2xl font-bold text-dark capitalize">{activeTab}</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                placeholder="Search anything..."
                className="pl-10 pr-4 py-2 rounded-lg bg-surface border border-transparent focus:border-primary focus:bg-white transition-all outline-none text-sm w-64"
              />
            </div>
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors text-muted">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <span className="text-sm font-bold text-dark block leading-none mb-1">{user?.name ?? "Owner Admin"}</span>
                <span className="text-xs text-muted">{panelMeta.authority}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                {user?.name?.slice(0, 2).toUpperCase() ?? "OA"}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white p-6 rounded-3xl shadow-xl shadow-dark/5 border border-gray-50"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
                          {stat.icon}
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${stat.change.startsWith("+") ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                          {stat.change}
                        </span>
                      </div>
                      <h3 className="text-muted text-sm font-bold uppercase tracking-widest mb-1">{stat.name}</h3>
                      <p className="text-2xl font-display font-bold text-dark">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Recent Orders */}
                  <div className="lg:col-span-2 bg-white rounded-[3rem] p-8 shadow-xl shadow-dark/5 border border-gray-50">
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-xl font-bold text-dark">Recent Orders</h2>
                      <button className="text-primary font-bold text-sm hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left border-b border-gray-100">
                            <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Order ID</th>
                            <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Customer</th>
                            <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Items</th>
                            <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Total</th>
                            <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Status</th>
                            <th className="pb-4 text-muted text-xs font-bold uppercase tracking-widest">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {recentOrders.map((order, index) => (
                            <tr key={index} className="group hover:bg-surface transition-colors">
                              <td className="py-4 font-bold text-dark">{order.id}</td>
                              <td className="py-4 text-muted">{order.customer}</td>
                              <td className="py-4 text-muted truncate max-w-[150px]">{order.items}</td>
                              <td className="py-4 font-bold text-dark">Rs. {order.total}</td>
                              <td className="py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  order.status === "Delivered" ? "bg-green-500/10 text-green-500" :
                                  order.status === "Cooking" ? "bg-blue-500/10 text-blue-500" :
                                  order.status === "Pending" ? "bg-yellow-500/10 text-yellow-500" :
                                  "bg-primary/10 text-primary"
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-4 text-muted text-xs">{order.time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-8">
                    <div className="bg-white rounded-[3rem] p-8 shadow-xl shadow-dark/5 border border-gray-50">
                      <h2 className="text-xl font-bold text-dark mb-8">Quick Actions</h2>
                      <div className="grid grid-cols-2 gap-4">
                        {quickActions.map((action) => (
                          <button
                            key={action.label}
                            className={`p-4 rounded-2xl transition-all duration-300 flex flex-col items-center gap-2 group ${action.className}`}
                          >
                            <span className="group-hover:scale-110 transition-transform">{action.icon}</span>
                            <span className="text-xs font-bold uppercase tracking-widest">{action.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Inventory Alert */}
                    <div className="bg-primary rounded-[3rem] p-8 shadow-xl shadow-primary/20 text-white relative overflow-hidden">
                      <div className="relative z-10">
                        {spotlightCard.icon}
                        <h3 className="text-xl font-bold mb-2">{spotlightCard.title}</h3>
                        <p className="text-white/70 text-sm mb-6">{spotlightCard.text}</p>
                        <button className="w-full py-3 rounded-xl bg-white text-primary font-bold hover:bg-accent hover:text-dark transition-colors">
                          {spotlightCard.button}
                        </button>
                      </div>
                      <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === "accounts" && (
              <motion.div
                key="accounts"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <AccountsModule />
              </motion.div>
            )}

            {activeTab === "inventory" && (
              <motion.div
                key="inventory"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <InventoryManagement />
              </motion.div>
            )}

            {activeTab === "hr" && (
              <motion.div
                key="hr"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <HRManagement />
              </motion.div>
            )}

            {activeTab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <UserManagement />
              </motion.div>
            )}

            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <OrderManagement />
              </motion.div>
            )}

            {activeTab === "bookings" && (
              <motion.div
                key="bookings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <BookingManagement />
              </motion.div>
            )}

            {activeTab === "ecommerce" && (
              <motion.div
                key="ecommerce"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <EcommerceModule />
              </motion.div>
            )}

            {activeTab === "branches" && (
              <motion.div
                key="branches"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <BranchesModule />
              </motion.div>
            )}

            {activeTab === "promotions" && (
              <motion.div
                key="promotions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <PromotionManagement />
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <AnalyticsOverview />
              </motion.div>
            )}

            {activeTab === "chatbot" && (
              <motion.div
                key="chatbot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <ChatbotInboxModule />
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <SettingsModule />
              </motion.div>
            )}

            {activeTab === "menu" && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <MenuManagement />
              </motion.div>
            )}

            {activeTab === "ai" && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <DemandForecasting />
              </motion.div>
            )}

            {activeTab === "riders" && (
              <motion.div
                key="riders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <RiderModule />
              </motion.div>
            )}

            {activeTab === "support" && (
              <motion.div
                key="support"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <SupportModule />
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <SecurityModule />
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <NotificationModule />
              </motion.div>
            )}

            {activeTab !== "dashboard" && activeTab !== "accounts" && activeTab !== "inventory" && activeTab !== "hr" && activeTab !== "orders" && activeTab !== "bookings" && activeTab !== "branches" && activeTab !== "promotions" && activeTab !== "analytics" && activeTab !== "chatbot" && activeTab !== "settings" && activeTab !== "menu" && activeTab !== "ai" && activeTab !== "riders" && activeTab !== "support" && activeTab !== "security" && activeTab !== "notifications" && activeTab !== "ecommerce" && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-32 text-center"
              >
                <div className="w-24 h-24 bg-surface-strong rounded-full flex items-center justify-center mb-6 text-muted">
                  <Layers size={40} />
                </div>
                <h2 className="text-3xl font-bold text-dark mb-2">{sidebarLinks.find(l => l.id === activeTab)?.name} Module</h2>
                <p className="text-muted max-w-md">This module is currently being populated with real-time data from the Chicken House ERP system.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
