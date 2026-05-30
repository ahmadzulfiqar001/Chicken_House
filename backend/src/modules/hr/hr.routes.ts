import express from "express";
import { requirePermission } from "../auth/auth.service";
import { db } from "../../core/db";
import { StaffModel } from "../../core/models";
import { isMongoConnected } from "../../core/mongo";

const router = express.Router();

router.get("/", requirePermission("hr:view"), async (req, res) => {
  if (isMongoConnected()) {
    const staff = await StaffModel.find().sort({ id: 1 }).lean();
    return res.json(staff);
  }

  res.json(db.staff);
});

router.post("/", requirePermission("hr:create"), async (req, res) => {
  if (isMongoConnected()) {
    const latest = await StaffModel.findOne().sort({ id: -1 }).select("id").lean();
    const newStaff = {
      ...req.body,
      id: (latest?.id ?? 0) + 1,
      joinDate: req.body.joinDate ?? new Date().toISOString().slice(0, 10),
    };

    const created = await StaffModel.create(newStaff);
    return res.status(201).json(created.toObject());
  }

  const newStaff = {
    ...req.body,
    id: db.staff.reduce((max, member) => Math.max(max, Number(member.id) || 0), 0) + 1,
    joinDate: req.body.joinDate ?? new Date().toISOString().slice(0, 10),
  };
  db.staff.push(newStaff);
  res.status(201).json(newStaff);
});

router.patch("/:id", requirePermission("hr:update"), async (req, res) => {
  if (isMongoConnected()) {
    const updated = await StaffModel.findOneAndUpdate(
      { id: Number(req.params.id) },
      req.body,
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Staff member not found." });
    }

    return res.json(updated);
  }

  const id = Number(req.params.id);
  const index = db.staff.findIndex((member) => Number(member.id) === id);

  if (index === -1) {
    return res.status(404).json({ message: "Staff member not found." });
  }

  db.staff[index] = {
    ...db.staff[index],
    ...req.body,
    id: db.staff[index].id,
  };

  return res.json(db.staff[index]);
});

router.delete("/:id", requirePermission("hr:delete"), async (req, res) => {
  if (isMongoConnected()) {
    const deleted = await StaffModel.findOneAndDelete({ id: Number(req.params.id) }).lean();

    if (!deleted) {
      return res.status(404).json({ message: "Staff member not found." });
    }

    return res.json({ message: "Staff member deleted.", staff: deleted });
  }

  const id = Number(req.params.id);
  const index = db.staff.findIndex((member) => Number(member.id) === id);

  if (index === -1) {
    return res.status(404).json({ message: "Staff member not found." });
  }

  const [deleted] = db.staff.splice(index, 1);
  return res.json({ message: "Staff member deleted.", staff: deleted });
});

export default router;
