import express from "express";
import { requirePermission } from "../auth/auth.service";
import { db } from "../../core/db";
import { AttendanceModel } from "../../core/models";
import { isMongoConfigured } from "../../core/mongo";

const router = express.Router();

// Get all attendance records
router.get("/", requirePermission("hr:view"), async (req, res) => {
  const { staffId, date, month, year } = req.query;
  
  if (isMongoConfigured()) {
    const filter: any = {};
    if (staffId) filter.staffId = Number(staffId);
    if (date) filter.date = date;
    if (month && year) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
      filter.date = { $gte: startDate, $lte: endDate };
    }
    
    const attendance = await AttendanceModel.find(filter).sort({ date: -1 }).lean();
    return res.json(attendance);
  }

  let records = db.attendance;
  if (staffId) records = records.filter(a => a.staffId === Number(staffId));
  if (date) records = records.filter(a => a.date === date);
  
  res.json(records);
});

// Clock in
router.post("/clock-in", requirePermission("hr:update"), async (req, res) => {
  const { staffId, staffName } = req.body;
  const today = new Date().toISOString().slice(0, 10);
  const currentTime = new Date().toTimeString().slice(0, 5);

  if (isMongoConfigured()) {
    const existing = await AttendanceModel.findOne({ staffId, date: today }).lean();
    if (existing) {
      return res.status(400).json({ message: "Already clocked in today" });
    }

    const attendance = await AttendanceModel.create({
      id: `ATT-${Date.now()}`,
      staffId,
      staffName,
      date: today,
      clockIn: currentTime,
      clockOut: "",
      status: "Present",
      workHours: 0,
      notes: "",
    });

    return res.status(201).json(attendance.toObject());
  }

  const existing = db.attendance.find(a => a.staffId === staffId && a.date === today);
  if (existing) {
    return res.status(400).json({ message: "Already clocked in today" });
  }

  const newAttendance = {
    id: `ATT-${Date.now()}`,
    staffId,
    staffName,
    date: today,
    clockIn: currentTime,
    clockOut: "",
    status: "Present",
    workHours: 0,
    notes: "",
  };

  db.attendance.push(newAttendance);
  res.status(201).json(newAttendance);
});

// Clock out
router.post("/clock-out", requirePermission("hr:update"), async (req, res) => {
  const { staffId } = req.body;
  const today = new Date().toISOString().slice(0, 10);
  const currentTime = new Date().toTimeString().slice(0, 5);

  if (isMongoConfigured()) {
    const attendance = await AttendanceModel.findOne({ staffId, date: today });
    if (!attendance) {
      return res.status(404).json({ message: "No clock-in record found" });
    }

    if (attendance.clockOut) {
      return res.status(400).json({ message: "Already clocked out" });
    }

    const clockInTime = new Date(`2000-01-01T${attendance.clockIn}`);
    const clockOutTime = new Date(`2000-01-01T${currentTime}`);
    let workHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
    if (workHours < 0) workHours += 24; // overnight shift rollover
    workHours = Math.max(0, workHours);

    attendance.clockOut = currentTime;
    attendance.workHours = Math.round(workHours * 100) / 100;
    await attendance.save();

    return res.json(attendance.toObject());
  }

  const attendance = db.attendance.find(a => a.staffId === staffId && a.date === today);
  if (!attendance) {
    return res.status(404).json({ message: "No clock-in record found" });
  }

  if (attendance.clockOut) {
    return res.status(400).json({ message: "Already clocked out" });
  }

  const clockInTime = new Date(`2000-01-01T${attendance.clockIn}`);
  const clockOutTime = new Date(`2000-01-01T${currentTime}`);
  const workHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

  attendance.clockOut = currentTime;
  attendance.workHours = Math.round(workHours * 100) / 100;

  res.json(attendance);
});

// Mark attendance manually
router.post("/", requirePermission("hr:create"), async (req, res) => {
  if (isMongoConfigured()) {
    const newAttendance = {
      ...req.body,
      id: `ATT-${Date.now()}`,
    };

    const created = await AttendanceModel.create(newAttendance);
    return res.status(201).json(created.toObject());
  }

  const newAttendance = {
    ...req.body,
    id: `ATT-${Date.now()}`,
  };

  db.attendance.push(newAttendance);
  res.status(201).json(newAttendance);
});

// Update attendance
router.patch("/:id", requirePermission("hr:update"), async (req, res) => {
  if (isMongoConfigured()) {
    const updated = await AttendanceModel.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    return res.json(updated);
  }

  const index = db.attendance.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Attendance record not found" });
  }

  db.attendance[index] = { ...db.attendance[index], ...req.body };
  res.json(db.attendance[index]);
});

// Delete attendance
router.delete("/:id", requirePermission("hr:delete"), async (req, res) => {
  if (isMongoConfigured()) {
    const deleted = await AttendanceModel.findOneAndDelete({ id: req.params.id }).lean();
    if (!deleted) {
      return res.status(404).json({ message: "Attendance record not found" });
    }
    return res.json({ message: "Attendance deleted", attendance: deleted });
  }

  const index = db.attendance.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Attendance record not found" });
  }

  const [deleted] = db.attendance.splice(index, 1);
  res.json({ message: "Attendance deleted", attendance: deleted });
});

export default router;
