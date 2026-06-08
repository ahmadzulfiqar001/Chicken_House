import { FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useRealtime } from "../../lib/realtime";
import { printReceipt } from "../../lib/receiptPrint";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Printer,
  ReceiptText,
  RefreshCw,
  Search,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import { useToast } from "../layout/ToastProvider";

type OrderStatus = "Pending" | "Confirmed" | "Preparing" | "Out for Delivery" | "Delivered" | "Cancelled";
type OrderType = "Delivery" | "Dine-in" | "Takeaway";

type OrderDetail = {
  name: string;
  quantity: number;
  price: number;
  variantLabel?: string;
};

type OrderRecord = {
  id: string;
  customer: string;
  customerEmail?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentReference?: string;
  paymentVerifiedBy?: string;
  notes?: string;
  items: string;
  subtotal?: number;
  deliveryFee?: number;
  total: number;
  status: OrderStatus;
  time: string;
  type: OrderType;
  details?: OrderDetail[];
  assignedStaffId?: number;
  assignedStaffName?: string;
  assignedRole?: string;
};

type StaffAssignment = {
  id: number;
  name: string;
  role: string;
};

type FilterStatus = "All" | "Pending" | "Processing" | "Delivered" | "Cancelled";

const emptyForm = {
  customer: "",
  customerEmail: "",
  customerPhone: "",
  deliveryAddress: "",
  paymentMethod: "Cash on Delivery",
  items: "",
  subtotal: "0",
  deliveryFee: "0",
  status: "Pending" as OrderStatus,
  type: "Delivery" as OrderType,
  notes: "",
  assignedRole: "",
  assignedStaffId: "0",
};

const statusStyles: Record<OrderStatus, string> = {
  Pending: "bg-yellow-500/10 text-yellow-600",
  Confirmed: "bg-emerald-500/10 text-emerald-600",
  Preparing: "bg-blue-500/10 text-blue-600",
  "Out for Delivery": "bg-purple-500/10 text-purple-600",
  Delivered: "bg-green-500/10 text-green-600",
  Cancelled: "bg-red-500/10 text-red-500",
};

const statusFilters: Array<{ id: FilterStatus; label: string }> = [
  { id: "All", label: "All Orders" },
  { id: "Pending", label: "Pending" },
  { id: "Processing", label: "Processing" },
  { id: "Delivered", label: "Delivered" },
  { id: "Cancelled", label: "Cancelled" },
];

const normalizePhone = (value: string) => value.replace(/[^\d+]/g, "");

const buildItemsSummary = (details: OrderDetail[] | undefined, fallback: string) => {
  if (!details?.length) {
    return fallback;
  }

  return details
    .map((item) => `${item.quantity}x ${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ""}`)
    .join(", ");
};

const formatCurrency = (value: number) => `Rs. ${Number(value ?? 0).toLocaleString()}`;

const OrderManagement = ({ focusOrderId }: { focusOrderId?: string } = {}) => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("All");
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<OrderRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [staffOptions, setStaffOptions] = useState<StaffAssignment[]>([]);

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
      const message = "Orders could not be loaded right now.";
      setError(message);
      showToast({
        tone: "error",
        title: "Orders unavailable",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrders();
  }, []);

  // Live updates: refetch whenever an order changes anywhere (any client / kitchen).
  useRealtime("orders", () => {
    void fetchOrders();
  });

  useEffect(() => {
    if (!focusOrderId) return;

    setStatusFilter("All");
    setSearchQuery(focusOrderId);

    const targetOrder = orders.find((order) => order.id === focusOrderId);
    if (targetOrder) {
      setSelectedOrder(targetOrder);
    }
  }, [focusOrderId, orders]);

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const response = await fetch("/api/hr");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message ?? "Failed to load staff.");
        }
        setStaffOptions(data);
      } catch (staffError) {
        console.error(staffError);
      }
    };

    void loadStaff();
  }, []);

  const filteredOrders = useMemo(() => {
    const loweredSearch = searchQuery.toLowerCase();

    return orders.filter((order) => {
      const matchesSearch = [
        order.customer,
        order.customerEmail ?? "",
        order.customerPhone ?? "",
        order.id,
        order.items,
        order.type,
        order.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(loweredSearch);

      if (!matchesSearch) {
        return false;
      }

      if (statusFilter === "All") {
        return true;
      }

      if (statusFilter === "Processing") {
        return order.status === "Preparing" || order.status === "Out for Delivery";
      }

      return order.status === statusFilter;
    });
  }, [orders, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const pending = orders.filter((order) => order.status === "Pending").length;
    const processing = orders.filter(
      (order) => order.status === "Preparing" || order.status === "Out for Delivery",
    ).length;
    const completed = orders.filter((order) => order.status === "Delivered").length;
    const revenue = orders
      .filter((order) => order.status !== "Cancelled")
      .reduce((sum, order) => sum + Number(order.total ?? 0), 0);

    return { pending, processing, completed, revenue };
  }, [orders]);

  const assignableStaff = useMemo(() => {
    if (!form.assignedRole) {
      return staffOptions;
    }

    const roleMap: Record<string, string[]> = {
      rider: ["Rider", "Rider / Delivery Staff"],
      manager: ["Manager", "Manager / Branch Supervisor"],
      staff: ["General Staff", "General Staff / Operations"],
    };

    return staffOptions.filter((member) =>
      (roleMap[form.assignedRole] ?? []).includes(member.role),
    );
  }, [form.assignedRole, staffOptions]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (order: OrderRecord) => {
    setEditing(order);
    setForm({
      customer: order.customer,
      customerEmail: order.customerEmail ?? "",
      customerPhone: order.customerPhone ?? "",
      deliveryAddress: order.deliveryAddress ?? "",
      paymentMethod: order.paymentMethod ?? "Cash on Delivery",
      items: buildItemsSummary(order.details, order.items),
      subtotal: String(order.subtotal ?? Math.max(0, order.total - Number(order.deliveryFee ?? 0))),
      deliveryFee: String(order.deliveryFee ?? 0),
      status: order.status,
      type: order.type,
      notes: order.notes ?? "",
      assignedRole: order.assignedRole ?? "",
      assignedStaffId: String(order.assignedStaffId ?? 0),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const saveOrder = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const subtotal = Math.max(0, Number(form.subtotal));
    const deliveryFee = Math.max(0, Number(form.deliveryFee));
    const total = subtotal + deliveryFee;

    if (form.customer.trim().length < 2) {
      const message = "Customer name is required.";
      setError(message);
      showToast({ tone: "error", title: "Order not saved", description: message });
      setSaving(false);
      return;
    }

    if (form.items.trim().length < 2) {
      const message = "Please add an order summary.";
      setError(message);
      showToast({ tone: "error", title: "Order not saved", description: message });
      setSaving(false);
      return;
    }

    try {
      // Parse the free-text summary ("2x Chicken Karahi, 1x Naan") into real line
      // items so the Order Summary shows a proper breakdown. The subtotal is
      // distributed evenly per unit so price x quantity sums back to the subtotal.
      const lineItems = form.items
        .split(/[\n,]+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const match = line.match(/^(\d+)\s*[xX]\s*(.+)$/);
          return match
            ? { quantity: Math.max(1, Number(match[1])), name: match[2].trim() }
            : { quantity: 1, name: line };
        });
      const safeLineItems = lineItems.length ? lineItems : [{ quantity: 1, name: form.items.trim() }];
      const totalQty = safeLineItems.reduce((sum, li) => sum + li.quantity, 0) || 1;
      const unitPrice = Math.round(subtotal / totalQty);
      const details = safeLineItems.map((li) => ({
        name: li.name,
        quantity: li.quantity,
        price: unitPrice,
        variantLabel: "",
      }));

      const payload = {
        customer: form.customer.trim(),
        customerEmail: form.customerEmail.trim().toLowerCase(),
        customerPhone: form.customerPhone.trim(),
        deliveryAddress: form.deliveryAddress.trim(),
        paymentMethod: form.paymentMethod.trim(),
        type: form.type,
        notes: form.notes.trim(),
        items: form.items.trim(),
        details,
        subtotal,
        deliveryFee,
        total,
        status: form.status,
        assignedRole: form.assignedRole,
        assignedStaffId: Number(form.assignedStaffId || 0),
      };

      const response = await fetch(editing ? `/api/orders/${editing.id}` : "/api/orders", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Failed to save order.");
      }

      let nextOrder = data as OrderRecord;

      if (!editing && form.status !== "Pending") {
        const statusResponse = await fetch(`/api/orders/${data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: form.status }),
        });
        const statusData = await statusResponse.json();

        if (statusResponse.ok) {
          nextOrder = statusData;
        }
      }

      await fetchOrders();
      closeForm();
      if (selectedOrder?.id === (editing?.id ?? nextOrder.id)) {
        setSelectedOrder(nextOrder);
      }

      showToast({
        tone: "success",
        title: editing ? "Order updated" : "Order created",
        description: `${nextOrder.id} is now available in the order list.`,
      });
    } catch (saveError) {
      console.error(saveError);
      const message = saveError instanceof Error ? saveError.message : "Order could not be saved.";
      setError(message);
      showToast({ tone: "error", title: "Save failed", description: message });
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (order: OrderRecord, status: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Failed to update status.");
      }

      await fetchOrders();
      setSelectedOrder(data);
      showToast({
        tone: "success",
        title: "Status updated",
        description: `${order.id} moved to ${status}.`,
      });
    } catch (statusError) {
      console.error(statusError);
      const message =
        statusError instanceof Error ? statusError.message : "Order status could not be updated.";
      setError(message);
      showToast({ tone: "error", title: "Status update failed", description: message });
    }
  };

  const verifyPayment = async (order: OrderRecord, action: "verify" | "reject") => {
    try {
      const response = await fetch(`/api/orders/${order.id}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Payment update failed.");
      }

      await fetchOrders();
      setSelectedOrder(data);
      showToast({
        tone: action === "verify" ? "success" : "info",
        title: action === "verify" ? "Payment verified" : "Payment rejected",
        description: `${order.id} ${action === "verify" ? "confirmed" : "cancelled"}.`,
      });
    } catch (paymentError) {
      console.error(paymentError);
      const message =
        paymentError instanceof Error ? paymentError.message : "Payment update failed.";
      setError(message);
      showToast({ tone: "error", title: "Payment update failed", description: message });
    }
  };

  const printOrderReceipt = (order: OrderRecord) => {
    const deliveryFee = Number(order.deliveryFee ?? 0);
    const subtotal = order.subtotal ?? Math.max(0, order.total - deliveryFee);

    printReceipt({
      id: order.id,
      customer: order.customer,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      deliveryAddress: order.deliveryAddress,
      type: order.type,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      paymentReference: order.paymentReference,
      time: order.time,
      subtotal,
      deliveryFee,
      total: order.total,
      notes: order.notes,
      items: order.details?.length
        ? order.details
        : [
            {
              name: order.items,
              quantity: 1,
              price: subtotal,
            },
          ],
    });
  };

  const deleteOrder = async (id: string) => {
    const confirmed = window.confirm("Delete this order?");
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message ?? "Delete failed");
      }

      await fetchOrders();
      if (selectedOrder?.id === id) {
        setSelectedOrder(null);
      }

      showToast({
        tone: "success",
        title: "Order deleted",
        description: `${id} has been removed from the system.`,
      });
    } catch (deleteError) {
      console.error(deleteError);
      const message = deleteError instanceof Error ? deleteError.message : "Order delete failed.";
      setError(message);
      showToast({ tone: "error", title: "Delete failed", description: message });
    }
  };

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {showForm ? (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeForm}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            />
            <motion.form
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              onSubmit={saveOrder}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-2xl"
            >
              <h3 className="text-3xl font-bold text-dark">{editing ? "Edit Order" : "Create Order"}</h3>
              <p className="mt-2 text-sm text-muted">
                Capture customer details, invoice summary, and operational notes in one place.
              </p>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <input
                  value={form.customer}
                  onChange={(event) => setForm((current) => ({ ...current, customer: event.target.value }))}
                  className="rounded-2xl bg-surface px-5 py-4 outline-none"
                  placeholder="Customer name"
                />
                <input
                  value={form.customerEmail}
                  onChange={(event) => setForm((current) => ({ ...current, customerEmail: event.target.value }))}
                  className="rounded-2xl bg-surface px-5 py-4 outline-none"
                  placeholder="Customer email"
                />
                <input
                  value={form.customerPhone}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, customerPhone: normalizePhone(event.target.value) }))
                  }
                  className="rounded-2xl bg-surface px-5 py-4 outline-none"
                  placeholder="Customer phone"
                />
                <input
                  value={form.deliveryAddress}
                  onChange={(event) => setForm((current) => ({ ...current, deliveryAddress: event.target.value }))}
                  className="rounded-2xl bg-surface px-5 py-4 outline-none"
                  placeholder="Delivery address or pickup note"
                />
                <textarea
                  value={form.items}
                  onChange={(event) => setForm((current) => ({ ...current, items: event.target.value }))}
                  className="min-h-28 rounded-2xl bg-surface px-5 py-4 outline-none md:col-span-2"
                  placeholder="Order summary, e.g. 2x Chicken Karahi, 1x Naan"
                />
                <input
                  value={form.subtotal}
                  onChange={(event) => setForm((current) => ({ ...current, subtotal: event.target.value }))}
                  className="rounded-2xl bg-surface px-5 py-4 outline-none"
                  placeholder="Subtotal"
                  type="number"
                  min="0"
                />
                <input
                  value={form.deliveryFee}
                  onChange={(event) => setForm((current) => ({ ...current, deliveryFee: event.target.value }))}
                  className="rounded-2xl bg-surface px-5 py-4 outline-none"
                  placeholder="Delivery fee"
                  type="number"
                  min="0"
                />
                <select
                  value={form.type}
                  onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as OrderType }))}
                  className="rounded-2xl bg-surface px-5 py-4 outline-none"
                >
                  <option value="Delivery">Delivery</option>
                  <option value="Dine-in">Dine-in</option>
                  <option value="Takeaway">Takeaway</option>
                </select>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, status: event.target.value as OrderStatus }))
                  }
                  className="rounded-2xl bg-surface px-5 py-4 outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <input
                  value={form.paymentMethod}
                  onChange={(event) => setForm((current) => ({ ...current, paymentMethod: event.target.value }))}
                  className="rounded-2xl bg-surface px-5 py-4 outline-none"
                  placeholder="Payment method"
                />
                <select
                  value={form.assignedRole}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      assignedRole: event.target.value,
                      assignedStaffId: "0",
                    }))
                  }
                  className="rounded-2xl bg-surface px-5 py-4 outline-none"
                >
                  <option value="">Shared queue</option>
                  <option value="staff">Assign to general staff</option>
                  <option value="rider">Assign to rider</option>
                  <option value="manager">Assign to manager</option>
                </select>
                <select
                  value={form.assignedStaffId}
                  onChange={(event) => setForm((current) => ({ ...current, assignedStaffId: event.target.value }))}
                  className="rounded-2xl bg-surface px-5 py-4 outline-none"
                >
                  <option value="0">Choose staff member</option>
                  {assignableStaff.map((member) => (
                    <option key={member.id} value={String(member.id)}>
                      {member.name} | {member.role}
                    </option>
                  ))}
                </select>
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  className="min-h-28 rounded-2xl bg-surface px-5 py-4 outline-none md:col-span-2"
                  placeholder="Internal note or customer instructions"
                />
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-full border border-gray-200 px-6 py-3 font-bold text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-primary px-7 py-3 font-bold text-white"
                >
                  {saving ? "Saving..." : editing ? "Update Order" : "Create Order"}
                </button>
              </div>
            </motion.form>
          </div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {selectedOrder ? (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[3rem] bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 p-8">
                <div>
                  <h2 className="text-2xl font-bold text-dark">Order Summary</h2>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">{selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-muted transition hover:bg-red-500 hover:text-white"
                >
                  <XCircle size={22} />
                </button>
              </div>

              <div className="grid gap-8 p-8 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-5">
                  <div className="rounded-[2rem] bg-surface p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted">Customer Details</p>
                    <h3 className="mt-2 text-xl font-bold text-dark">{selectedOrder.customer}</h3>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted">Email</p>
                        <p className="mt-2 text-sm font-bold text-dark">{selectedOrder.customerEmail || "Not provided"}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted">Phone</p>
                        <p className="mt-2 text-sm font-bold text-dark">{selectedOrder.customerPhone || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="mt-4 rounded-2xl bg-white p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted">Assigned To</p>
                      <p className="mt-2 text-sm font-bold text-dark">
                        {selectedOrder.assignedStaffName || "Shared queue"}
                      </p>
                      <p className="mt-1 text-xs text-muted">{selectedOrder.assignedRole || "No fixed role"}</p>
                    </div>
                    <div className="mt-4 rounded-2xl bg-white p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted">Address / Pickup</p>
                      <p className="mt-2 text-sm leading-7 text-dark">
                        {selectedOrder.deliveryAddress || "No delivery address attached"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[2rem] bg-surface p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted">Invoice Items</p>
                    <div className="mt-5 space-y-3">
                      {(selectedOrder.details?.length ? selectedOrder.details : [{ name: selectedOrder.items, quantity: 1, price: selectedOrder.total }]).map((item, index) => (
                        <div key={`${item.name}-${index}`} className="rounded-2xl bg-white p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-bold text-dark">
                                {item.quantity}x {item.name}
                              </p>
                              {item.variantLabel ? (
                                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-muted">
                                  {item.variantLabel}
                                </p>
                              ) : null}
                            </div>
                            <p className="font-bold text-primary">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedOrder.notes ? (
                    <div className="rounded-[2rem] bg-surface p-6">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted">Notes</p>
                      <p className="mt-3 text-sm leading-7 text-dark">{selectedOrder.notes}</p>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-5">
                  <div className="rounded-[2rem] bg-surface-strong p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted">Invoice Total</p>
                    <p className="mt-2 text-4xl font-display font-bold text-primary">
                      {formatCurrency(selectedOrder.total)}
                    </p>
                    <div className="mt-4 space-y-2 text-sm text-muted">
                      <p>{new Date(selectedOrder.time).toLocaleString("en-PK")}</p>
                      <p>{selectedOrder.paymentMethod || "Cash on Delivery"}</p>
                    </div>
                    <div className="mt-5 space-y-2 rounded-2xl bg-white p-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted">Subtotal</span>
                        <span className="font-bold text-dark">
                          {formatCurrency(selectedOrder.subtotal ?? Math.max(0, selectedOrder.total - Number(selectedOrder.deliveryFee ?? 0)))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted">Delivery Fee</span>
                        <span className="font-bold text-dark">{formatCurrency(Number(selectedOrder.deliveryFee ?? 0))}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[2rem] bg-surface p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted">Payment</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                      <span className="rounded-full bg-white px-3 py-2 font-bold text-dark">
                        {selectedOrder.paymentMethod || "Cash on Delivery"}
                      </span>
                      {selectedOrder.paymentStatus && (
                        <span
                          className={`rounded-full px-3 py-2 text-xs font-bold ${
                            selectedOrder.paymentStatus === "Verified"
                              ? "bg-green-500/10 text-green-600"
                              : selectedOrder.paymentStatus === "Rejected"
                                ? "bg-red-500/10 text-red-500"
                                : selectedOrder.paymentStatus === "Pending Verification"
                                  ? "bg-amber-500/10 text-amber-600"
                                  : "bg-slate-500/10 text-slate-600"
                          }`}
                        >
                          {selectedOrder.paymentStatus}
                        </span>
                      )}
                    </div>
                    {selectedOrder.paymentReference && (
                      <p className="mt-3 text-sm text-muted">
                        Reference: <span className="font-mono font-bold text-dark">{selectedOrder.paymentReference}</span>
                      </p>
                    )}
                    {selectedOrder.paymentVerifiedBy && (
                      <p className="mt-1 text-xs text-muted">Handled by {selectedOrder.paymentVerifiedBy}</p>
                    )}
                    {selectedOrder.paymentStatus === "Pending Verification" && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <button
                          onClick={() => verifyPayment(selectedOrder, "verify")}
                          className="rounded-2xl bg-green-500 px-4 py-3 font-bold text-white transition hover:bg-green-600"
                        >
                          Verify Payment
                        </button>
                        <button
                          onClick={() => verifyPayment(selectedOrder, "reject")}
                          className="rounded-2xl bg-red-50 px-4 py-3 font-bold text-red-500 transition hover:bg-red-500 hover:text-white"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="rounded-[2rem] bg-surface p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted">Order State</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-dark">
                        {selectedOrder.type}
                      </span>
                      <span className={`rounded-full px-3 py-2 text-xs font-bold ${statusStyles[selectedOrder.status]}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="mt-5 grid gap-3">
                      {(["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"] as OrderStatus[]).map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(selectedOrder, status)}
                          className={`rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                            selectedOrder.status === status
                              ? "bg-primary text-white"
                              : "bg-white text-dark hover:bg-primary/10"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateStatus(selectedOrder, "Preparing")}
                      className="rounded-2xl bg-primary px-4 py-4 font-bold text-white transition hover:bg-primary-dark"
                    >
                      Accept Order
                    </button>
                    <button
                      onClick={() => updateStatus(selectedOrder, "Cancelled")}
                      className="rounded-2xl bg-red-50 px-4 py-4 font-bold text-red-500 transition hover:bg-red-500 hover:text-white"
                    >
                      Reject Order
                    </button>
                    <button
                      onClick={() => openEdit(selectedOrder)}
                      className="rounded-2xl bg-dark px-4 py-4 font-bold text-white transition hover:bg-primary"
                    >
                      Edit Order
                    </button>
                    <button
                      onClick={() => printOrderReceipt(selectedOrder)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-4 font-bold text-dark"
                    >
                      Print
                      <Printer size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShoppingBag size={24} />
          </div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Total Orders</p>
          <p className="text-2xl font-display font-bold text-dark">{orders.length}</p>
        </div>
        <div className="rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-500">
            <Clock3 size={24} />
          </div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Pending Orders</p>
          <p className="text-2xl font-display font-bold text-dark">{stats.pending}</p>
        </div>
        <div className="rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
            <Truck size={24} />
          </div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Processing</p>
          <p className="text-2xl font-display font-bold text-dark">{stats.processing}</p>
        </div>
        <div className="rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-500">
            <ReceiptText size={24} />
          </div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Revenue</p>
          <p className="text-2xl font-display font-bold text-dark">{formatCurrency(stats.revenue)}</p>
        </div>
      </div>

      <div className="rounded-[3rem] border border-gray-50 bg-white p-10 shadow-xl shadow-dark/5">
        <div className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-dark">Order Management</h2>
            <p className="mt-1 text-sm text-muted">
              View all orders, accept or reject pending requests, update delivery states, and review invoice details.
            </p>
          </div>

          <div className="flex w-full flex-wrap gap-4 xl:w-auto">
            <div className="relative min-w-[18rem] flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                placeholder="Search by customer, order ID, phone, or status"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-xl bg-surface py-3 pl-12 pr-4 text-sm outline-none"
              />
            </div>
            <button
              onClick={() => void fetchOrders()}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-strong text-dark transition hover:bg-primary hover:text-white"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/20"
            >
              <Plus size={18} />
              New Order
            </button>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          {statusFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                statusFilter === filter.id
                  ? "bg-primary text-white shadow-lg shadow-primary/15"
                  : "bg-surface text-dark hover:bg-surface-strong"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {error ? <p className="mb-5 text-sm font-medium text-red-500">{error}</p> : null}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-bold uppercase tracking-widest text-muted">
                <th className="pb-6">Order</th>
                <th className="pb-6">Customer</th>
                <th className="pb-6">Invoice Summary</th>
                <th className="pb-6">Assigned</th>
                <th className="pb-6">Type</th>
                <th className="pb-6">Status</th>
                <th className="pb-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="group transition-colors hover:bg-surface">
                  <td className="py-6">
                    <button onClick={() => setSelectedOrder(order)} className="text-left">
                      <span className="block font-bold text-dark">{order.id}</span>
                      <span className="text-xs text-muted">{new Date(order.time).toLocaleString("en-PK")}</span>
                    </button>
                  </td>
                  <td className="py-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-strong font-bold text-dark">
                        {order.customer.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-dark">{order.customer}</p>
                        <p className="text-xs text-muted">{order.customerPhone || order.customerEmail || "No direct contact"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6">
                    <p className="max-w-md text-sm text-muted">{order.items}</p>
                    <p className="mt-2 text-sm font-bold text-dark">{formatCurrency(order.total)}</p>
                  </td>
                  <td className="py-6">
                    <p className="text-sm font-bold text-dark">{order.assignedStaffName || "Shared queue"}</p>
                    <p className="text-xs text-muted">{order.assignedRole || "Unassigned role"}</p>
                  </td>
                  <td className="py-6">
                    <span className="inline-flex items-center gap-2 rounded-full bg-surface-strong px-3 py-1 text-xs font-bold text-dark">
                      {order.type === "Delivery" ? <Truck size={12} /> : order.type === "Takeaway" ? <Store size={12} /> : <ShoppingBag size={12} />}
                      {order.type}
                    </span>
                  </td>
                  <td className="py-6">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-6">
                    <div className="flex flex-wrap gap-2">
                      {order.status === "Pending" ? (
                        <>
                          <button
                            onClick={() => updateStatus(order, "Preparing")}
                            className="rounded-lg bg-green-50 px-3 py-2 text-xs font-bold text-green-600 transition hover:bg-green-500 hover:text-white"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateStatus(order, "Cancelled")}
                            className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-500 hover:text-white"
                          >
                            Reject
                          </button>
                        </>
                      ) : null}
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="rounded-lg bg-surface-strong p-2 text-dark transition hover:bg-primary hover:text-white"
                        title="View summary"
                      >
                        <User size={16} />
                      </button>
                      <button
                        onClick={() => openEdit(order)}
                        className="rounded-lg bg-surface-strong p-2 text-dark transition hover:bg-primary hover:text-white"
                        title="Edit order"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="rounded-lg bg-surface-strong p-2 text-dark transition hover:bg-red-500 hover:text-white"
                        title="Delete order"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && filteredOrders.length === 0 ? (
            <div className="p-10 text-center text-muted">No orders matched the current search or filter.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
