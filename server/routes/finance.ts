import express from "express";
import { requirePermission } from "../auth";
import { db } from "../db";
import { buildFinanceSummary } from "../finance-reporting";
import { FinanceModel, OrderModel } from "../models";
import { isMongoConnected } from "../mongo";

const router = express.Router();

const normalizeFinancePayload = (body: Record<string, unknown>) => {
  const type = String(body.type ?? "").trim();
  const amount = Number(body.amount ?? 0);
  const source = String(body.source ?? "").trim();
  const category = String(body.category ?? "").trim() || "General";
  const date = String(body.date ?? "").trim() || new Date().toISOString();

  if (type !== "Credit" && type !== "Debit") {
    return { error: "Transaction type must be either Credit or Debit." };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Amount must be a valid number greater than zero." };
  }

  if (source.length < 2) {
    return { error: "Source or reason is required." };
  }

  if (Number.isNaN(new Date(date).getTime())) {
    return { error: "Transaction date is invalid." };
  }

  return {
    data: {
      type,
      amount,
      source,
      category,
      date,
    },
  };
};

router.get("/summary", requirePermission("finance:view"), async (_req, res) => {
  if (isMongoConnected()) {
    const [transactions, orders] = await Promise.all([
      FinanceModel.find().sort({ date: -1 }).lean(),
      OrderModel.find().lean(),
    ]);

    return res.json(buildFinanceSummary(transactions, orders));
  }

  return res.json(buildFinanceSummary(db.finance, db.orders));
});

router.get("/", requirePermission("finance:view"), async (req, res) => {
  if (isMongoConnected()) {
    const transactions = await FinanceModel.find().sort({ date: -1 }).lean();
    return res.json(transactions);
  }

  res.json(db.finance);
});

router.post("/", requirePermission("finance:create"), async (req, res) => {
  const normalized = normalizeFinancePayload(req.body ?? {});

  if ("error" in normalized) {
    return res.status(400).json({ message: normalized.error });
  }

  const newTx = {
    ...normalized.data,
    id: `TX-${Date.now()}`,
  };

  if (isMongoConnected()) {
    const created = await FinanceModel.create(newTx);
    return res.status(201).json(created.toObject());
  }

  db.finance.unshift(newTx);
  res.status(201).json(newTx);
});

router.patch("/:id", requirePermission("finance:update"), async (req, res) => {
  const normalized = normalizeFinancePayload(req.body ?? {});

  if ("error" in normalized) {
    return res.status(400).json({ message: normalized.error });
  }

  if (isMongoConnected()) {
    const updated = await FinanceModel.findOneAndUpdate(
      { id: req.params.id },
      normalized.data,
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    return res.json(updated);
  }

  const index = db.finance.findIndex((tx) => tx.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Transaction not found." });
  }

  db.finance[index] = {
    ...db.finance[index],
    ...normalized.data,
    id: db.finance[index].id,
  };

  return res.json(db.finance[index]);
});

router.delete("/:id", requirePermission("finance:delete"), async (req, res) => {
  if (isMongoConnected()) {
    const deleted = await FinanceModel.findOneAndDelete({ id: req.params.id }).lean();

    if (!deleted) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    return res.json({ message: "Transaction deleted.", transaction: deleted });
  }

  const index = db.finance.findIndex((tx) => tx.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Transaction not found." });
  }

  const [deleted] = db.finance.splice(index, 1);
  return res.json({ message: "Transaction deleted.", transaction: deleted });
});

export default router;
