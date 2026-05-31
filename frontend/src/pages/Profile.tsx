import { FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  ChevronRight,
  Gift,
  Heart,
  Home,
  LogOut,
  Plus,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  Trophy,
  User,
  Zap,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageMeta from "../components/layout/PageMeta";
import { useAuth } from "../context/AuthContext";
import { siteConfig } from "../lib/site";

type CustomerProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  memberSince: string;
  loyaltyPoints: number;
  walletBalance: number;
  favoriteCategory: string;
  orderCount: number;
  avatarInitials: string;
  preferences: {
    notifications: boolean;
    promotions: boolean;
    orderUpdates: boolean;
    darkAlerts: boolean;
  };
  addresses: Array<{ id: string; label: string; line: string; note: string }>;
  wishlist: Array<{ id: string; name: string; category: string; price: number; image: string }>;
  walletTransactions: Array<{ id: string; type: string; amount: number; reason: string; time: string }>;
  activity: string[];
};

type CustomerOrder = {
  id: string;
  items: string;
  total: number;
  status: string;
  time: string;
  type: string;
  paymentMethod?: string;
};

type MenuSuggestion = {
  id: string | number;
  name: string;
  category: string;
  image: string;
  price: number;
};

const tabs = [
  { id: "profile", name: "Profile", icon: User },
  { id: "orders", name: "Orders", icon: ShoppingBag },
  { id: "wishlist", name: "Wishlist", icon: Heart },
  { id: "rewards", name: "Rewards", icon: Gift },
  { id: "settings", name: "Settings", icon: Settings },
] as const;

// Reward tier system
const REWARD_TIERS = [
  { name: "Bronze", minPoints: 0, maxPoints: 499, color: "text-amber-700", bg: "bg-amber-100", icon: "🥉", perks: ["1 point per Rs. 100 spent", "Birthday bonus points"] },
  { name: "Silver", minPoints: 500, maxPoints: 1499, color: "text-slate-500", bg: "bg-slate-100", icon: "🥈", perks: ["1.5x points multiplier", "Free delivery on Fridays", "Early menu access"] },
  { name: "Gold", minPoints: 1500, maxPoints: 2999, color: "text-amber-500", bg: "bg-amber-50", icon: "🥇", perks: ["2x points multiplier", "Priority support", "Exclusive deals", "Free dessert monthly"] },
  { name: "Platinum", minPoints: 3000, maxPoints: Infinity, color: "text-purple-600", bg: "bg-purple-50", icon: "💎", perks: ["3x points multiplier", "VIP table reservations", "Chef's special access", "Monthly gift voucher"] },
];

const REWARD_CATALOG = [
  { id: "r1", name: "Free Zinger Burger", points: 200, category: "Food", icon: "🍔" },
  { id: "r2", name: "Rs. 100 Discount", points: 150, category: "Discount", icon: "🏷️" },
  { id: "r3", name: "Free Drink", points: 80, category: "Beverage", icon: "🥤" },
  { id: "r4", name: "Free Delivery", points: 50, category: "Service", icon: "🚗" },
  { id: "r5", name: "Special Platter (2 persons)", points: 500, category: "Food", icon: "🍽️" },
  { id: "r6", name: "Rs. 500 Discount", points: 600, category: "Discount", icon: "💸" },
];

const emptyAddressForm = {
  label: "",
  line: "",
  note: "",
};

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("profile");
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [suggestions, setSuggestions] = useState<MenuSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    favoriteCategory: "",
  });
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const fetchCustomerPanel = async () => {
    setLoading(true);
    setError("");

    try {
      const [customerRes, menuRes] = await Promise.all([
        fetch("/api/customer"),
        fetch("/api/menu"),
      ]);

      const customerData = await customerRes.json();
      const menuData = await menuRes.json();

      if (!customerRes.ok) {
        throw new Error(customerData.message ?? "Customer panel failed to load.");
      }

      setCustomer(customerData.profile);
      setOrders(customerData.orders ?? []);
      setProfileForm({
        name: customerData.profile.name,
        phone: customerData.profile.phone,
        address: customerData.profile.address,
        city: customerData.profile.city,
        favoriteCategory: customerData.profile.favoriteCategory,
      });
      setSuggestions(
        (Array.isArray(menuData) ? menuData : [])
          .filter((item) => item.image)
          .slice(0, 4)
          .map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            image: item.image,
            price: Number(item.startingPrice ?? item.variants?.[0]?.price ?? 0),
          })),
      );
    } catch (fetchError) {
      console.error(fetchError);
      setError("Unable to load your customer panel right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCustomerPanel();
  }, []);

  const summaryCards = useMemo(
    () => [
      { label: "Orders", value: customer?.orderCount ?? orders.length, icon: ShoppingBag },
      { label: "Wishlist", value: customer?.wishlist.length ?? 0, icon: Heart },
      { label: "Points", value: (customer?.loyaltyPoints ?? 0).toLocaleString(), icon: Sparkles },
      { label: "Tier", value: REWARD_TIERS.find(t => (customer?.loyaltyPoints ?? 0) >= t.minPoints && (customer?.loyaltyPoints ?? 0) <= t.maxPoints)?.icon ?? "🥉", icon: Trophy },
    ],
    [customer, orders.length],
  );

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Profile update failed.");
      setCustomer((prev) => (prev ? { ...prev, ...data } : data));
    } catch (saveError) {
      console.error(saveError);
      setError("Unable to update your profile right now.");
    } finally {
      setSaving(false);
    }
  };

  const togglePreference = async (key: keyof CustomerProfile["preferences"]) => {
    if (!customer) return;

    const preferences = {
      ...customer.preferences,
      [key]: !customer.preferences[key],
    };

    setCustomer((prev) => (prev ? { ...prev, preferences } : prev));

    try {
      await fetch("/api/customer/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences }),
      });
    } catch (preferenceError) {
      console.error(preferenceError);
      setError("Unable to update preferences right now.");
    }
  };

  const addAddress = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/customer/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Address save failed.");
      setCustomer((prev) =>
        prev
          ? {
              ...prev,
              addresses: [data, ...prev.addresses],
              address: data.line || prev.address,
            }
          : prev,
      );
      setAddressForm(emptyAddressForm);
    } catch (addressError) {
      console.error(addressError);
      setError("Unable to save the address right now.");
    }
  };

  const removeAddress = async (id: string) => {
    try {
      const response = await fetch(`/api/customer/addresses/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Address delete failed.");
      setCustomer((prev) =>
        prev
          ? {
              ...prev,
              addresses: prev.addresses.filter((address) => address.id !== id),
            }
          : prev,
      );
    } catch (addressError) {
      console.error(addressError);
      setError("Unable to remove the address right now.");
    }
  };

  // Points ko redeem karne ki functionality
  const [redeemSuccess, setRedeemSuccess] = useState("");
  const redeemReward = async (rewardName: string, pointsCost: number) => {
    if (!customer || customer.loyaltyPoints < pointsCost) return;
    setError("");

    try {
      const response = await fetch("/api/customer/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardName, pointsCost }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Reward could not be redeemed.");

      // Server is the source of truth: merge the returned profile / points.
      setCustomer((prev) =>
        data.profile
          ? data.profile
          : prev
            ? { ...prev, loyaltyPoints: data.loyaltyPoints ?? prev.loyaltyPoints }
            : prev,
      );
      setRedeemSuccess(`"${rewardName}" successfully redeemed! Check your orders for confirmation.`);
      setTimeout(() => setRedeemSuccess(""), 4000);
    } catch (redeemError) {
      console.error(redeemError);
      setError(redeemError instanceof Error ? redeemError.message : "Unable to redeem this reward right now.");
    }
  };

  const addWishlistItem = async (item: MenuSuggestion) => {
    try {
      const response = await fetch("/api/customer/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Wishlist add failed.");
      setCustomer((prev) =>
        prev
          ? {
              ...prev,
              wishlist: [data, ...prev.wishlist],
            }
          : prev,
      );
    } catch (wishlistError) {
      console.error(wishlistError);
      setError("Unable to update the wishlist right now.");
    }
  };

  const removeWishlistItem = async (id: string) => {
    try {
      const response = await fetch(`/api/customer/wishlist/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Wishlist delete failed.");
      setCustomer((prev) =>
        prev
          ? {
              ...prev,
              wishlist: prev.wishlist.filter((item) => item.id !== id),
            }
          : prev,
      );
    } catch (wishlistError) {
      console.error(wishlistError);
      setError("Unable to remove the wishlist item right now.");
    }
  };

  if (loading && !customer) {
    return <div className="min-h-screen bg-paper pt-40 text-center text-muted">Loading customer panel...</div>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f7edd8_0%,#fffdf8_40%,#fffaf2_100%)]">
      <PageMeta
        title="My Account | Chicken House"
        description="Manage your Chicken House profile, orders, addresses, wishlist, and wallet."
      />

      <section className="pb-24 pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
            <div className="space-y-8 lg:col-span-1">
              <div className="overflow-hidden rounded-[3rem] border border-gray-100 bg-white p-8 text-center shadow-xl shadow-dark/5">
                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-surface-strong text-4xl font-display font-bold text-dark shadow-xl">
                  {customer?.avatarInitials ?? "CH"}
                </div>
                <h2 className="mt-5 text-3xl font-bold text-dark">{customer?.name ?? user?.name ?? "Guest"}</h2>
                <p className="mt-2 text-sm text-muted">
                  Customer account • Member since {customer?.memberSince ?? user?.memberSince ?? "2024"}
                </p>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {summaryCards.map((card) => (
                    <div key={card.label} className="rounded-[1.7rem] bg-surface p-4">
                      <card.icon size={18} className="mx-auto text-primary" />
                      <p className="mt-3 text-lg font-bold text-dark">{card.value}</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted">{card.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[3rem] border border-gray-100 bg-white p-5 shadow-xl shadow-dark/5">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group flex w-full items-center justify-between rounded-2xl p-4 transition ${activeTab === tab.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted hover:bg-surface"}`}
                  >
                    <div className="flex items-center gap-4">
                      <tab.icon size={20} />
                      <span className="font-bold">{tab.name}</span>
                    </div>
                    <ChevronRight size={18} className={`${activeTab === tab.id ? "rotate-90" : "group-hover:translate-x-1"} transition`} />
                  </button>
                ))}

                <button
                  onClick={() => {
                    void logout().then(() => navigate("/login"));
                  }}
                  className="mt-2 flex w-full items-center gap-4 rounded-2xl p-4 font-bold text-red-500 transition hover:bg-red-50"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            </div>

            <div className="lg:col-span-3">
              {error && (
                <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              <AnimatePresence mode="wait">
                {activeTab === "profile" && customer && (
                  <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="rounded-[3rem] border border-gray-100 bg-white p-10 shadow-xl shadow-dark/5">
                      <div className="mb-10 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Profile Overview</p>
                          <h2 className="mt-3 text-3xl font-bold text-dark">Personal Information</h2>
                        </div>
                        <Link to="/track" className="font-bold text-primary hover:underline">
                          Track an order
                        </Link>
                      </div>

                      <form onSubmit={saveProfile} className="grid gap-6 md:grid-cols-2">
                        {[
                          { key: "name", label: "Full Name" },
                          { key: "phone", label: "Phone Number" },
                          { key: "address", label: "Default Address" },
                          { key: "city", label: "City" },
                          { key: "favoriteCategory", label: "Favorite Category" },
                        ].map((field) => (
                          <div key={field.key} className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-[0.24em] text-muted">{field.label}</label>
                            <input
                              value={profileForm[field.key as keyof typeof profileForm]}
                              onChange={(e) =>
                                setProfileForm((prev) => ({
                                  ...prev,
                                  [field.key]: e.target.value,
                                }))
                              }
                              className="w-full rounded-2xl bg-surface px-5 py-4 outline-none"
                            />
                          </div>
                        ))}
                        <div className="md:col-span-2">
                          <button type="submit" disabled={saving} className="rounded-full bg-primary px-8 py-4 font-bold text-white transition hover:bg-primary-strong">
                            {saving ? "Saving..." : "Save Profile"}
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                      <div className="rounded-[3rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5">
                        <h3 className="text-2xl font-bold text-dark">Activity Feed</h3>
                        <div className="mt-6 space-y-4">
                          {customer.activity.map((item) => (
                            <div key={item} className="rounded-2xl bg-surface px-4 py-4 text-sm leading-7 text-dark">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[3rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5">
                        <h3 className="text-2xl font-bold text-dark">Saved Addresses</h3>
                        <form onSubmit={addAddress} className="mt-6 space-y-4">
                          <input value={addressForm.label} onChange={(e) => setAddressForm((prev) => ({ ...prev, label: e.target.value }))} placeholder="Address label" className="w-full rounded-2xl bg-surface px-5 py-4 outline-none" />
                          <input value={addressForm.line} onChange={(e) => setAddressForm((prev) => ({ ...prev, line: e.target.value }))} placeholder="Address line" className="w-full rounded-2xl bg-surface px-5 py-4 outline-none" />
                          <input value={addressForm.note} onChange={(e) => setAddressForm((prev) => ({ ...prev, note: e.target.value }))} placeholder="Delivery note" className="w-full rounded-2xl bg-surface px-5 py-4 outline-none" />
                          <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-dark px-6 py-3 font-bold text-white">
                            <Plus size={16} />
                            Add Address
                          </button>
                        </form>
                        <div className="mt-6 space-y-3">
                          {customer.addresses.map((address) => (
                            <div key={address.id} className="flex items-start justify-between rounded-2xl bg-surface p-4">
                              <div>
                                <p className="font-bold text-dark">{address.label}</p>
                                <p className="text-sm text-muted">{address.line}</p>
                                <p className="text-xs text-muted">{address.note}</p>
                              </div>
                              <button onClick={() => removeAddress(address.id)} className="text-red-500">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "orders" && (
                  <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="rounded-[3rem] border border-gray-100 bg-white p-10 shadow-xl shadow-dark/5">
                      <div className="mb-8 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">My Orders</p>
                          <h2 className="mt-3 text-3xl font-bold text-dark">Order history and live tracking</h2>
                        </div>
                        <button onClick={() => void fetchCustomerPanel()} className="rounded-full bg-surface px-5 py-3 text-sm font-bold text-dark">
                          Refresh
                        </button>
                      </div>

                      <div className="space-y-5">
                        {orders.map((order) => (
                          <div key={order.id} className="rounded-[2rem] border border-gray-100 bg-surface p-6">
                            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">{order.id}</p>
                                <h3 className="mt-2 text-2xl font-bold text-dark">{order.items}</h3>
                                <p className="mt-2 text-sm text-muted">{new Date(order.time).toLocaleString("en-PK")}</p>
                              </div>
                              <div className="flex flex-wrap gap-3">
                                <span className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-dark">{order.type}</span>
                                <span className="rounded-full bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-primary">{order.status}</span>
                                <span className="rounded-full bg-dark px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white">Rs. {order.total.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="mt-5 flex justify-end">
                              <Link to={`/track?orderId=${order.id}`} className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white">
                                Track Order
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "wishlist" && customer && (
                  <motion.div key="wishlist" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="rounded-[3rem] border border-gray-100 bg-white p-10 shadow-xl shadow-dark/5">
                      <h2 className="text-3xl font-bold text-dark">Wishlist & Favorites</h2>
                      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {customer.wishlist.map((item) => (
                          <div key={item.id} className="overflow-hidden rounded-[2rem] border border-gray-100 bg-surface">
                            <img src={item.image || siteConfig.imageFallback} alt={item.name} className="h-52 w-full object-cover" referrerPolicy="no-referrer" onError={(event) => { event.currentTarget.src = siteConfig.imageFallback; }} />
                            <div className="p-5">
                              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{item.category}</p>
                              <h3 className="mt-2 text-xl font-bold text-dark">{item.name}</h3>
                              <div className="mt-4 flex items-center justify-between">
                                <span className="font-bold text-dark">Rs. {item.price.toLocaleString()}</span>
                                <button onClick={() => removeWishlistItem(item.id)} className="text-red-500">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[3rem] border border-gray-100 bg-white p-10 shadow-xl shadow-dark/5">
                      <h3 className="text-2xl font-bold text-dark">Recommended Additions</h3>
                      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                        {suggestions.map((item) => (
                          <div key={String(item.id)} className="overflow-hidden rounded-[2rem] border border-gray-100 bg-surface">
                            <img src={item.image || siteConfig.imageFallback} alt={item.name} className="h-44 w-full object-cover" referrerPolicy="no-referrer" onError={(event) => { event.currentTarget.src = siteConfig.imageFallback; }} />
                            <div className="p-4">
                              <p className="text-sm font-bold text-dark">{item.name}</p>
                              <p className="mt-1 text-xs text-muted">{item.category}</p>
                              <button onClick={() => addWishlistItem(item)} className="mt-4 rounded-full bg-dark px-4 py-2 text-xs font-bold text-white">
                                Add To Wishlist
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "rewards" && (
                  <motion.div key="rewards" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    
                    {/* Points Balance Banner */}
                    <div className="rounded-[3rem] bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-10 text-white shadow-xl shadow-orange-500/30 relative overflow-hidden">
                      <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                      <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                          <Star size={20} className="text-white/80" />
                          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/80">Reward Points Balance</p>
                        </div>
                        <p className="text-6xl font-display font-bold mt-2">{(customer?.loyaltyPoints ?? 0).toLocaleString()}</p>
                        <p className="text-white/70 text-sm mt-2">points available to redeem</p>
                        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2 text-sm font-bold">
                          <Zap size={14} />
                          Earn 1 point per Rs. 100 spent
                        </div>
                      </div>
                    </div>

                    {/* Redeem Success Message */}
                    {redeemSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700 flex items-center gap-3"
                      >
                        <Sparkles size={16} />
                        {redeemSuccess}
                      </motion.div>
                    )}

                    {/* Tier Progress */}
                    <div className="rounded-[3rem] border border-gray-100 bg-white p-10 shadow-xl shadow-dark/5">
                      <div className="mb-8">
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Your Tier Progress</p>
                        <h2 className="mt-3 text-3xl font-bold text-dark">Loyalty Tiers</h2>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {REWARD_TIERS.map((tier) => {
                          const pts = customer?.loyaltyPoints ?? 0;
                          const isActive = pts >= tier.minPoints && pts <= tier.maxPoints;
                          const isUnlocked = pts >= tier.minPoints;
                          return (
                            <div
                              key={tier.name}
                              className={`rounded-[2rem] p-6 border-2 transition-all ${
                                isActive
                                  ? "border-orange-400 bg-orange-50 shadow-lg shadow-orange-100"
                                  : isUnlocked
                                  ? "border-gray-200 bg-surface"
                                  : "border-dashed border-gray-200 bg-gray-50 opacity-60"
                              }`}
                            >
                              <div className="text-4xl mb-3">{tier.icon}</div>
                              <div className="flex items-center justify-between mb-1">
                                <h3 className={`text-lg font-bold ${isActive ? "text-orange-600" : "text-dark"}`}>{tier.name}</h3>
                                {isActive && (
                                  <span className="text-xs font-bold bg-orange-500 text-white px-2 py-1 rounded-full">Current</span>
                                )}
                              </div>
                              <p className="text-xs text-muted mb-4">{tier.minPoints}+ points</p>
                              <ul className="space-y-2">
                                {tier.perks.map((perk) => (
                                  <li key={perk} className="text-xs text-dark flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5">✓</span>
                                    {perk}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reward Catalog */}
                    <div className="rounded-[3rem] border border-gray-100 bg-white p-10 shadow-xl shadow-dark/5">
                      <div className="mb-8 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Redeem Points</p>
                          <h2 className="mt-3 text-3xl font-bold text-dark">Reward Catalog</h2>
                        </div>
                        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-5 py-3 text-center">
                          <p className="text-xs text-muted font-bold">Available</p>
                          <p className="text-xl font-bold text-amber-600">{(customer?.loyaltyPoints ?? 0).toLocaleString()} pts</p>
                        </div>
                      </div>
                      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {REWARD_CATALOG.map((reward) => {
                          const canRedeem = (customer?.loyaltyPoints ?? 0) >= reward.points;
                          return (
                            <div
                              key={reward.id}
                              className={`rounded-[2rem] border p-6 flex flex-col justify-between transition-all ${
                                canRedeem
                                  ? "border-gray-100 bg-surface hover:shadow-lg hover:-translate-y-1"
                                  : "border-dashed border-gray-200 bg-gray-50 opacity-70"
                              }`}
                            >
                              <div>
                                <div className="text-4xl mb-4">{reward.icon}</div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">{reward.category}</span>
                                <h3 className="mt-2 text-xl font-bold text-dark">{reward.name}</h3>
                              </div>
                              <div className="mt-6 flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <Star size={14} className="text-amber-500" />
                                  <span className="font-bold text-dark">{reward.points} pts</span>
                                </div>
                                <button
                                  onClick={() => redeemReward(reward.name, reward.points)}
                                  disabled={!canRedeem}
                                  className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${
                                    canRedeem
                                      ? "bg-primary text-white hover:bg-primary-strong"
                                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                  }`}
                                >
                                  {canRedeem ? "Redeem" : "Need more pts"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* How to Earn Points */}
                    <div className="rounded-[3rem] border border-gray-100 bg-white p-10 shadow-xl shadow-dark/5">
                      <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Earn More</p>
                      <h2 className="mt-3 text-3xl font-bold text-dark mb-8">How to Earn Points</h2>
                      <div className="grid gap-4 md:grid-cols-2">
                        {[
                          { icon: "🍗", title: "Place an Order", desc: "Earn 1 point for every Rs. 100 spent on food orders.", pts: "+1 pt / Rs.100" },
                          { icon: "📅", title: "Table Booking", desc: "Get bonus points every time you book a table.", pts: "+25 pts" },
                          { icon: "⭐", title: "Write a Review", desc: "Leave an honest review and earn reward points.", pts: "+50 pts" },
                          { icon: "🎂", title: "Birthday Bonus", desc: "We gift you extra points on your birthday month.", pts: "+100 pts" },
                          { icon: "👥", title: "Refer a Friend", desc: "Invite friends — earn points when they order.", pts: "+75 pts" },
                          { icon: "📱", title: "App Check-in", desc: "Check in at the restaurant to earn bonus points.", pts: "+10 pts" },
                        ].map((item) => (
                          <div key={item.title} className="flex items-start gap-5 rounded-[2rem] bg-surface p-6">
                            <div className="text-3xl shrink-0">{item.icon}</div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold text-dark">{item.title}</h3>
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">{item.pts}</span>
                              </div>
                              <p className="text-sm text-muted">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </motion.div>
                )}

                {activeTab === "settings" && customer && (
                  <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="rounded-[3rem] border border-gray-100 bg-white p-10 shadow-xl shadow-dark/5">
                      <h2 className="text-3xl font-bold text-dark">Settings & Preferences</h2>
                      <div className="mt-8 grid gap-5 md:grid-cols-2">
                        {[
                          { key: "notifications", label: "General notifications", icon: Bell },
                          { key: "promotions", label: "Promotions and deals", icon: Sparkles },
                          { key: "orderUpdates", label: "Order status updates", icon: ShoppingBag },
                          { key: "darkAlerts", label: "Priority service alerts", icon: Home },
                        ].map((item) => (
                          <button key={item.key} onClick={() => togglePreference(item.key as keyof CustomerProfile["preferences"])} className="flex items-center justify-between rounded-[2rem] border border-gray-100 bg-surface px-5 py-5 text-left">
                            <div className="flex items-center gap-4">
                              <item.icon size={18} className="text-primary" />
                              <span className="font-bold text-dark">{item.label}</span>
                            </div>
                            <span className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] ${customer.preferences[item.key as keyof CustomerProfile["preferences"]] ? "bg-green-500/10 text-green-600" : "bg-gray-200 text-muted"}`}>
                              {customer.preferences[item.key as keyof CustomerProfile["preferences"]] ? "On" : "Off"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
