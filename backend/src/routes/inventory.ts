import express from "express";
import { requirePermission } from "../auth";
import { db } from "../db";
import { buildInventoryReport, enrichInventoryItems, getVendorPaymentStatus } from "../inventory-reporting";
import { InventoryModel, MenuModel, OrderModel, VendorPurchaseModel } from "../models";
import { isMongoConnected } from "../mongo";

const router = express.Router();

const normalizeInventoryPayload = (body: Record<string, unknown>) => {
  const name = String(body.name ?? "").trim();
  const category = String(body.category ?? "").trim();
  const stock = Number(body.stock ?? 0);
  const minStock = Number(body.minStock ?? 0);
  const unit = String(body.unit ?? "pcs").trim() || "pcs";
  const supplier = String(body.supplier ?? "").trim() || "Chicken House Supplier";
  const costPerUnit = Number(body.costPerUnit ?? body.price ?? 0);

  if (name.length < 2) {
    return { error: "Inventory item name is required." };
  }

  if (category.length < 2) {
    return { error: "Inventory category is required." };
  }

  if (!Number.isFinite(stock) || stock < 0) {
    return { error: "Current stock must be a valid non-negative number." };
  }

  if (!Number.isFinite(minStock) || minStock < 0) {
    return { error: "Minimum stock must be a valid non-negative number." };
  }

  return {
    data: {
      name,
      category,
      stock,
      minStock,
      unit,
      supplier,
      costPerUnit,
      price: costPerUnit,
      lastUpdated: new Date().toISOString(),
    },
  };
};

const normalizeVendorPayload = (body: Record<string, unknown>) => {
  const vendorName = String(body.vendorName ?? "").trim();
  const itemName = String(body.itemName ?? "").trim();
  const unit = String(body.unit ?? "kg").trim() || "kg";
  const quotedPrice = Number(body.quotedPrice ?? 0);
  const targetPrice = Number(body.targetPrice ?? 0);
  const quantityReceived = Number(body.quantityReceived ?? 0);
  const minimumOrderQuantity = Number(body.minimumOrderQuantity ?? 0);
  const billAmount = Number(body.billAmount ?? 0);
  const amountPaid = Number(body.amountPaid ?? 0);
  const discountCut = Number(body.discountCut ?? 0);
  const purchaseDate = String(body.purchaseDate ?? "").trim() || new Date().toISOString();
  const notes = String(body.notes ?? "").trim();

  if (vendorName.length < 2) {
    return { error: "Vendor name is required." };
  }

  if (itemName.length < 2) {
    return { error: "Item name is required." };
  }

  if (!Number.isFinite(quantityReceived) || quantityReceived < 0) {
    return { error: "Received quantity must be a valid non-negative number." };
  }

  if (!Number.isFinite(billAmount) || billAmount < 0) {
    return { error: "Bill amount must be a valid non-negative number." };
  }

  return {
    data: {
      vendorName,
      itemName,
      unit,
      quotedPrice: Number.isFinite(quotedPrice) ? quotedPrice : 0,
      targetPrice: Number.isFinite(targetPrice) ? targetPrice : 0,
      quantityReceived,
      minimumOrderQuantity: Number.isFinite(minimumOrderQuantity) ? minimumOrderQuantity : 0,
      billAmount,
      amountPaid: Number.isFinite(amountPaid) ? amountPaid : 0,
      discountCut: Number.isFinite(discountCut) ? discountCut : 0,
      purchaseDate,
      notes,
      status: getVendorPaymentStatus(billAmount, Number(amountPaid ?? 0), Number(discountCut ?? 0)),
    },
  };
};

const adjustInventoryStock = async (itemName: string, delta: number, vendorName?: string) => {
  if (!delta) {
    return;
  }

  if (isMongoConnected()) {
    const item = await InventoryModel.findOne({ name: itemName });

    if (!item) {
      return;
    }

    item.stock = Math.max(0, Number(item.stock ?? 0) + delta);
    if (vendorName) {
      item.supplier = vendorName;
    }
    item.lastUpdated = new Date().toISOString();
    await item.save();
    return;
  }

  const item = db.inventory.find((entry) => entry.name === itemName);

  if (!item) {
    return;
  }

  const mutableItem = item as typeof item & { supplier?: string; lastUpdated?: string };

  mutableItem.stock = Math.max(0, Number(mutableItem.stock ?? 0) + delta);
  if (vendorName) {
    mutableItem.supplier = vendorName;
  }
  mutableItem.lastUpdated = new Date().toISOString();
};

const loadInventoryContext = async () => {
  if (isMongoConnected()) {
    const [inventory, orders, menu, vendors] = await Promise.all([
      InventoryModel.find().sort({ id: 1 }).lean(),
      OrderModel.find().lean(),
      MenuModel.find().lean(),
      VendorPurchaseModel.find().sort({ purchaseDate: -1 }).lean(),
    ]);

    return { inventory, orders, menu, vendors };
  }

  return {
    inventory: db.inventory,
    orders: db.orders,
    menu: db.menu,
    vendors: db.vendorPurchases,
  };
};

router.get("/", requirePermission("inventory:view"), async (_req, res) => {
  const context = await loadInventoryContext();
  return res.json(enrichInventoryItems(context.inventory, context.orders, context.menu));
});

router.get("/reports", requirePermission("inventory:view"), async (req, res) => {
  const window = req.query.window === "daily" ? "daily" : "weekly";
  const context = await loadInventoryContext();
  return res.json(buildInventoryReport(context.inventory, context.orders, context.menu, context.vendors, window));
});

router.get("/vendors", requirePermission("inventory:view"), async (_req, res) => {
  if (isMongoConnected()) {
    const entries = await VendorPurchaseModel.find().sort({ purchaseDate: -1 }).lean();
    return res.json(entries);
  }

  return res.json([...db.vendorPurchases].sort((a, b) => String(b.purchaseDate).localeCompare(String(a.purchaseDate))));
});

router.post("/vendors", requirePermission("inventory:create"), async (req, res) => {
  const normalized = normalizeVendorPayload(req.body ?? {});

  if ("error" in normalized) {
    return res.status(400).json({ message: normalized.error });
  }

  const record = {
    id: `VND-${Date.now()}`,
    ...normalized.data,
  };

  await adjustInventoryStock(record.itemName, record.quantityReceived, record.vendorName);

  if (isMongoConnected()) {
    const created = await VendorPurchaseModel.create(record);
    return res.status(201).json(created.toObject());
  }

  db.vendorPurchases.unshift(record);
  return res.status(201).json(record);
});

router.patch("/vendors/:id", requirePermission("inventory:update"), async (req, res) => {
  const normalized = normalizeVendorPayload(req.body ?? {});

  if ("error" in normalized) {
    return res.status(400).json({ message: normalized.error });
  }

  if (isMongoConnected()) {
    const existing = await VendorPurchaseModel.findOne({ id: req.params.id });

    if (!existing) {
      return res.status(404).json({ message: "Vendor record not found." });
    }

    await adjustInventoryStock(existing.itemName, -Number(existing.quantityReceived ?? 0));
    await adjustInventoryStock(normalized.data.itemName, Number(normalized.data.quantityReceived ?? 0), normalized.data.vendorName);

    existing.vendorName = normalized.data.vendorName;
    existing.itemName = normalized.data.itemName;
    existing.unit = normalized.data.unit;
    existing.quotedPrice = normalized.data.quotedPrice;
    existing.targetPrice = normalized.data.targetPrice;
    existing.quantityReceived = normalized.data.quantityReceived;
    existing.minimumOrderQuantity = normalized.data.minimumOrderQuantity;
    existing.billAmount = normalized.data.billAmount;
    existing.amountPaid = normalized.data.amountPaid;
    existing.discountCut = normalized.data.discountCut;
    existing.purchaseDate = normalized.data.purchaseDate;
    existing.notes = normalized.data.notes;
    existing.status = normalized.data.status;

    await existing.save();
    return res.json(existing.toObject());
  }

  const index = db.vendorPurchases.findIndex((entry) => entry.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Vendor record not found." });
  }

  const existing = db.vendorPurchases[index];
  await adjustInventoryStock(existing.itemName, -Number(existing.quantityReceived ?? 0));
  await adjustInventoryStock(normalized.data.itemName, Number(normalized.data.quantityReceived ?? 0), normalized.data.vendorName);

  db.vendorPurchases[index] = {
    ...existing,
    ...normalized.data,
    id: existing.id,
  };

  return res.json(db.vendorPurchases[index]);
});

router.delete("/vendors/:id", requirePermission("inventory:delete"), async (req, res) => {
  if (isMongoConnected()) {
    const existing = await VendorPurchaseModel.findOne({ id: req.params.id });

    if (!existing) {
      return res.status(404).json({ message: "Vendor record not found." });
    }

    await adjustInventoryStock(existing.itemName, -Number(existing.quantityReceived ?? 0));
    await VendorPurchaseModel.deleteOne({ id: req.params.id });
    return res.json({ message: "Vendor record deleted.", item: existing.toObject() });
  }

  const index = db.vendorPurchases.findIndex((entry) => entry.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Vendor record not found." });
  }

  const [deleted] = db.vendorPurchases.splice(index, 1);
  await adjustInventoryStock(deleted.itemName, -Number(deleted.quantityReceived ?? 0));
  return res.json({ message: "Vendor record deleted.", item: deleted });
});

router.post("/", requirePermission("inventory:create"), async (req, res) => {
  const normalized = normalizeInventoryPayload(req.body ?? {});

  if ("error" in normalized) {
    return res.status(400).json({ message: normalized.error });
  }

  if (isMongoConnected()) {
    const latest = await InventoryModel.findOne().sort({ id: -1 }).select("id").lean();
    const nextId = (latest?.id ?? 0) + 1;

    const created = await InventoryModel.create({
      id: nextId,
      ...normalized.data,
    });
    return res.status(201).json(created.toObject());
  }

  const nextId = db.inventory.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
  const newItem = {
    id: nextId,
    ...normalized.data,
  };

  db.inventory.push(newItem);
  return res.status(201).json(newItem);
});

router.patch("/:id", requirePermission("inventory:update"), async (req, res) => {
  const normalized = normalizeInventoryPayload(req.body ?? {});

  if ("error" in normalized) {
    return res.status(400).json({ message: normalized.error });
  }

  if (isMongoConnected()) {
    const updated = await InventoryModel.findOneAndUpdate(
      { id: Number(req.params.id) },
      normalized.data,
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.json(updated);
  }

  const index = db.inventory.findIndex((item) => item.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: "Item not found" });
  }

  db.inventory[index] = {
    ...db.inventory[index],
    ...normalized.data,
    id: db.inventory[index].id,
  };

  return res.json(db.inventory[index]);
});

router.delete("/:id", requirePermission("inventory:delete"), async (req, res) => {
  if (isMongoConnected()) {
    const deleted = await InventoryModel.findOneAndDelete({ id: Number(req.params.id) }).lean();

    if (!deleted) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.json({ message: "Inventory item deleted", item: deleted });
  }

  const index = db.inventory.findIndex((item) => item.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: "Item not found" });
  }

  const [deleted] = db.inventory.splice(index, 1);
  return res.json({ message: "Inventory item deleted", item: deleted });
});

export default router;
