import { useEffect, useMemo, useState } from "react";
import { ShoppingCart, Package, Truck, CreditCard, Search, Filter, Download, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const formatCurrency = (value) => `Rs. ${Number(value ?? 0).toLocaleString()}`;

const EcommerceModule = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message ?? "Failed to load orders.");
      }
      setOrders(data);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Online orders could not be loaded right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return order.id.toLowerCase().includes(q) || (order.customer ?? "").toLowerCase().includes(q);
  });

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const revenue = orders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
    const pending = orders.filter((order) => order.status === "Pending").length;
    const inTransit = orders.filter((order) => order.status === "Out for Delivery").length;
    return { totalOrders, revenue, pending, inTransit };
  }, [orders]);

  const exportCsv = () => {
    const header = ["Order ID", "Customer", "Items", "Total", "Status", "Payment", "Time"];
    const rows = filteredOrders.map((order) => [
      order.id,
      order.customer ?? "",
      order.items ?? "",
      String(order.total ?? 0),
      order.status ?? "",
      order.paymentMethod ?? "",
      order.time ?? "",
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replaceAll(`"`, `""`)}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "chicken-house-online-orders.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-dark">E-commerce Management</h2>
          <p className="text-muted">Manage online orders, shipping, and delivery.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportCsv}
            className="px-6 py-3 bg-white text-dark rounded-xl font-bold flex items-center gap-2 shadow-sm border border-gray-100"
          >
            <Download size={20} />
            Export Orders
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <ShoppingCart size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-muted uppercase tracking-widest">Total Orders</p>
              <h3 className="text-2xl font-bold text-dark">{stats.totalOrders.toLocaleString()}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-500 text-sm font-bold">
            <ArrowUpRight size={16} />
            <span>All online orders</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-muted uppercase tracking-widest">Revenue</p>
              <h3 className="text-2xl font-bold text-dark">{formatCurrency(stats.revenue)}</h3>
            </div>
          </div>
          <p className="text-muted text-xs">Online sales only</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-500 flex items-center justify-center">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-muted uppercase tracking-widest">Pending</p>
              <h3 className="text-2xl font-bold text-dark">{stats.pending}</h3>
            </div>
          </div>
          <p className="text-muted text-xs">Awaiting processing</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center">
              <Truck size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-muted uppercase tracking-widest">In Transit</p>
              <h3 className="text-2xl font-bold text-dark">{stats.inTransit}</h3>
            </div>
          </div>
          <p className="text-muted text-xs">Out for delivery</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="Search online orders..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-3 rounded-xl bg-surface text-dark font-bold flex items-center gap-2 hover:bg-surface-strong transition-all">
              <Filter size={18} />
              Filter
            </button>
          </div>
        </div>

        {error ? <div className="px-8 py-4 text-sm font-medium text-red-500">{error}</div> : null}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface text-muted text-xs font-bold uppercase tracking-widest">
                <th className="px-8 py-4">Order ID</th>
                <th className="px-8 py-4">Customer</th>
                <th className="px-8 py-4">Items</th>
                <th className="px-8 py-4">Total</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Payment</th>
                <th className="px-8 py-4">Time</th>
                <th className="px-8 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-8 py-6 font-mono text-sm">{order.id}</td>
                  <td className="px-8 py-6 font-bold text-dark">{order.customer}</td>
                  <td className="px-8 py-6 text-sm text-muted">{order.items}</td>
                  <td className="px-8 py-6 font-bold text-primary">{formatCurrency(order.total)}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      order.status === 'Delivered' ? 'bg-green-50 text-green-500' :
                      order.status === 'Preparing' || order.status === 'Confirmed' ? 'bg-blue-50 text-blue-500' :
                      order.status === 'Out for Delivery' || order.status === 'Pending' ? 'bg-yellow-50 text-yellow-500' : 'bg-red-50 text-red-500'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm text-muted">{order.paymentMethod || "N/A"}</td>
                  <td className="px-8 py-6 text-sm text-muted">{order.time ? new Date(order.time).toLocaleString("en-PK") : "-"}</td>
                  <td className="px-8 py-6">
                    <button onClick={() => navigate(`/track?orderId=${order.id}`)} className="text-primary font-bold hover:underline">Track Order</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && filteredOrders.length === 0 ? (
            <div className="p-10 text-center text-muted">
              {orders.length === 0 ? "No online orders yet." : "No orders matched your search."}
            </div>
          ) : null}

          {loading ? <div className="p-10 text-center text-muted">Loading online orders...</div> : null}
        </div>
      </div>
    </div>
  );
};

export default EcommerceModule;
