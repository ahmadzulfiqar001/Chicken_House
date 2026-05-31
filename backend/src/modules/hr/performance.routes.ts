import express from "express";
import { requirePermission } from "../auth/auth.service";
import { db } from "../../core/db";
import { PerformanceReviewModel, StaffModel } from "../../core/models";
import { isMongoConfigured } from "../../core/mongo";

const router = express.Router();

// Get all performance reviews
router.get("/", requirePermission("hr:view"), async (req, res) => {
  const { staffId } = req.query;
  
  if (isMongoConfigured()) {
    const filter: any = {};
    if (staffId) filter.staffId = Number(staffId);
    
    const reviews = await PerformanceReviewModel.find(filter).sort({ reviewDate: -1 }).lean();
    return res.json(reviews);
  }

  let reviews = db.performanceReviews;
  if (staffId) reviews = reviews.filter(r => r.staffId === Number(staffId));
  
  res.json(reviews);
});

// Create performance review
router.post("/", requirePermission("hr:create"), async (req, res) => {
  const { punctuality, quality, teamwork, communication } = req.body;
  
  // Calculate overall score
  const overallScore = ((punctuality + quality + teamwork + communication) / 4).toFixed(1);

  if (isMongoConfigured()) {
    const newReview = {
      ...req.body,
      id: `PR-${Date.now()}`,
      overallScore: parseFloat(overallScore),
    };

    const created = await PerformanceReviewModel.create(newReview);

    // Update staff performance score
    await StaffModel.findOneAndUpdate(
      { id: newReview.staffId },
      { performanceScore: parseFloat(overallScore) }
    );

    return res.status(201).json(created.toObject());
  }

  const newReview = {
    ...req.body,
    id: `PR-${Date.now()}`,
    overallScore: parseFloat(overallScore),
  };

  db.performanceReviews.push(newReview);

  // Update staff performance score
  const staff = db.staff.find(s => s.id === newReview.staffId);
  if (staff) {
    staff.performanceScore = parseFloat(overallScore);
  }

  res.status(201).json(newReview);
});

// Update performance review
router.patch("/:id", requirePermission("hr:update"), async (req, res) => {
  if (isMongoConfigured()) {
    // Recalculate overall score if metrics are updated
    if (req.body.punctuality || req.body.quality || req.body.teamwork || req.body.communication) {
      const review = await PerformanceReviewModel.findOne({ id: req.params.id });
      if (review) {
        const p = req.body.punctuality || review.punctuality;
        const q = req.body.quality || review.quality;
        const t = req.body.teamwork || review.teamwork;
        const c = req.body.communication || review.communication;
        req.body.overallScore = parseFloat(((p + q + t + c) / 4).toFixed(1));
      }
    }

    const updated = await PerformanceReviewModel.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Performance review not found" });
    }

    // Update staff performance score
    if (req.body.overallScore) {
      await StaffModel.findOneAndUpdate(
        { id: updated.staffId },
        { performanceScore: req.body.overallScore }
      );
    }

    return res.json(updated);
  }

  const index = db.performanceReviews.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Performance review not found" });
  }

  // Recalculate overall score if metrics are updated
  if (req.body.punctuality || req.body.quality || req.body.teamwork || req.body.communication) {
    const review = db.performanceReviews[index];
    const p = req.body.punctuality || review.punctuality;
    const q = req.body.quality || review.quality;
    const t = req.body.teamwork || review.teamwork;
    const c = req.body.communication || review.communication;
    req.body.overallScore = parseFloat(((p + q + t + c) / 4).toFixed(1));
  }

  db.performanceReviews[index] = { ...db.performanceReviews[index], ...req.body };

  // Update staff performance score
  if (req.body.overallScore) {
    const staff = db.staff.find(s => s.id === db.performanceReviews[index].staffId);
    if (staff) {
      staff.performanceScore = req.body.overallScore;
    }
  }

  res.json(db.performanceReviews[index]);
});

// Delete performance review
router.delete("/:id", requirePermission("hr:delete"), async (req, res) => {
  if (isMongoConfigured()) {
    const deleted = await PerformanceReviewModel.findOneAndDelete({ id: req.params.id }).lean();
    if (!deleted) {
      return res.status(404).json({ message: "Performance review not found" });
    }
    return res.json({ message: "Performance review deleted", review: deleted });
  }

  const index = db.performanceReviews.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Performance review not found" });
  }

  const [deleted] = db.performanceReviews.splice(index, 1);
  res.json({ message: "Performance review deleted", review: deleted });
});

export default router;
