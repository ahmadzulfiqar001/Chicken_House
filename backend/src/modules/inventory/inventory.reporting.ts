import { getVariantFactor } from "../../core/catalog";

const round = (value: number) => Number(value.toFixed(2));

type InventoryItemLike = {
  id: number;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  supplier?: string;
  costPerUnit?: number;
  lastUpdated?: string;
};

type MenuItemLike = {
  id: string;
  name: string;
  inventoryUsage?: Record<string, number>;
  variants?: Array<{ label: string; price: number }>;
};

type OrderDetailLike = {
  menuItemId?: string;
  name?: string;
  quantity?: number;
  variantLabel?: string;
  customizations?: {
    variantLabel?: string;
  };
};

type OrderLike = {
  status?: string;
  time?: string;
  details?: OrderDetailLike[];
};

type VendorPurchaseLike = {
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
  status: string;
  notes?: string;
};

const isWithinLastDays = (value: string | undefined, days: number) => {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const now = Date.now();
  return date.getTime() >= now - days * 24 * 60 * 60 * 1000;
};

const buildUsageMap = (
  orders: OrderLike[],
  menuItems: MenuItemLike[],
  days: number,
) => {
  const byId = new Map(menuItems.map((item) => [item.id, item]));
  const byName = new Map(menuItems.map((item) => [item.name, item]));
  const usage = new Map<string, number>();

  orders
    .filter((order) => order.status !== "Cancelled" && isWithinLastDays(order.time, days))
    .forEach((order) => {
      (order.details ?? []).forEach((detail) => {
        const menuItem = byId.get(String(detail.menuItemId ?? "")) ?? byName.get(String(detail.name ?? ""));

        if (!menuItem) {
          return;
        }

        const quantity = Math.max(1, Number(detail.quantity ?? 1));
        const variantLabel =
          detail.variantLabel ??
          detail.customizations?.variantLabel ??
          menuItem.variants?.[0]?.label ??
          "Moderate";
        const factor = getVariantFactor(String(variantLabel));

        Object.entries(menuItem.inventoryUsage ?? {}).forEach(([ingredient, baseAmount]) => {
          const current = usage.get(ingredient) ?? 0;
          usage.set(ingredient, round(current + Number(baseAmount) * factor * quantity));
        });
      });
    });

  return usage;
};

export const enrichInventoryItems = (
  inventory: InventoryItemLike[],
  orders: OrderLike[],
  menuItems: MenuItemLike[],
) => {
  const todayUsage = buildUsageMap(orders, menuItems, 1);
  const weeklyUsage = buildUsageMap(orders, menuItems, 7);

  return inventory.map((item) => ({
    ...item,
    usedToday: round(todayUsage.get(item.name) ?? 0),
    usedThisWeek: round(weeklyUsage.get(item.name) ?? 0),
    remainingQuantity: round(Number(item.stock ?? 0)),
    lowStockAlert: Number(item.stock ?? 0) <= Number(item.minStock ?? 0),
  }));
};

export const buildInventoryReport = (
  inventory: InventoryItemLike[],
  orders: OrderLike[],
  menuItems: MenuItemLike[],
  vendorPurchases: VendorPurchaseLike[],
  window: "daily" | "weekly",
) => {
  const days = window === "daily" ? 1 : 7;
  const enriched = enrichInventoryItems(inventory, orders, menuItems);
  const filteredPurchases = vendorPurchases.filter((entry) => isWithinLastDays(entry.purchaseDate, days));

  const rows = enriched.map((item) => ({
    itemId: item.id,
    itemName: item.name,
    category: item.category,
    supplier: item.supplier ?? "Not assigned",
    unit: item.unit,
    usedQuantity: window === "daily" ? item.usedToday : item.usedThisWeek,
    remainingQuantity: item.remainingQuantity,
    currentStock: round(Number(item.stock ?? 0)),
    minimumLevel: round(Number(item.minStock ?? 0)),
    lowStockAlert: item.lowStockAlert,
  }));

  return {
    window,
    generatedAt: new Date().toISOString(),
    summary: {
      totalItems: inventory.length,
      lowStockItems: rows.filter((item) => item.lowStockAlert).length,
      totalUsedQuantity: round(rows.reduce((sum, item) => sum + Number(item.usedQuantity ?? 0), 0)),
      totalRemainingQuantity: round(rows.reduce((sum, item) => sum + Number(item.remainingQuantity ?? 0), 0)),
      purchaseValue: round(filteredPurchases.reduce((sum, item) => sum + Number(item.billAmount ?? 0), 0)),
      outstandingBills: round(
        filteredPurchases.reduce(
          (sum, item) => sum + Math.max(Number(item.billAmount ?? 0) - Number(item.discountCut ?? 0) - Number(item.amountPaid ?? 0), 0),
          0,
        ),
      ),
    },
    alerts: rows.filter((item) => item.lowStockAlert),
    rows,
    recentPurchases: filteredPurchases
      .sort((a, b) => String(b.purchaseDate).localeCompare(String(a.purchaseDate)))
      .slice(0, 10),
  };
};

export const getVendorPaymentStatus = (billAmount: number, amountPaid: number, discountCut: number) => {
  const due = Math.max(round(billAmount - discountCut - amountPaid), 0);

  if (due <= 0) {
    return "Paid";
  }

  if (amountPaid > 0 || discountCut > 0) {
    return "Partially Paid";
  }

  return "Unpaid";
};
