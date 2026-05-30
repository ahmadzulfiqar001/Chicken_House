import express from "express";
import { requirePermission } from "../auth/auth.service";
import { db } from "../../core/db";
import { ShiftScheduleModel } from "../../core/models";
import { isMongoConnected } from "../../core/mongo";

const router = express.Router();

// Get all shift schedules
router.get("/", requirePermission("hr:view"), async (req, res) => {
  const { staffId, date, startDate, endDate } = req.query;
  
  if (isMongoConnected()) {
    const filter: any = {};
    if (staffId) filter.staffId = Number(staffId);
    if (date) filter.date = date;
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }
    
    const shifts = await ShiftScheduleModel.find(filter).sort({ date: 1 }).lean();
    return res.json(shifts);
  }

  let shifts = db.shiftSchedules;
  if (staffId) shifts = shifts.filter(s => s.staffId === Number(staffId));
  if (date) shifts = shifts.filter(s => s.date === date);
  if (startDate && endDate) {
    shifts = shifts.filter(s => s.date >= startDate && s.date <= endDate);
  }
  
  res.json(shifts);
});

// Create shift schedule
router.post("/", requirePermission("hr:create"), async (req, res) => {
  if (isMongoConnected()) {
    const newShift = {
      ...req.body,
      id: `SH-${Date.now()}`,
    };

    const created = await ShiftScheduleModel.create(newShift);
    return res.status(201).json(created.toObject());
  }

  const newShift = {
    ...req.body,
    id: `SH-${Date.now()}`,
  };

  db.shiftSchedules.push(newShift);
  res.status(201).json(newShift);
});

// Bulk create shifts for multiple days
router.post("/bulk", requirePermission("hr:create"), async (req, res) => {
  const { staffId, staffName, startDate, endDate, shiftType, startTime, endTime } = req.body;

  const shifts = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    shifts.push({
      id: `SH-${Date.now()}-${shifts.length}`,
      staffId,
      staffName,
      date: dateStr,
      shiftType,
      startTime,
      endTime,
      notes: "",
    });
  }

  if (isMongoConnected()) {
    const created = await ShiftScheduleModel.insertMany(shifts);
    return res.status(201).json(created);
  }

  db.shiftSchedules.push(...shifts);
  res.status(201).json(shifts);
});

// Update shift schedule
router.patch("/:id", requirePermission("hr:update"), async (req, res) => {
  if (isMongoConnected()) {
    const updated = await ShiftScheduleModel.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Shift schedule not found" });
    }

    return res.json(updated);
  }

  const index = db.shiftSchedules.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Shift schedule not found" });
  }

  db.shiftSchedules[index] = { ...db.shiftSchedules[index], ...req.body };
  res.json(db.shiftSchedules[index]);
});

// Delete shift schedule
router.delete("/:id", requirePermission("hr:delete"), async (req, res) => {
  if (isMongoConnected()) {
    const deleted = await ShiftScheduleModel.findOneAndDelete({ id: req.params.id }).lean();
    if (!deleted) {
      return res.status(404).json({ message: "Shift schedule not found" });
    }
    return res.json({ message: "Shift schedule deleted", shift: deleted });
  }

  const index = db.shiftSchedules.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Shift schedule not found" });
  }

  const [deleted] = db.shiftSchedules.splice(index, 1);
  res.json({ message: "Shift schedule deleted", shift: deleted });
});

export default router;
