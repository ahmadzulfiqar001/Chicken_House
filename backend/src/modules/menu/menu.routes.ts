import express from "express";
import { requirePermission } from "../auth/auth.service";
import { db } from "../../core/db";
import { imageFor } from "../../core/catalog";
import { getMenuItemsWithAvailability } from "./menu.service";
import { MenuModel } from "../../core/models";
import { isMongoConnected } from "../../core/mongo";

const router = express.Router();

const normalizeVariants = (variants: unknown, fallbackPrice: unknown) => {
  if (Array.isArray(variants) && variants.length > 0) {
    return variants
      .map((variant) => {
        const current = variant as Record<string, unknown>;
        return {
          label: String(current.label ?? "").trim(),
          price: Number(current.price ?? 0),
        };
      })
      .filter((variant) => variant.label && Number.isFinite(variant.price) && variant.price >= 0);
  }

  return [{ label: "Moderate", price: Math.max(0, Number(fallbackPrice ?? 0)) }];
};

const normalizeMenuPayload = (body: Record<string, unknown>) => {
  const name = String(body.name ?? "").trim();
  const category = String(body.category ?? "").trim();
  const subcategory = String(body.subcategory ?? "").trim();
  const description = String(body.description ?? "").trim();
  const image = String(body.image ?? "").trim();
  const status = String(body.status ?? "Active").trim() || "Active";
  const featured = Boolean(body.featured);
  const popular = Boolean(body.popular);
  const recommended = Boolean(body.recommended ?? (featured || popular));
  const variants = normalizeVariants(body.variants, body.price);
  const inventoryUsage =
    body.inventoryUsage && typeof body.inventoryUsage === "object" ? body.inventoryUsage : {};

  if (name.length < 2) {
    return { error: "Menu item name is required." };
  }

  if (category.length < 2) {
    return { error: "Category is required." };
  }

  if (subcategory.length < 2) {
    return { error: "Subcategory is required." };
  }

  if (!variants.length) {
    return { error: "At least one valid price variant is required." };
  }

  return {
    data: {
      name,
      category,
      subcategory,
      description,
      image,
      status,
      featured,
      popular,
      recommended,
      variants,
      inventoryUsage,
    },
  };
};

// Public route - anyone can view menu
router.get("/", async (req, res) => {
  res.json(await getMenuItemsWithAvailability());
});

// Create menu item - requires menu:create permission
router.post("/", requirePermission("menu:create"), async (req, res) => {
  const normalized = normalizeMenuPayload(req.body ?? {});

  if ("error" in normalized) {
    return res.status(400).json({ message: normalized.error });
  }

  const newItem = {
    ...normalized.data,
    id: `MENU-${Date.now()}`,
    image:
      normalized.data.image ||
      imageFor(
        normalized.data.category ?? "House Specials",
        normalized.data.name ?? "Chicken House Item",
        normalized.data.subcategory ?? "Signature",
      ),
  };

  if (isMongoConnected()) {
    const created = await MenuModel.create(newItem);
    return res.status(201).json(created.toObject());
  }

  db.menu.push(newItem as any);
  res.status(201).json(newItem);
});

// Update menu item - requires menu:update permission
router.patch("/:id", requirePermission("menu:update"), async (req, res) => {
  const normalized = normalizeMenuPayload(req.body ?? {});

  if ("error" in normalized) {
    return res.status(400).json({ message: normalized.error });
  }

  if (isMongoConnected()) {
    const existing = await MenuModel.findOne({ id: req.params.id }).lean();

    if (!existing) {
      return res.status(404).json({ message: "Menu item not found." });
    }

    const updated = await MenuModel.findOneAndUpdate(
      { id: req.params.id },
      {
        ...normalized.data,
        id: existing.id,
        image:
          normalized.data.image ||
          existing.image ||
          imageFor(
            normalized.data.category ?? existing.category ?? "House Specials",
            normalized.data.name ?? existing.name ?? "Chicken House Item",
            normalized.data.subcategory ?? existing.subcategory ?? "Signature",
          ),
      },
      { new: true, runValidators: true },
    ).lean();

    return res.json(updated);
  }

  const index = db.menu.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Menu item not found." });
  }

  db.menu[index] = {
    ...db.menu[index],
    ...normalized.data,
    id: db.menu[index].id,
    image:
      normalized.data.image ||
      db.menu[index].image ||
      imageFor(
        normalized.data.category ?? db.menu[index].category ?? "House Specials",
        normalized.data.name ?? db.menu[index].name ?? "Chicken House Item",
        normalized.data.subcategory ?? db.menu[index].subcategory ?? "Signature",
      ),
  } as any;

  return res.json(db.menu[index]);
});

// Delete menu item - requires menu:delete permission
router.delete("/:id", requirePermission("menu:delete"), async (req, res) => {
  if (isMongoConnected()) {
    const deleted = await MenuModel.findOneAndDelete({ id: req.params.id }).lean();

    if (!deleted) {
      return res.status(404).json({ message: "Menu item not found." });
    }

    return res.json({ message: "Menu item deleted.", item: deleted });
  }

  const index = db.menu.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Menu item not found." });
  }

  const [deleted] = db.menu.splice(index, 1);
  return res.json({ message: "Menu item deleted.", item: deleted });
});

export default router;
