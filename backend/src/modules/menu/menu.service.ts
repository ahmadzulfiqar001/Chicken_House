import { getVariantFactor, menuSeed } from "../../core/catalog";
import { db } from "../../core/db";
import { InventoryModel, MenuModel } from "../../core/models";
import { isMongoConnected } from "../../core/mongo";

const round = (value: number) => Number(value.toFixed(2));

const getInventoryItem = (name: string) =>
  db.inventory.find((item) => item.name === name);

const getInventoryItems = async () => {
  if (isMongoConnected()) {
    return InventoryModel.find().lean();
  }

  return db.inventory;
};

const getMenuItems = async () => {
  if (isMongoConnected()) {
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

  if (isMongoConnected()) {
    await Promise.all(
      Array.from(deductions.entries()).map(async ([ingredient, required]) => {
        const inventoryItem = inventoryMap.get(ingredient);

        if (!inventoryItem) return;

        const nextStock = round(Math.max(0, inventoryItem.stock - required));
        await InventoryModel.updateOne(
          { id: inventoryItem.id },
          { stock: nextStock, lastUpdated: new Date().toISOString() },
        );
      }),
    );
  } else {
    deductions.forEach((required, ingredient) => {
      const inventoryItem = getInventoryItem(ingredient);
      if (!inventoryItem) return;

      inventoryItem.stock = round(Math.max(0, inventoryItem.stock - required));
    });
  }

  return { ok: true as const, deductions: Object.fromEntries(deductions) };
};
