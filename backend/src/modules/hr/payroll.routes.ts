import express from "express";
import { requirePermission } from "../auth/auth.service";
import { db } from "../../core/db";
import { PayrollModel, AttendanceModel } from "../../core/models";
import { isMongoConfigured } from "../../core/mongo";

const router = express.Router();

// Get all payroll records
router.get("/", requirePermission("hr:view"), async (req, res) => {
  const { staffId, month, year, status } = req.query;
  
  if (isMongoConfigured()) {
    const filter: any = {};
    if (staffId) filter.staffId = Number(staffId);
    if (month) filter.month = month;
    if (year) filter.year = Number(year);
    if (status) filter.status = status;
    
    const payroll = await PayrollModel.find(filter).sort({ year: -1, month: -1 }).lean();
    return res.json(payroll);
  }

  let payroll = db.payroll;
  if (staffId) payroll = payroll.filter(p => p.staffId === Number(staffId));
  if (month) payroll = payroll.filter(p => p.month === month);
  if (year) payroll = payroll.filter(p => p.year === Number(year));
  if (status) payroll = payroll.filter(p => p.status === status);
  
  res.json(payroll);
});

// Generate payroll for a staff member
router.post("/generate", requirePermission("hr:create"), async (req, res) => {
  const { staffId, staffName, month, year } = req.body;
  const baseSalary = Number(req.body?.baseSalary);
  const bonus = Number(req.body?.bonus ?? 0) || 0;
  const deductions = Number(req.body?.deductions ?? 0) || 0;

  if (!Number.isFinite(baseSalary) || baseSalary <= 0) {
    return res.status(400).json({ message: "A valid base salary is required to generate payroll." });
  }

  // Calculate attendance stats
  let presentDays = 0;
  let absentDays = 0;
  let leaveDays = 0;
  const workingDays = 26; // Standard working days

  if (isMongoConfigured()) {
    const monthStr = String(month).padStart(2, '0');
    const startDate = `${year}-${monthStr}-01`;
    const endDate = `${year}-${monthStr}-31`;
    
    const attendance = await AttendanceModel.find({
      staffId,
      date: { $gte: startDate, $lte: endDate }
    }).lean();

    presentDays = attendance.filter(a => a.status === "Present" || a.status === "Late").length;
    absentDays = attendance.filter(a => a.status === "Absent").length;
    leaveDays = attendance.filter(a => a.status === "Leave").length;
  } else {
    const monthStr = String(month).padStart(2, '0');
    const attendance = db.attendance.filter(a => 
      a.staffId === staffId && a.date.startsWith(`${year}-${monthStr}`)
    );

    presentDays = attendance.filter(a => a.status === "Present" || a.status === "Late").length;
    absentDays = attendance.filter(a => a.status === "Absent").length;
    leaveDays = attendance.filter(a => a.status === "Leave").length;
  }

  // Calculate net salary
  const dailySalary = baseSalary / workingDays;
  const absentDeduction = dailySalary * absentDays;
  const totalDeductions = (deductions || 0) + absentDeduction;
  const netSalary = baseSalary + (bonus || 0) - totalDeductions;

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthName = monthNames[month - 1];

  if (isMongoConfigured()) {
    const newPayroll = {
      id: `PAY-${Date.now()}`,
      staffId,
      staffName,
      month: monthName,
      year,
      baseSalary,
      bonus: bonus || 0,
      deductions: Math.round(totalDeductions),
      netSalary: Math.round(netSalary),
      workingDays,
      presentDays,
      absentDays,
      leaveDays,
      status: "Pending",
      paidAt: "",
      paymentMethod: "Bank Transfer",
      notes: "",
    };

    const created = await PayrollModel.create(newPayroll);
    return res.status(201).json(created.toObject());
  }

  const newPayroll = {
    id: `PAY-${Date.now()}`,
    staffId,
    staffName,
    month: monthName,
    year,
    baseSalary,
    bonus: bonus || 0,
    deductions: Math.round(totalDeductions),
    netSalary: Math.round(netSalary),
    workingDays,
    presentDays,
    absentDays,
    leaveDays,
    status: "Pending",
    paidAt: "",
    paymentMethod: "Bank Transfer",
    notes: "",
  };

  db.payroll.push(newPayroll);
  res.status(201).json(newPayroll);
});

// Mark payroll as paid
router.patch("/:id/pay", requirePermission("hr:update"), async (req, res) => {
  const { paymentMethod } = req.body;

  if (isMongoConfigured()) {
    const payroll = await PayrollModel.findOne({ id: req.params.id });
    if (!payroll) {
      return res.status(404).json({ message: "Payroll record not found" });
    }

    payroll.status = "Paid";
    payroll.paidAt = new Date().toISOString();
    payroll.paymentMethod = paymentMethod || "Bank Transfer";

    await payroll.save();
    return res.json(payroll.toObject());
  }

  const payroll = db.payroll.find(p => p.id === req.params.id);
  if (!payroll) {
    return res.status(404).json({ message: "Payroll record not found" });
  }

  payroll.status = "Paid";
  payroll.paidAt = new Date().toISOString();
  payroll.paymentMethod = paymentMethod || "Bank Transfer";

  res.json(payroll);
});

// Update payroll
router.patch("/:id", requirePermission("hr:update"), async (req, res) => {
  if (isMongoConfigured()) {
    const updated = await PayrollModel.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Payroll record not found" });
    }

    return res.json(updated);
  }

  const index = db.payroll.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Payroll record not found" });
  }

  db.payroll[index] = { ...db.payroll[index], ...req.body };
  res.json(db.payroll[index]);
});

// Delete payroll
router.delete("/:id", requirePermission("hr:delete"), async (req, res) => {
  if (isMongoConfigured()) {
    const deleted = await PayrollModel.findOneAndDelete({ id: req.params.id }).lean();
    if (!deleted) {
      return res.status(404).json({ message: "Payroll record not found" });
    }
    return res.json({ message: "Payroll deleted", payroll: deleted });
  }

  const index = db.payroll.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Payroll record not found" });
  }

  const [deleted] = db.payroll.splice(index, 1);
  res.json({ message: "Payroll deleted", payroll: deleted });
});

export default router;
