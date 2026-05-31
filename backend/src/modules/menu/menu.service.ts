import { getVariantFactor, menuSeed } from "../../core/catalog";
import { db } from "../../core/db";
import { InventoryModel, MenuModel } from "../../core/models";
import { isMongoConfigured } from "../../core/mongo";

const round = (value: number) => Number(value.toFixed(2));

const getInventoryItem = (name: string) =>
  db.inventory.find((item) => item.name === name);

const getInventoryItems = async () => {
  if (isMongoConfigured()) {
    return InventoryModel.find().lean();
  }

  return db.inventory;
};

const getMenuItems = async () => {
  if (isMongoConfigured()) {
    const mongoItems = await MenuModel.find().lean();
    const looksLikeLegacySeed = mongoItems.some(
      (item) => item.name === "Chicken Karahi" && item.category === "Desi (Pakistani)",
    );

    if (mongoItems.length === 0 || looksLikeLegacySeed) {
      return menuSeed;
    }

    return mongoItems;
  }

  return db.menu;
};

export const getMenuItemsWithAvailability = async () => {
  const [menuItems, inventoryItems] = await Promise.all([getMenuItems(), getInventoryItems()]);
  const inventoryMap = new Map(inventoryItems.map((item) => [item.name, item]));

  return menuItems.map((item) => {
    if (item.status !== "Active") {
      return {
        ...item,
        startingPrice: Math.min(...item.variants.map((variant) => variant.price)),
        stockStatus: "Coming Soon",
        available: false,
      };
    }

    const baseFactor = Math.min(
      ...item.variants.map((variant) => getVariantFactor(variant.label)),
    );

    const usageEntries = Object.entries(item.inventoryUsage ?? {});
    const ratios = usageEntries
      .map(([inventoryName, amount]) => {
        const inventoryItem = inventoryMap.get(inventoryName);

        if (!inventoryItem) return 999;
        const required = Number(amount) * baseFactor;

        if (required <= 0) return 999;
        return inventoryItem.stock / required;
      })
      .filter((ratio) => Number.isFinite(ratio));

    const minRatio = ratios.length ? Math.min(...ratios) : 999;
    let stockStatus = "Available";

    if (minRatio < 1) stockStatus = "Out of Stock";
    else if (minRatio < 3) stockStatus = "Low Stock";

    return {
      ...item,
      startingPrice: Math.min(...item.variants.map((variant) => variant.price)),
      stockStatus,
      available: stockStatus !== "Out of Stock",
    };
  });
};

/**
 * Re-price order lines against the authoritative menu so the server never
 * trusts a client-supplied total. Unknown/inactive items are rejected, and a
 * line price can never drop below the menu variant price (prevents underpayment
 * fraud while still allowing add-on extras the customer legitimately added).
 */
export const priceOrderDetails = async (details: any[] = []) => {
  const menuItems = await getMenuItems();
  const menuById = new Map(menuItems.map((item) => [String(item.id), item]));
  const menuByName = new Map(menuItems.map((item) => [String(item.name).toLowerCase(), item]));
  const priced: any[] = [];
  const errors: string[] = [];

  for (const detail of details) {
    const menuItem =
      menuById.get(String(detail.menuItemId ?? "")) ??
      menuByName.get(String(detail.name ?? "").toLowerCase());

    if (!menuItem || menuItem.status !== "Active") {
      errors.push(`Item not available: ${detail.name ?? detail.menuItemId ?? "unknown"}`);
      continue;
    }

    const variants = Array.isArray(menuItem.variants) ? menuItem.variants : [];
    const requestedLabel = String(
      detail.variantLabel ?? detail.customizations?.variantLabel ?? variants[0]?.label ?? "",
    );
    const variant = variants.find((v: any) => String(v.label) === requestedLabel) ?? variants[0];
    const basePrice = Math.max(0, Number(variant?.price ?? 0));
    const clientPrice = Math.max(0, Number(detail.price ?? 0));
    // Clamp to the menu base price (no underpayment) up to base + a generous
    // add-ons ceiling (no absurd inflation from a tampered/buggy client).
    const EXTRAS_CEILING = 5000;
    const unitPrice = Math.min(Math.max(clientPrice, basePrice), basePrice + EXTRAS_CEILING);
    const quantity = Math.max(1, Number(detail.quantity ?? 1));

    priced.push({
      ...detail,
      name: menuItem.name,
      menuItemId: String(menuItem.id),
      variantLabel: variant?.label ?? requestedLabel,
      quantity,
      price: round(unitPrice),
    });
  }

  const subtotal = round(priced.reduce((sum, d) => sum + d.price * d.quantity, 0));
  return { ok: errors.length === 0 && priced.length > 0, errors, priced, subtotal };
};

export const reserveInventoryForOrder = async (details: any[] = []) => {
  const [menuItems, inventoryItems] = await Promise.all([getMenuItems(), getInventoryItems()]);
  const menuMap = new Map(menuItems.map((item) => [item.id, item]));
  const menuByName = new Map(menuItems.map((item) => [item.name, item]));
  const inventoryMap = new Map(inventoryItems.map((item) => [item.name, item]));
  const deductions = new Map<string, number>();
  const shortages: Array<{ item: string; ingredient: string; required: number; available: number }> = [];

  details.forEach((detail) => {
    const menuItem = menuMap.get(detail.menuItemId) ?? menuByName.get(detail.name);

    if (!menuItem || menuItem.status !== "Active") {
      return;
    }

    const factor = getVariantFactor(
      detail.variantLabel ?? detail.customizations?.variantLabel ?? menuItem.variants[0]?.label ?? "Moderate",
    );
    const quantity = Number(detail.quantity ?? 1);

    Object.entries(menuItem.inventoryUsage ?? {}).forEach(([ingredient, baseAmount]) => {
      const nextAmount = (deductions.get(ingredient) ?? 0) + Number(baseAmount) * factor * quantity;
      deductions.set(ingredient, round(nextAmount));
    });
  });

  deductions.forEach((required, ingredient) => {
    const inventoryItem = inventoryMap.get(ingredient);
    const available = inventoryItem?.stock ?? 0;

    if (!inventoryItem || available < required) {
      shortages.push({
        item: ingredient,
        ingredient,
        required: round(required),
        available: round(available),
      });
    }
  });

  if (shortages.length > 0) {
    return { ok: false as const, shortages };
  }

  if (isMongoConfigured()) {
    // Atomic conditional decrements: each only succeeds if stock is still
    // sufficient at write time (prevents oversell under concurrency). If any
    // line fails, roll back the ones already applied and report the shortage.
    const applied: Array<{ id: unknown; amount: number }> = [];
    for (const [ingredient, required] of deductions.entries()) {
      const inventoryItem = inventoryMap.get(ingredient);
      if (!inventoryItem) continue;

      const result = await InventoryModel.updateOne(
        { id: inventoryItem.id, stock: { $gte: required } },
        { $inc: { stock: -required }, $set: { lastUpdated: new Date().toISOString() } },
      );

      if (!result.modifiedCount) {
        await Promise.all(
          applied.map((entry) => InventoryModel.updateOne({ id: entry.id }, { $inc: { stock: entry.amount } })),
        );
        return {
          ok: false as const,
          shortages: [
            { item: ingredient, ingredient, required: round(required), available: round(inventoryItem.stock) },
          ],
        };
      }
      applied.push({ id: inventoryItem.id, amount: required });
    }
  } else {
    deductions.forEach((required, ingredient) => {
      const inventoryItem = getInventoryItem(ingredient);
      if (!inventoryItem) return;

      inventoryItem.stock = round(Math.max(0, inventoryItem.stock - required));
    });
  }

  return { ok: true as const, deductions: Object.fromEntries(deductions) };
};
