const express = require("express");
const mongoose = require("mongoose");
const Item = require("../models/Item");

const router = express.Router();

const normalizeItemPayload = (body = {}) => ({
  name: String(body.name ?? "").trim(),
  unit: String(body.unit ?? "").trim(),
  currentStock: Number(body.currentStock),
  reorderLevel: Number(body.reorderLevel),
  costPerUnit: Number(body.costPerUnit),
  supplierName: String(body.supplierName ?? "").trim(),
  isActive: body.isActive === undefined ? true : Boolean(body.isActive),
});

const validateItemPayload = (payload) => {
  if (!payload.name) {
    return "name is required";
  }

  if (!payload.unit) {
    return "unit is required";
  }

  if (!Number.isFinite(payload.currentStock) || payload.currentStock < 0) {
    return "currentStock must be a valid non-negative number";
  }

  if (!Number.isFinite(payload.reorderLevel) || payload.reorderLevel < 0) {
    return "reorderLevel must be a valid non-negative number";
  }

  if (!Number.isFinite(payload.costPerUnit) || payload.costPerUnit < 0) {
    return "costPerUnit must be a valid non-negative number";
  }

  return null;
};

router.get("/", async (_req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch items", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Item not found" });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch item", error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const payload = normalizeItemPayload(req.body);
    const validationError = validateItemPayload(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const created = await Item.create(payload);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create item", error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Item not found" });
    }

    const payload = normalizeItemPayload(req.body);
    const validationError = validateItemPayload(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const updated = await Item.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update item", error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Item not found" });
    }

    const deleted = await Item.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json({ message: "Item deleted successfully", item: deleted });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete item", error: error.message });
  }
});

module.exports = router;
