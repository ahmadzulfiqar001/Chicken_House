import express from "express";
import { requirePermission } from "../auth/auth.service";
import { db } from "../../core/db";
import { LeaveRequestModel, StaffModel } from "../../core/models";
import { isMongoConnected } from "../../core/mongo";

const router = express.Router();

// Get all leave requests
router.get("/", requirePermission("hr:view"), async (req, res) => {
  const { staffId, status } = req.query;
  
  if (isMongoConnected()) {
    const filter: any = {};
    if (staffId) filter.staffId = Number(staffId);
    if (status) filter.status = status;
    
    const leaves = await LeaveRequestModel.find(filter).sort({ createdAt: -1 }).lean();
    return res.json(leaves);
  }

  let leaves = db.leaveRequests;
  if (staffId) leaves = leaves.filter(l => l.staffId === Number(staffId));
  if (status) leaves = leaves.filter(l => l.status === status);
  
  res.json(leaves);
});

// Create leave request
router.post("/", requirePermission("hr:create"), async (req, res) => {
  if (isMongoConnected()) {
    const newLeave = {
      ...req.body,
      id: `LV-${Date.now()}`,
      status: "Pending",
      rejectionReason: "",
    };

    const created = await LeaveRequestModel.create(newLeave);
    return res.status(201).json(created.toObject());
  }

  const newLeave = {
    ...req.body,
    id: `LV-${Date.now()}`,
    status: "Pending",
    rejectionReason: "",
  };

  db.leaveRequests.push(newLeave);
  res.status(201).json(newLeave);
});

// Approve/Reject leave
router.patch("/:id/status", requirePermission("hr:update"), async (req, res) => {
  const { status, approvedBy, rejectionReason } = req.body;

  if (isMongoConnected()) {
    const leave = await LeaveRequestModel.findOne({ id: req.params.id });
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    leave.status = status;
    leave.approvedBy = approvedBy || "";
    leave.approvedAt = status === "Approved" ? new Date().toISOString() : "";
    leave.rejectionReason = rejectionReason || "";

    // Update staff leave balance if approved
    if (status === "Approved") {
      await StaffModel.findOneAndUpdate(
        { id: leave.staffId },
        { $inc: { leaveBalance: -leave.days } }
      );
    }

    await leave.save();
    return res.json(leave.toObject());
  }

  const leave = db.leaveRequests.find(l => l.id === req.params.id);
  if (!leave) {
    return res.status(404).json({ message: "Leave request not found" });
  }

  leave.status = status;
  leave.approvedBy = approvedBy || "";
  leave.approvedAt = status === "Approved" ? new Date().toISOString() : "";
  leave.rejectionReason = rejectionReason || "";

  // Update staff leave balance if approved
  if (status === "Approved") {
    const staff = db.staff.find(s => s.id === leave.staffId);
    if (staff) {
      staff.leaveBalance = (staff.leaveBalance || 20) - leave.days;
    }
  }

  res.json(leave);
});

// Update leave request
router.patch("/:id", requirePermission("hr:update"), async (req, res) => {
  if (isMongoConnected()) {
    const updated = await LeaveRequestModel.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    return res.json(updated);
  }

  const index = db.leaveRequests.findIndex(l => l.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Leave request not found" });
  }

  db.leaveRequests[index] = { ...db.leaveRequests[index], ...req.body };
  res.json(db.leaveRequests[index]);
});

// Delete leave request
router.delete("/:id", requirePermission("hr:delete"), async (req, res) => {
  if (isMongoConnected()) {
    const deleted = await LeaveRequestModel.findOneAndDelete({ id: req.params.id }).lean();
    if (!deleted) {
      return res.status(404).json({ message: "Leave request not found" });
    }
    return res.json({ message: "Leave request deleted", leave: deleted });
  }

  const index = db.leaveRequests.findIndex(l => l.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Leave request not found" });
  }

  const [deleted] = db.leaveRequests.splice(index, 1);
  res.json({ message: "Leave request deleted", leave: deleted });
});

export default router;
