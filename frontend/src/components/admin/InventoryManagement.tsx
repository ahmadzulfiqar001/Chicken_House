import { FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useRealtime } from "../../lib/realtime";
import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle2,
  ClipboardList,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Store,
  Trash2,
  TrendingDown,
  Wallet,
} from "lucide-react";

import { useToast } from "../layout/ToastProvider";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  supplier?: string;
  costPerUnit?: number;
  lastUpdated?: string;
  usedToday: number;
  usedThisWeek: number;
  remainingQuantity: number;
  lowStockAlert: boolean;
};

type ReportRow = {
  itemId: number;
  itemName: string;
  category: string;
  supplier: string;
  unit: string;
  usedQuantity: number;
  remainingQuantity: number;
  currentStock: number;
  minimumLevel: number;
  lowStockAlert: boolean;
};

type VendorRecord = {
  id: string;
  vendorName: string;
  itemName: string;
  unit: string;
  quotedPrice: number;
  targetPrice: number;
  quantityReceived: number;
  minimumOrderQuantity: number;
  billAmount: number;
  amountPaid: number;
  discountCut: number;
  purchaseDate: string;
  status: "Unpaid" | "Partially Paid" | "Paid";
  notes?: string;
};

type InventoryReport = {
  window: "daily" | "weekly";
  generatedAt: string;
  summary: {
    totalItems: number;
    lowStockItems: number;
    totalUsedQuantity: number;
    totalRemainingQuantity: number;
    purchaseValue: number;
    outstandingBills: number;
  };
  alerts: ReportRow[];
  rows: ReportRow[];
  recentPurchases: VendorRecord[];
};

const emptyInventoryForm = {
  name: "",
  category: "",
  stock: "0",
  minStock: "0",
  unit: "kg",
  supplier: "",
  costPerUnit: "0",
};

const emptyVendorForm = {
  vendorName: "",
  itemName: "",
  unit: "kg",
  quotedPrice: "0",
  targetPrice: "0",
  quantityReceived: "0",
  minimumOrderQuantity: "0",
  billAmount: "0",
  amountPaid: "0",
  discountCut: "0",
  purchaseDate: new Date().toISOString().slice(0, 10),
  notes: "",
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const formatDate = (value?: string) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const statusBadgeClasses: Record<string, string> = {
  "In Stock": "bg-green-500/10 text-green-600",
  "Low Stock": "bg-red-500/10 text-red-500",
  Paid: "bg-green-500/10 text-green-600",
  "Partially Paid": "bg-amber-500/10 text-amber-600",
  Unpaid: "bg-red-500/10 text-red-500",
};

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  list,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  list?: string;
}) => (
  <label className="space-y-2">
    <span className="text-sm font-semibold text-dark">{label}</span>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-transparent bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary/25 focus:bg-white"
      placeholder={placeholder}
      type={type}
      list={list}
      min={type === "number" ? "0" : undefined}
      step={type === "number" ? "0.01" : undefined}
    />
  </label>
);

const PanelSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-dark/5">
          <div className="mb-5 h-12 w-12 rounded-2xl bg-surface" />
          <div className="mb-3 h-3 w-28 rounded-full bg-surface" />
          <div className="h-8 w-40 rounded-full bg-surface" />
        </div>
      ))}
    </div>
    <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5">
      <div className="mb-6 h-8 w-48 rounded-full bg-surface" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-16 rounded-2xl bg-surface" />
        ))}
      </div>
    </div>
  </div>
);

const InventoryManagement = () => {
  const { showToast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [reportWindow, setReportWindow] = useState<"daily" | "weekly">("weekly");
  const [report, setReport] = useState<InventoryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<InventoryItem | null>(null);
  const [editingVendor, setEditingVendor] = useState<VendorRecord | null>(null);
  const [inventoryForm, setInventoryForm] = useState(emptyInventoryForm);
  const [vendorForm, setVendorForm] = useState(emptyVendorForm);
  const [inventorySearch, setInventorySearch] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");
  const [screenError, setScreenError] = useState("");
  const [savingInventory, setSavingInventory] = useState(false);
  const [savingVendor, setSavingVendor] = useState(false);

  const vendorItemOptions = useMemo(
    () =>
      Array.from(new Set<string>(inventory.map((item) => item.name))).sort((left, right) => left.localeCompare(right)),
    [inventory],
  );

  const loadData = async (window: "daily" | "weekly", preserveState = true) => {
    if (!preserveState || inventory.length === 0) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setScreenError("");

    try {
      const [inventoryResponse, reportResponse, vendorResponse] = await Promise.all([
        fetch("/api/inventory"),
        fetch(`/api/inventory/reports?window=${window}`),
        fetch("/api/inventory/vendors"),
      ]);

      const [inventoryData, reportData, vendorData] = await Promise.all([
        inventoryResponse.json(),
        reportResponse.json(),
        vendorResponse.json(),
      ]);

      if (!inventoryResponse.ok) {
        throw new Error(inventoryData.message ?? "Inventory could not be loaded.");
      }

      if (!reportResponse.ok) {
        throw new Error(reportData.message ?? "Inventory report could not be loaded.");
      }

      if (!vendorResponse.ok) {
        throw new Error(vendorData.message ?? "Vendors could not be loaded.");
      }

      setInventory(inventoryData);
      setReport(reportData);
      setVendors(vendorData);
    } catch (error) {
      console.error(error);
      setScreenError("Inventory data could not be loaded. Please check the API and server response.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(reportWindow, false);
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    loadData(reportWindow);
  }, [reportWindow]);

  // Live updates: refetch inventory + reports when stock changes (orders, vendor receipts).
  useRealtime("inventory", () => {
    void loadData(reportWindow);
  });

  const filteredInventory = useMemo(
    () =>
      inventory.filter((item) =>
        [item.name, item.category, item.supplier ?? ""].join(" ").toLowerCase().includes(inventorySearch.toLowerCase()),
      ),
    [inventory, inventorySearch],
  );

  const filteredVendors = useMemo(
    () =>
      vendors.filter((vendor) =>
        [vendor.vendorName, vendor.itemName, vendor.status, vendor.notes ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(vendorSearch.toLowerCase()),
      ),
    [vendors, vendorSearch],
  );

  const inventorySummary = useMemo(() => {
    const lowStockCount = inventory.filter((item) => item.lowStockAlert).length;
    const suppliers = new Set(inventory.map((item) => item.supplier).filter(Boolean)).size;
    const weeklyUsed = inventory.reduce((sum, item) => sum + Number(item.usedThisWeek ?? 0), 0);

    return {
      totalItems: inventory.length,
      lowStockCount,
      supplierCount: suppliers,
      weeklyUsed,
    };
  }, [inventory]);

  const vendorLedgerSummary = useMemo(() => {
    const outstanding = vendors.reduce(
      (sum, vendor) =>
        sum + Math.max(Number(vendor.billAmount) - Number(vendor.discountCut) - Number(vendor.amountPaid), 0),
      0,
    );
    const totalPurchaseValue = vendors.reduce((sum, vendor) => sum + Number(vendor.billAmount), 0);

    return {
      outstanding,
      totalPurchaseValue,
      activeVendors: new Set(vendors.map((vendor) => vendor.vendorName)).size,
    };
  }, [vendors]);

  const openInventoryCreate = () => {
    setEditingInventory(null);
    setInventoryForm(emptyInventoryForm);
    setInventoryModalOpen(true);
  };

  const openInventoryEdit = (item: InventoryItem) => {
    setEditingInventory(item);
    setInventoryForm({
      name: item.name,
      category: item.category,
      stock: String(item.stock),
      minStock: String(item.minStock),
      unit: item.unit,
      supplier: item.supplier ?? "",
      costPerUnit: String(item.costPerUnit ?? 0),
    });
    setInventoryModalOpen(true);
  };

  const openVendorCreate = () => {
    setEditingVendor(null);
    setVendorForm({
      ...emptyVendorForm,
      itemName: vendorItemOptions[0] ?? "",
    });
    setVendorModalOpen(true);
  };

  const openVendorEdit = (vendor: VendorRecord) => {
    setEditingVendor(vendor);
    setVendorForm({
      vendorName: vendor.vendorName,
      itemName: vendor.itemName,
      unit: vendor.unit,
      quotedPrice: String(vendor.quotedPrice),
      targetPrice: String(vendor.targetPrice),
      quantityReceived: String(vendor.quantityReceived),
      minimumOrderQuantity: String(vendor.minimumOrderQuantity),
      billAmount: String(vendor.billAmount),
      amountPaid: String(vendor.amountPaid),
      discountCut: String(vendor.discountCut),
      purchaseDate: vendor.purchaseDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      notes: vendor.notes ?? "",
    });
    setVendorModalOpen(true);
  };

  const saveInventoryItem = async (event: FormEvent) => {
    event.preventDefault();
    setSavingInventory(true);

    try {
      const payload = {
        name: inventoryForm.name.trim(),
        category: inventoryForm.category.trim(),
        stock: Number(inventoryForm.stock),
        minStock: Number(inventoryForm.minStock),
        unit: inventoryForm.unit.trim() || "kg",
        supplier: inventoryForm.supplier.trim(),
        costPerUnit: Number(inventoryForm.costPerUnit),
      };

      const response = await fetch(
        editingInventory ? `/api/inventory/${editingInventory.id}` : "/api/inventory",
        {
          method: editingInventory ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Inventory item save failed.");
      }

      await loadData(reportWindow);
      setInventoryModalOpen(false);
      showToast({
        tone: "success",
        title: editingInventory ? "Stock item updated" : "Stock item created",
        description: `${payload.name} was saved successfully in inventory.`,
      });
    } catch (error) {
      console.error(error);
      showToast({
        tone: "error",
        title: "Inventory save failed",
        description: error instanceof Error ? error.message : "The inventory item could not be saved.",
      });
    } finally {
      setSavingInventory(false);
    }
  };

  const saveVendorRecord = async (event: FormEvent) => {
    event.preventDefault();
    setSavingVendor(true);

    try {
      const payload = {
        vendorName: vendorForm.vendorName.trim(),
        itemName: vendorForm.itemName.trim(),
        unit: vendorForm.unit.trim() || "kg",
        quotedPrice: Number(vendorForm.quotedPrice),
        targetPrice: Number(vendorForm.targetPrice),
        quantityReceived: Number(vendorForm.quantityReceived),
        minimumOrderQuantity: Number(vendorForm.minimumOrderQuantity),
        billAmount: Number(vendorForm.billAmount),
        amountPaid: Number(vendorForm.amountPaid),
        discountCut: Number(vendorForm.discountCut),
        purchaseDate: vendorForm.purchaseDate,
        notes: vendorForm.notes.trim(),
      };

      const response = await fetch(
        editingVendor ? `/api/inventory/vendors/${editingVendor.id}` : "/api/inventory/vendors",
        {
          method: editingVendor ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Vendor record save failed.");
      }

      await loadData(reportWindow);
      setVendorModalOpen(false);
      showToast({
        tone: "success",
        title: editingVendor ? "Vendor record updated" : "Vendor record created",
        description: `${payload.vendorName}'s vendor ledger entry was saved successfully.`,
      });
    } catch (error) {
      console.error(error);
      showToast({
        tone: "error",
        title: "Vendor save failed",
        description: error instanceof Error ? error.message : "The vendor record could not be saved.",
      });
    } finally {
      setSavingVendor(false);
    }
  };

  const deleteInventoryItem = async (item: InventoryItem) => {
    if (!window.confirm(`Delete ${item.name} from inventory?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/inventory/${item.id}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Inventory item delete failed.");
      }

      await loadData(reportWindow);
      showToast({
        tone: "success",
        title: "Inventory item deleted",
        description: `${item.name} was removed from inventory.`,
      });
    } catch (error) {
      console.error(error);
      showToast({
        tone: "error",
        title: "Delete failed",
        description: error instanceof Error ? error.message : "The inventory item could not be deleted.",
      });
    }
  };

  const deleteVendorRecord = async (vendor: VendorRecord) => {
    if (!window.confirm(`Delete vendor record for ${vendor.vendorName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/inventory/vendors/${vendor.id}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Vendor record delete failed.");
      }

      await loadData(reportWindow);
      showToast({
        tone: "success",
        title: "Vendor record deleted",
        description: `${vendor.vendorName}'s purchase record was removed.`,
      });
    } catch (error) {
      console.error(error);
      showToast({
        tone: "error",
        title: "Delete failed",
        description: error instanceof Error ? error.message : "The vendor record could not be deleted.",
      });
    }
  };

  if (loading && inventory.length === 0) {
    return <PanelSkeleton />;
  }

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {inventoryModalOpen ? (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInventoryModalOpen(false)}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            />
            <motion.form
              initial={{ opacity: 0, scale: 0.97, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 24 }}
              onSubmit={saveInventoryItem}
              className="relative z-10 w-full max-w-4xl rounded-[2.5rem] bg-white p-8 shadow-2xl"
            >
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Inventory</p>
                  <h3 className="mt-2 text-3xl font-bold text-dark">
                    {editingInventory ? "Update stock item" : "Add stock item"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setInventoryModalOpen(false)}
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-muted transition hover:text-dark"
                >
                  Close
                </button>
              </div>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <Field
                  label="Item Name"
                  value={inventoryForm.name}
                  onChange={(value) => setInventoryForm((prev) => ({ ...prev, name: value }))}
                  placeholder="Fresh Chicken"
                />
                <Field
                  label="Category"
                  value={inventoryForm.category}
                  onChange={(value) => setInventoryForm((prev) => ({ ...prev, category: value }))}
                  placeholder="Protein"
                />
                <Field
                  label="Unit"
                  value={inventoryForm.unit}
                  onChange={(value) => setInventoryForm((prev) => ({ ...prev, unit: value }))}
                  placeholder="kg"
                />
                <Field
                  label="Current Stock"
                  type="number"
                  value={inventoryForm.stock}
                  onChange={(value) => setInventoryForm((prev) => ({ ...prev, stock: value }))}
                  placeholder="25"
                />
                <Field
                  label="Minimum Level"
                  type="number"
                  value={inventoryForm.minStock}
                  onChange={(value) => setInventoryForm((prev) => ({ ...prev, minStock: value }))}
                  placeholder="8"
                />
                <Field
                  label="Cost Per Unit"
                  type="number"
                  value={inventoryForm.costPerUnit}
                  onChange={(value) => setInventoryForm((prev) => ({ ...prev, costPerUnit: value }))}
                  placeholder="980"
                />
                <div className="md:col-span-2 xl:col-span-3">
                  <Field
                    label="Primary Supplier"
                    value={inventoryForm.supplier}
                    onChange={(value) => setInventoryForm((prev) => ({ ...prev, supplier: value }))}
                    placeholder="Mitchell Market Traders"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setInventoryModalOpen(false)}
                  className="rounded-full border border-gray-200 px-6 py-3 font-semibold text-muted transition hover:text-dark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingInventory}
                  className="rounded-full bg-primary px-7 py-3 font-bold text-white shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingInventory ? "Saving..." : editingInventory ? "Update Item" : "Create Item"}
                </button>
              </div>
            </motion.form>
          </div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {vendorModalOpen ? (
          <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setVendorModalOpen(false)}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            />
            <motion.form
              initial={{ opacity: 0, scale: 0.97, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 24 }}
              onSubmit={saveVendorRecord}
              className="relative z-10 w-full max-w-5xl rounded-[2.5rem] bg-white p-8 shadow-2xl"
            >
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Vendors</p>
                  <h3 className="mt-2 text-3xl font-bold text-dark">
                    {editingVendor ? "Update vendor ledger" : "Add vendor ledger entry"}
                  </h3>
                  <p className="mt-2 text-sm text-muted">
                    Track quotes, purchases, bill payments, discounts, and outstanding balances in one place.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setVendorModalOpen(false)}
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-muted transition hover:text-dark"
                >
                  Close
                </button>
              </div>

              <datalist id="vendor-item-options">
                {vendorItemOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <Field
                  label="Vendor Name"
                  value={vendorForm.vendorName}
                  onChange={(value) => setVendorForm((prev) => ({ ...prev, vendorName: value }))}
                  placeholder="Okara Fresh Produce"
                />
                <Field
                  label="Item Name"
                  value={vendorForm.itemName}
                  onChange={(value) => setVendorForm((prev) => ({ ...prev, itemName: value }))}
                  placeholder="Fresh Chicken"
                  list="vendor-item-options"
                />
                <Field
                  label="Unit"
                  value={vendorForm.unit}
                  onChange={(value) => setVendorForm((prev) => ({ ...prev, unit: value }))}
                  placeholder="kg"
                />
                <Field
                  label="Quoted Price"
                  type="number"
                  value={vendorForm.quotedPrice}
                  onChange={(value) => setVendorForm((prev) => ({ ...prev, quotedPrice: value }))}
                  placeholder="1020"
                />
                <Field
                  label="Target Price"
                  type="number"
                  value={vendorForm.targetPrice}
                  onChange={(value) => setVendorForm((prev) => ({ ...prev, targetPrice: value }))}
                  placeholder="980"
                />
                <Field
                  label="Received Quantity"
                  type="number"
                  value={vendorForm.quantityReceived}
                  onChange={(value) => setVendorForm((prev) => ({ ...prev, quantityReceived: value }))}
                  placeholder="20"
                />
                <Field
                  label="Minimum Order Qty"
                  type="number"
                  value={vendorForm.minimumOrderQuantity}
                  onChange={(value) => setVendorForm((prev) => ({ ...prev, minimumOrderQuantity: value }))}
                  placeholder="5"
                />
                <Field
                  label="Bill Amount"
                  type="number"
                  value={vendorForm.billAmount}
                  onChange={(value) => setVendorForm((prev) => ({ ...prev, billAmount: value }))}
                  placeholder="19600"
                />
                <Field
                  label="Amount Paid"
                  type="number"
                  value={vendorForm.amountPaid}
                  onChange={(value) => setVendorForm((prev) => ({ ...prev, amountPaid: value }))}
                  placeholder="12000"
                />
                <Field
                  label="Discount / Cut"
                  type="number"
                  value={vendorForm.discountCut}
                  onChange={(value) => setVendorForm((prev) => ({ ...prev, discountCut: value }))}
                  placeholder="500"
                />
                <Field
                  label="Purchase Date"
                  type="date"
                  value={vendorForm.purchaseDate}
                  onChange={(value) => setVendorForm((prev) => ({ ...prev, purchaseDate: value }))}
                  placeholder="Purchase Date"
                />
                <div className="xl:col-span-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-dark">Notes</span>
                    <textarea
                      value={vendorForm.notes}
                      onChange={(event) => setVendorForm((prev) => ({ ...prev, notes: event.target.value }))}
                      className="min-h-[126px] w-full rounded-2xl border border-transparent bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary/25 focus:bg-white"
                      placeholder="Rate comparison, delivery notes, quality remarks..."
                    />
                  </label>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setVendorModalOpen(false)}
                  className="rounded-full border border-gray-200 px-6 py-3 font-semibold text-muted transition hover:text-dark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingVendor}
                  className="rounded-full bg-primary px-7 py-3 font-bold text-white shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingVendor ? "Saving..." : editingVendor ? "Update Vendor" : "Create Vendor Entry"}
                </button>
              </div>
            </motion.form>
          </div>
        ) : null}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Package size={24} />
          </div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Stock Items</p>
          <p className="text-2xl font-display font-bold text-dark">{inventorySummary.totalItems}</p>
          <p className="mt-2 text-sm text-muted">Live inventory records with supplier mapping.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
            <AlertCircle size={24} />
          </div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Low Stock Alerts</p>
          <p className="text-2xl font-display font-bold text-dark">{report?.summary.lowStockItems ?? inventorySummary.lowStockCount}</p>
          <p className="mt-2 text-sm text-muted">Items below minimum level are highlighted for action.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
            <TrendingDown size={24} />
          </div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">
            {reportWindow === "daily" ? "Used Today" : "Used This Week"}
          </p>
          <p className="text-2xl font-display font-bold text-dark">
            {report?.summary.totalUsedQuantity ?? inventorySummary.weeklyUsed}
          </p>
          <p className="mt-2 text-sm text-muted">Kitchen consumption calculated from real orders.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
            <Store size={24} />
          </div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Active Vendors</p>
          <p className="text-2xl font-display font-bold text-dark">{vendorLedgerSummary.activeVendors}</p>
          <p className="mt-2 text-sm text-muted">
            {inventorySummary.supplierCount} suppliers tagged directly on stock items.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.7fr_1fr]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2.7rem] border border-gray-50 bg-white p-8 shadow-xl shadow-dark/5"
        >
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Inventory Report</p>
              <h2 className="mt-2 text-2xl font-bold text-dark">Stock health and usage report</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full bg-surface p-1">
                {(["daily", "weekly"] as const).map((windowValue) => (
                  <button
                    key={windowValue}
                    type="button"
                    onClick={() => setReportWindow(windowValue)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      reportWindow === windowValue ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted hover:text-dark"
                    }`}
                  >
                    {windowValue === "daily" ? "Daily" : "Weekly"}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => loadData(reportWindow)}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-dark transition hover:border-primary hover:text-primary"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-surface px-5 py-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted">Remaining Quantity</p>
              <p className="mt-3 text-2xl font-display font-bold text-dark">
                {report?.summary.totalRemainingQuantity ?? 0}
              </p>
            </div>
            <div className="rounded-3xl bg-surface px-5 py-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted">Purchase Value</p>
              <p className="mt-3 text-2xl font-display font-bold text-dark">
                {formatMoney(report?.summary.purchaseValue ?? 0)}
              </p>
            </div>
            <div className="rounded-3xl bg-surface px-5 py-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted">Outstanding Bills</p>
              <p className="mt-3 text-2xl font-display font-bold text-dark">
                {formatMoney(report?.summary.outstandingBills ?? 0)}
              </p>
            </div>
          </div>

          {screenError ? <p className="mb-5 text-sm font-medium text-red-500">{screenError}</p> : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-bold uppercase tracking-widest text-muted">
                  <th className="pb-5">Item</th>
                  <th className="pb-5">Category</th>
                  <th className="pb-5">Used</th>
                  <th className="pb-5">Remaining</th>
                  <th className="pb-5">Minimum</th>
                  <th className="pb-5">Supplier</th>
                  <th className="pb-5">Last Updated</th>
                  <th className="pb-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredInventory.map((item) => {
                  const usedValue = reportWindow === "daily" ? item.usedToday : item.usedThisWeek;
                  const stockStatus = item.lowStockAlert ? "Low Stock" : "In Stock";

                  return (
                    <tr key={item.id} className="transition-colors hover:bg-surface">
                      <td className="py-5">
                        <p className="font-bold text-dark">{item.name}</p>
                        <p className="text-xs text-muted">ID: {item.id}</p>
                      </td>
                      <td className="py-5">
                        <span className="rounded-full bg-surface-strong px-3 py-1 text-xs font-semibold text-dark">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-5 font-semibold text-dark">
                        {usedValue} {item.unit}
                      </td>
                      <td className="py-5 font-semibold text-dark">
                        {item.remainingQuantity} {item.unit}
                      </td>
                      <td className="py-5 text-sm font-semibold text-muted">
                        {item.minStock} {item.unit}
                      </td>
                      <td className="py-5 text-sm text-muted">{item.supplier ?? "Not assigned"}</td>
                      <td className="py-5 text-sm text-muted">{formatDate(item.lastUpdated)}</td>
                      <td className="py-5">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadgeClasses[stockStatus]}`}>
                          {stockStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!filteredInventory.length ? (
              <div className="rounded-3xl bg-surface px-6 py-12 text-center text-muted">
                No inventory items matched your search.
              </div>
            ) : null}
          </div>
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-8"
        >
          <div className="rounded-[2.7rem] border border-gray-50 bg-white p-8 shadow-xl shadow-dark/5">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Alerts</p>
                <h3 className="mt-2 text-xl font-bold text-dark">Low stock focus list</h3>
              </div>
              <AlertCircle size={22} className="text-red-500" />
            </div>
            <div className="space-y-4">
              {(report?.alerts ?? []).slice(0, 5).map((alert) => (
                <div key={alert.itemId} className="rounded-3xl bg-red-50 px-5 py-4">
                  <p className="font-bold text-dark">{alert.itemName}</p>
                  <p className="mt-1 text-sm text-muted">
                    Remaining {alert.remainingQuantity} {alert.unit} • minimum {alert.minimumLevel} {alert.unit}
                  </p>
                </div>
              ))}
              {!(report?.alerts?.length ?? 0) ? (
                <div className="rounded-3xl bg-emerald-50 px-5 py-6 text-sm text-emerald-700">
                  All stock items are currently above the healthy threshold.
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-[2.7rem] border border-gray-50 bg-white p-8 shadow-xl shadow-dark/5">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Recent Purchases</p>
                <h3 className="mt-2 text-xl font-bold text-dark">Latest vendor activity</h3>
              </div>
              <ArrowUpDown size={20} className="text-primary" />
            </div>
            <div className="space-y-4">
              {(report?.recentPurchases ?? []).slice(0, 4).map((purchase) => {
                const balanceDue = Math.max(purchase.billAmount - purchase.discountCut - purchase.amountPaid, 0);
                return (
                  <div key={purchase.id} className="rounded-3xl bg-surface px-5 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-dark">{purchase.vendorName}</p>
                        <p className="mt-1 text-sm text-muted">
                          {purchase.itemName} • {purchase.quantityReceived} {purchase.unit}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadgeClasses[purchase.status]}`}>
                        {purchase.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-muted">
                      Bill {formatMoney(purchase.billAmount)} • Due {formatMoney(balanceDue)}
                    </p>
                  </div>
                );
              })}
              {!(report?.recentPurchases?.length ?? 0) ? (
                <div className="rounded-3xl bg-surface px-5 py-6 text-sm text-muted">
                  No vendor purchases were recorded in this time window.
                </div>
              ) : null}
            </div>
          </div>
        </motion.aside>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2.9rem] border border-gray-50 bg-white p-8 shadow-xl shadow-dark/5"
      >
        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Inventory Items</p>
            <h2 className="mt-2 text-2xl font-bold text-dark">Stock register</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Review stock items, supplier details, used quantity, and remaining quantity in one central view.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-[260px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                value={inventorySearch}
                onChange={(event) => setInventorySearch(event.target.value)}
                placeholder="Search stock, category, supplier..."
                className="w-full rounded-full bg-surface py-3 pl-11 pr-4 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="button"
              onClick={openInventoryCreate}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5"
            >
              <Plus size={18} />
              Add Stock
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px]">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-bold uppercase tracking-widest text-muted">
                <th className="pb-5">Item</th>
                <th className="pb-5">Current Stock</th>
                <th className="pb-5">Used Today</th>
                <th className="pb-5">Used This Week</th>
                <th className="pb-5">Remaining</th>
                <th className="pb-5">Supplier</th>
                <th className="pb-5">Cost / Unit</th>
                <th className="pb-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-surface">
                  <td className="py-5">
                    <p className="font-bold text-dark">{item.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {item.category} • min {item.minStock} {item.unit}
                    </p>
                  </td>
                  <td className="py-5 font-semibold text-dark">
                    {item.stock} {item.unit}
                  </td>
                  <td className="py-5 text-sm font-semibold text-dark">
                    {item.usedToday} {item.unit}
                  </td>
                  <td className="py-5 text-sm font-semibold text-dark">
                    {item.usedThisWeek} {item.unit}
                  </td>
                  <td className="py-5 text-sm font-semibold text-dark">
                    {item.remainingQuantity} {item.unit}
                  </td>
                  <td className="py-5 text-sm text-muted">{item.supplier ?? "Not assigned"}</td>
                  <td className="py-5 text-sm font-semibold text-dark">
                    {formatMoney(Number(item.costPerUnit ?? 0))}
                  </td>
                  <td className="py-5">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openInventoryEdit(item)}
                        className="rounded-xl bg-surface-strong p-2 text-dark transition hover:bg-primary hover:text-white"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteInventoryItem(item)}
                        className="rounded-xl bg-surface-strong p-2 text-dark transition hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredInventory.length ? (
            <div className="rounded-3xl bg-surface px-6 py-12 text-center text-muted">
              No stock items matched your search.
            </div>
          ) : null}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2.9rem] border border-gray-50 bg-white p-8 shadow-xl shadow-dark/5"
      >
        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Vendors</p>
            <h2 className="mt-2 text-2xl font-bold text-dark">Vendor price and payment ledger</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Track rate comparisons, received quantities, bill payments, discounts, and outstanding balances here.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-[260px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                value={vendorSearch}
                onChange={(event) => setVendorSearch(event.target.value)}
                placeholder="Search vendor, item, status..."
                className="w-full rounded-full bg-surface py-3 pl-11 pr-4 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="button"
              onClick={openVendorCreate}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-dark px-6 py-3 font-bold text-white shadow-lg shadow-dark/15 transition hover:-translate-y-0.5"
            >
              <Plus size={18} />
              Add Vendor
            </button>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-surface px-5 py-5">
            <div className="mb-3 flex items-center gap-3">
              <Wallet size={18} className="text-primary" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted">Outstanding Bills</p>
            </div>
            <p className="text-2xl font-display font-bold text-dark">
              {formatMoney(vendorLedgerSummary.outstanding)}
            </p>
          </div>
          <div className="rounded-3xl bg-surface px-5 py-5">
            <div className="mb-3 flex items-center gap-3">
              <ClipboardList size={18} className="text-primary" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted">Total Purchase Value</p>
            </div>
            <p className="text-2xl font-display font-bold text-dark">
              {formatMoney(vendorLedgerSummary.totalPurchaseValue)}
            </p>
          </div>
          <div className="rounded-3xl bg-surface px-5 py-5">
            <div className="mb-3 flex items-center gap-3">
              <CheckCircle2 size={18} className="text-primary" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted">Vendor Coverage</p>
            </div>
            <p className="text-2xl font-display font-bold text-dark">{vendorLedgerSummary.activeVendors} vendors</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1450px]">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-bold uppercase tracking-widest text-muted">
                <th className="pb-5">Vendor</th>
                <th className="pb-5">Item</th>
                <th className="pb-5">Quoted</th>
                <th className="pb-5">Target</th>
                <th className="pb-5">Stock Now</th>
                <th className="pb-5">Min Qty</th>
                <th className="pb-5">Received</th>
                <th className="pb-5">Bill</th>
                <th className="pb-5">Paid</th>
                <th className="pb-5">Cut</th>
                <th className="pb-5">Balance</th>
                <th className="pb-5">Status</th>
                <th className="pb-5">Date</th>
                <th className="pb-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredVendors.map((vendor) => {
                const matchingInventory = inventory.find((item) => item.name === vendor.itemName);
                const balanceDue = Math.max(vendor.billAmount - vendor.discountCut - vendor.amountPaid, 0);
                const dealTone =
                  vendor.targetPrice > 0 && vendor.quotedPrice <= vendor.targetPrice ? "text-emerald-600" : "text-amber-600";

                return (
                  <tr key={vendor.id} className="transition-colors hover:bg-surface">
                    <td className="py-5">
                      <p className="font-bold text-dark">{vendor.vendorName}</p>
                      <p className="mt-1 text-xs text-muted">{vendor.notes || "No vendor notes added."}</p>
                    </td>
                    <td className="py-5 text-sm font-semibold text-dark">{vendor.itemName}</td>
                    <td className={`py-5 text-sm font-semibold ${dealTone}`}>{formatMoney(vendor.quotedPrice)}</td>
                    <td className="py-5 text-sm font-semibold text-dark">{formatMoney(vendor.targetPrice)}</td>
                    <td className="py-5 text-sm font-semibold text-dark">
                      {matchingInventory ? `${matchingInventory.stock} ${matchingInventory.unit}` : "Not linked"}
                    </td>
                    <td className="py-5 text-sm text-muted">
                      {vendor.minimumOrderQuantity} {vendor.unit}
                    </td>
                    <td className="py-5 text-sm font-semibold text-dark">
                      {vendor.quantityReceived} {vendor.unit}
                    </td>
                    <td className="py-5 text-sm font-semibold text-dark">{formatMoney(vendor.billAmount)}</td>
                    <td className="py-5 text-sm font-semibold text-dark">{formatMoney(vendor.amountPaid)}</td>
                    <td className="py-5 text-sm font-semibold text-dark">{formatMoney(vendor.discountCut)}</td>
                    <td className="py-5 text-sm font-semibold text-dark">{formatMoney(balanceDue)}</td>
                    <td className="py-5">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadgeClasses[vendor.status]}`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="py-5 text-sm text-muted">{formatDate(vendor.purchaseDate)}</td>
                    <td className="py-5">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openVendorEdit(vendor)}
                          className="rounded-xl bg-surface-strong p-2 text-dark transition hover:bg-primary hover:text-white"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteVendorRecord(vendor)}
                          className="rounded-xl bg-surface-strong p-2 text-dark transition hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!filteredVendors.length ? (
            <div className="rounded-3xl bg-surface px-6 py-12 text-center text-muted">
              The vendor ledger is empty. Add a vendor entry to get started.
            </div>
          ) : null}
        </div>
      </motion.section>
    </div>
  );
};

export default InventoryManagement;
