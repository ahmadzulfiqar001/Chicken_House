import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar,
  Menu,
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
  Shield,
  Briefcase
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import AccountsModule from "../components/admin/AccountsModule";
import BranchesModule from "../components/admin/BranchesModule";
import EcommerceModule from "../components/admin/EcommerceModule";
import SettingsModule from "../components/admin/SettingsModule";
import DemandForecasting from "../components/admin/DemandForecasting";
import RiderModule from "../components/admin/RiderModule";
import SupportModule from "../components/admin/SupportModule";
import SecurityModule from "../components/admin/SecurityModule";
import NotificationModule, { type NotificationTarget } from "../components/admin/NotificationModule";
import CareersModule from "../components/admin/CareersModule";
import MenuManagement from "../components/admin/MenuManagement";
import HRManagement from "../components/admin/HRManagement";
import UserManagement from "../components/admin/UserManagement";
import InventoryManagement from "../components/admin/InventoryManagement";
import PromotionManagement from "../components/admin/PromotionManagement";
import AnalyticsOverview from "../components/admin/AnalyticsOverview";
import OrderManagement from "../components/admin/OrderManagement";
import BookingManagement from "../components/admin/BookingManagement";
import ChatbotInboxModule from "../components/admin/ChatbotInboxModule";
import StaffWorkspace from "../components/admin/StaffWorkspace";
import ManagerWorkspace from "../components/admin/ManagerWorkspace";
import { useAuth, UserRole } from "../context/AuthContext";
import { useRealtime } from "../lib/realtime";

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
  | "careers"
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
  { id: "hr", name: "HR & Workforce", icon: <Users size={20} />, allow: ["admin", "manager", "hr"] },
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
  { id: "careers", name: "Careers", icon: <Briefcase size={20} />, allow: ["admin", "manager"] },
  { id: "settings", name: "Settings", icon: <Settings size={20} />, allow: ["admin"] },
];

const PANEL_META: Record<UserRole, { title: string; authority: string }> = {
  admin: { title: "Admin Panel", authority: "Admin Authority" },
  manager: { title: "Manager Panel", authority: "Operations Access" },
  hr: { title: "HR Panel", authority: "Workforce Access" },
  rider: { title: "Rider Panel", authority: "Delivery Access" },
  staff: { title: "Staff Panel", authority: "Task-Based Access" },
  user: { title: "Customer Panel", authority: "Customer Access" },
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<DashboardTabId>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationTarget, setNotificationTarget] = useState<(NotificationTarget & { nonce: number }) | null>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentRole = user?.role ?? "admin";
  const staffWorkspaceRoles: UserRole[] = ["rider", "staff"];

  const sidebarLinks = useMemo(
    () => DASHBOARD_LINKS.filter((link) => link.allow.includes(currentRole)),
    [currentRole],
  );

  // Live dashboard data (admin / manager only).
  const [overview, setOverview] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardSearch, setDashboardSearch] = useState("");

  useEffect(() => {
    if (!sidebarLinks.some((link) => link.id === activeTab)) {
      setActiveTab(sidebarLinks[0]?.id ?? "dashboard");
    }
  }, [activeTab, sidebarLinks]);

  const fetchDashboard = async () => {
    setLoadingDashboard(true);
    try {
      const [overviewRes, ordersRes] = await Promise.all([
        fetch("/api/operations/overview"),
        fetch("/api/orders"),
      ]);
      if (overviewRes.ok) {
        setOverview(await overviewRes.json());
      }
      if (ordersRes.ok) {
        setOrders(await ordersRes.json());
      }
    } catch (fetchError) {
      console.error("Dashboard data could not be loaded.", fetchError);
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    if (currentRole === "admin" || currentRole === "manager") {
      void fetchDashboard();
    } else {
      setLoadingDashboard(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRole]);

  // Live updates: refresh KPIs and the recent-orders list whenever orders change.
  useRealtime("orders", () => {
    if (currentRole === "admin" || currentRole === "manager") {
      void fetchDashboard();
    }
  });

  const formatRs = (amount) =>
    `Rs. ${Number(amount ?? 0).toLocaleString("en-PK")}`;

  const relativeTime = (iso) => {
    if (!iso) return "";
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return iso;
    const diffMs = Date.now() - then;
    const mins = Math.round(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.round(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  };

  const overviewStats = overview?.stats ?? {};
  const lowStockCount = overviewStats.lowStockCount ?? 0;

  const stats = useMemo(() => {
    return [
      { name: "Total Sales", value: formatRs(overviewStats.todayRevenue), change: "Today", icon: <DollarSign size={24} />, color: "bg-green-500/10 text-green-500" },
      { name: "Active Orders", value: String(overviewStats.activeOrders ?? 0), change: "Live", icon: <ShoppingCart size={24} />, color: "bg-blue-500/10 text-blue-500" },
      { name: "New Customers", value: String(overviewStats.customerAccounts ?? 0), change: "Total", icon: <UserPlus size={24} />, color: "bg-purple-500/10 text-purple-500" },
      { name: "Inventory Alerts", value: String(lowStockCount), change: lowStockCount > 0 ? "Action" : "Stable", icon: <Package size={24} />, color: "bg-red-500/10 text-red-500" },
    ];
  }, [overview]);

  const recentOrders = useMemo(() => {
    const mapped = (orders ?? []).slice(0, 5).map((order) => ({
      id: order.id,
      customer: order.customer,
      items: order.items,
      total: Number(order.total ?? 0).toLocaleString("en-PK"),
      status: order.status,
      time: relativeTime(order.time),
    }));
    const query = dashboardSearch.trim().toLowerCase();
    if (!query) return mapped;
    return mapped.filter((order) =>
      `${order.id} ${order.customer} ${order.items} ${order.status}`.toLowerCase().includes(query),
    );
  }, [orders, dashboardSearch]);

  const quickActions = useMemo<
    Array<{ label: string; icon: ReactNode; tab: DashboardTabId; className: string }>
  >(() => {
    return [
      { label: "Add Item", icon: <Utensils size={24} />, tab: "menu", className: "bg-primary/5 text-primary hover:bg-primary hover:text-white" },
      { label: "Add Staff", icon: <Users size={24} />, tab: "hr", className: "bg-accent/5 text-accent hover:bg-accent hover:text-dark" },
      { label: "Reports", icon: <TrendingUp size={24} />, tab: "analytics", className: "bg-green-500/5 text-green-500 hover:bg-green-500 hover:text-white" },
      { label: "Notify", icon: <Bell size={24} />, tab: "notifications", className: "bg-purple-500/5 text-purple-500 hover:bg-purple-500 hover:text-white" },
    ];
  }, [currentRole]);

  const spotlightCard = useMemo<{
    title: string;
    text: string;
    button: string;
    tab: DashboardTabId;
    icon: ReactNode;
  }>(() => {
    return {
      title: "Inventory Alert",
      text: `${lowStockCount} items are below the safety threshold.`,
      button: "Manage Stock",
      tab: "inventory",
      icon: <Package size={32} className="mb-4" />,
    };
  }, [lowStockCount]);

  const openNotificationTarget = (target: NotificationTarget) => {
    const targetTab = target.tab as DashboardTabId;

    if (!sidebarLinks.some((link) => link.id === targetTab)) {
      setActiveTab("notifications");
      return;
    }

    setNotificationTarget({ ...target, nonce: Date.now() });
    setActiveTab(targetTab);
    setIsSidebarOpen(false);
  };

  // Role-based shells — after all hooks (Rules of Hooks).
  if (staffWorkspaceRoles.includes(currentRole)) {
    return <StaffWorkspace />;
  }
  if (currentRole === "manager") {
    return <ManagerWorkspace />;
  }

  const panelMeta = PANEL_META[currentRole];

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (off-canvas drawer on mobile, fixed rail on desktop) */}
      <aside
        className={`fixed h-full w-[280px] z-50 bg-dark text-white flex flex-col transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-6 flex items-center gap-4 mb-2 shrink-0">
          <img
            src="/logo.jpg"
            alt="Chicken House"
            className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-lg border border-white/10"
          />
          <span className="font-display text-xl font-bold whitespace-nowrap">
            {panelMeta.title}
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {sidebarLinks.map((link) => (
            <motion.button
              key={link.id}
              whileHover={{ x: 5 }}
              onClick={() => {
                setActiveTab(link.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                activeTab === link.id
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="shrink-0">{link.icon}</div>
              <span className="font-medium">{link.name}</span>
            </motion.button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center gap-4 p-4 rounded-xl text-white/60 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 transition-all duration-300 md:ml-[280px]">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 px-4 sm:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-muted"
              aria-label="Toggle navigation menu"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-bold text-dark capitalize">{activeTab}</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                placeholder="Search anything..."
                value={dashboardSearch}
                onChange={(event) => setDashboardSearch(event.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg bg-surface border border-transparent focus:border-primary focus:bg-white transition-all outline-none text-sm w-64"
              />
            </div>
            <button
              onClick={() => setActiveTab("notifications")}
              aria-label="View notifications"
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors text-muted"
            >
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
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                          stat.change.startsWith("+")
                            ? "bg-green-500/10 text-green-500"
                            : stat.change.startsWith("-") || stat.change === "Action"
                              ? "bg-red-500/10 text-red-500"
                              : "bg-surface text-muted"
                        }`}>
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
                      <button onClick={() => setActiveTab("orders")} className="text-primary font-bold text-sm hover:underline">View All</button>
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
                          {loadingDashboard ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-muted text-sm">Loading orders...</td>
                            </tr>
                          ) : recentOrders.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-muted text-sm">
                                {dashboardSearch.trim() ? "No matching orders." : "No orders yet."}
                              </td>
                            </tr>
                          ) : (
                            recentOrders.map((order, index) => (
                            <tr key={index} className="group hover:bg-surface transition-colors">
                              <td className="py-4 font-bold text-dark">{order.id}</td>
                              <td className="py-4 text-muted">{order.customer}</td>
                              <td className="py-4 text-muted truncate max-w-[150px]">{order.items}</td>
                              <td className="py-4 font-bold text-dark">Rs. {order.total}</td>
                              <td className="py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  order.status === "Delivered" ? "bg-green-500/10 text-green-500" :
                                  order.status === "Cooking" || order.status === "Preparing" ? "bg-blue-500/10 text-blue-500" :
                                  order.status === "Pending" ? "bg-yellow-500/10 text-yellow-500" :
                                  "bg-primary/10 text-primary"
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-4 text-muted text-xs">{order.time}</td>
                            </tr>
                            ))
                          )}
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
                            onClick={() => setActiveTab(action.tab)}
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
                        <button onClick={() => setActiveTab(spotlightCard.tab)} className="w-full py-3 rounded-xl bg-white text-primary font-bold hover:bg-accent hover:text-dark transition-colors">
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
                <InventoryManagement
                  focusItemId={notificationTarget?.tab === "inventory" ? notificationTarget.id : undefined}
                />
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
                <OrderManagement
                  focusOrderId={notificationTarget?.tab === "orders" ? notificationTarget.id : undefined}
                />
              </motion.div>
            )}

            {activeTab === "bookings" && (
              <motion.div
                key="bookings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <BookingManagement
                  focusBookingId={notificationTarget?.tab === "bookings" ? notificationTarget.id : undefined}
                />
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
                <SupportModule
                  focusTicketId={notificationTarget?.tab === "support" ? notificationTarget.id : undefined}
                />
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
                <NotificationModule onOpenRelated={openNotificationTarget} />
              </motion.div>
            )}

            {activeTab === "careers" && (
              <motion.div
                key="careers"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <CareersModule
                  focusApplicationId={notificationTarget?.tab === "careers" ? notificationTarget.id : undefined}
                />
              </motion.div>
            )}

            {activeTab !== "dashboard" && activeTab !== "accounts" && activeTab !== "inventory" && activeTab !== "hr" && activeTab !== "orders" && activeTab !== "bookings" && activeTab !== "branches" && activeTab !== "promotions" && activeTab !== "analytics" && activeTab !== "chatbot" && activeTab !== "settings" && activeTab !== "menu" && activeTab !== "ai" && activeTab !== "riders" && activeTab !== "support" && activeTab !== "security" && activeTab !== "notifications" && activeTab !== "careers" && activeTab !== "ecommerce" && (
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
