import express from "express";
import { requireRole, getRequestAuthUser } from "../auth/auth.service";
import { loadAll, findOne, insertDoc, updateDoc, removeDoc } from "../../core/store";
import { deliverNotification } from "../notifications/notify.service";

const router = express.Router();

const adminOrManager = requireRole(["admin", "manager"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const APPLICATION_STATUSES = ["Pending", "Reviewing", "Approved", "Rejected"];

const byNewest = (a: Record<string, any>, b: Record<string, any>, key: string) =>
  Date.parse(String(b[key] ?? 0)) - Date.parse(String(a[key] ?? 0));

const inferStaffRole = (jobTitle: string) => {
  const normalizedTitle = jobTitle.toLowerCase();
  if (normalizedTitle.includes("manager") || normalizedTitle.includes("supervisor")) {
    return "Manager / Branch Supervisor";
  }
  if (normalizedTitle.includes("human resources") || normalizedTitle.includes("hr")) {
    return "HR / Human Resources";
  }
  if (normalizedTitle.includes("cashier") || normalizedTitle.includes("counter")) {
    return "Cashier / Counter Staff";
  }
  if (normalizedTitle.includes("chef") || normalizedTitle.includes("cook") || normalizedTitle.includes("kitchen")) {
    return "Kitchen Staff / Chef";
  }
  if (normalizedTitle.includes("rider") || normalizedTitle.includes("delivery")) {
    return "Rider / Delivery Staff";
  }
  if (normalizedTitle.includes("inventory") || normalizedTitle.includes("store")) {
    return "Inventory Staff";
  }
  return "General Staff";
};

const inferDepartment = (jobTitle: string) => {
  const normalizedTitle = jobTitle.toLowerCase();
  if (normalizedTitle.includes("manager") || normalizedTitle.includes("supervisor")) return "Management";
  if (normalizedTitle.includes("human resources") || normalizedTitle.includes("hr")) return "Human Resources";
  if (normalizedTitle.includes("cashier") || normalizedTitle.includes("counter") || normalizedTitle.includes("server")) {
    return "Front of House";
  }
  if (normalizedTitle.includes("chef") || normalizedTitle.includes("cook") || normalizedTitle.includes("kitchen")) return "Kitchen";
  if (normalizedTitle.includes("rider") || normalizedTitle.includes("delivery")) return "Delivery";
  if (normalizedTitle.includes("inventory") || normalizedTitle.includes("store")) return "Inventory";
  return "Operations";
};

const nextStaffId = async () => {
  const staff = await loadAll("staff");
  return staff.reduce((max, member) => Math.max(max, Number(member.id) || 0), 0) + 1;
};

const ensureApprovedApplicationStaff = async (application: Record<string, any>, hiredAt: string) => {
  const existingByApplication = await findOne("staff", { careerApplicationId: application.id });
  if (existingByApplication) return existingByApplication;

  const email = String(application.email ?? "").trim().toLowerCase();
  const existingByEmail = email
    ? (await loadAll("staff")).find((member) => String(member.email ?? "").trim().toLowerCase() === email) ?? null
    : null;

  if (existingByEmail) {
    await updateDoc("staff", { id: existingByEmail.id }, {
      careerApplicationId: application.id,
      experience: String(application.experience ?? ""),
      resumeUrl: String(application.resumeUrl ?? ""),
      coverLetter: String(application.coverLetter ?? ""),
    });
    return {
      ...existingByEmail,
      careerApplicationId: application.id,
      experience: String(application.experience ?? ""),
      resumeUrl: String(application.resumeUrl ?? ""),
      coverLetter: String(application.coverLetter ?? ""),
    };
  }

  const opening = application.jobId ? await findOne("jobOpenings", { id: application.jobId }) : null;
  const jobTitle = String(application.jobTitle ?? opening?.title ?? "General Application");
  const department = String(opening?.department ?? "").trim() || inferDepartment(jobTitle);
  const staffRecord = {
    id: await nextStaffId(),
    name: String(application.name ?? "").trim(),
    role: inferStaffRole(jobTitle),
    status: "Active",
    shift: "Morning",
    salary: 0,
    joinDate: hiredAt.slice(0, 10),
    email,
    phone: String(application.phone ?? ""),
    address: "",
    emergencyContact: "",
    userAccountId: "",
    department,
    leaveBalance: 20,
    performanceScore: 0,
    careerApplicationId: String(application.id ?? ""),
    experience: String(application.experience ?? ""),
    resumeUrl: String(application.resumeUrl ?? ""),
    coverLetter: String(application.coverLetter ?? ""),
  };

  await insertDoc("staff", staffRecord);
  return staffRecord;
};

/* -------------------------------------------------------------------------- */
/* Job openings                                                               */
/* -------------------------------------------------------------------------- */

// Public: list open positions. Admin passes ?all=1 to include closed ones.
router.get("/openings", async (req, res) => {
  const includeAll = String(req.query.all ?? "") === "1";
  let openings = (await loadAll("jobOpenings")).slice().sort((a, b) => byNewest(a, b, "createdAt"));
  if (!includeAll) openings = openings.filter((opening) => opening.status === "Open");
  return res.json(openings);
});

router.post("/openings", requireRole(["admin"]), async (req, res) => {
  const title = String(req.body?.title ?? "").trim();
  if (title.length < 2) return res.status(400).json({ message: "Please enter a job title." });

  const record = {
    id: `JOB-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    department: String(req.body?.department ?? "General").trim() || "General",
    type: ["Full-time", "Part-time", "Contract", "Internship"].includes(String(req.body?.type))
      ? String(req.body.type)
      : "Full-time",
    location: String(req.body?.location ?? "Renala Khurd").trim() || "Renala Khurd",
    description: String(req.body?.description ?? "").trim(),
    requirements: Array.isArray(req.body?.requirements)
      ? req.body.requirements.map((item: unknown) => String(item)).filter(Boolean)
      : String(req.body?.requirements ?? "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
    salaryRange: String(req.body?.salaryRange ?? "").trim(),
    status: String(req.body?.status ?? "Open") === "Closed" ? "Closed" : "Open",
    createdAt: new Date().toISOString(),
  };

  await insertDoc("jobOpenings", record);
  return res.status(201).json(record);
});

router.patch("/openings/:id", requireRole(["admin"]), async (req, res) => {
  const existing = await findOne("jobOpenings", { id: req.params.id });
  if (!existing) return res.status(404).json({ message: "Job opening not found." });

  const patch: Record<string, unknown> = {};
  const fields = ["title", "department", "type", "location", "description", "requirements", "salaryRange", "status"];
  for (const field of fields) {
    if (req.body?.[field] !== undefined) patch[field] = req.body[field];
  }

  await updateDoc("jobOpenings", { id: req.params.id }, patch);
  return res.json({ ...existing, ...patch });
});

router.delete("/openings/:id", requireRole(["admin"]), async (req, res) => {
  const removed = await removeDoc("jobOpenings", { id: req.params.id });
  if (!removed) return res.status(404).json({ message: "Job opening not found." });
  return res.json({ message: "Job opening removed." });
});

/* -------------------------------------------------------------------------- */
/* Applications                                                               */
/* -------------------------------------------------------------------------- */

// Public: submit a job application.
router.post("/applications", async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const phone = String(req.body?.phone ?? "").trim();

  if (name.length < 2) return res.status(400).json({ message: "Please enter your full name." });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ message: "Please enter a valid email address." });
  if (phone && !/^\+?[0-9\s-]{10,16}$/.test(phone)) {
    return res.status(400).json({ message: "Please enter a valid phone number." });
  }

  // Resolve the position title from the opening (if one was selected).
  const jobId = String(req.body?.jobId ?? "").trim();
  let jobTitle = String(req.body?.jobTitle ?? "").trim() || "General Application";
  if (jobId) {
    const opening = await findOne("jobOpenings", { id: jobId });
    if (opening) jobTitle = String(opening.title);
  }

  const record = {
    id: `APP-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    jobId,
    jobTitle,
    name,
    email,
    phone,
    experience: String(req.body?.experience ?? "").trim(),
    coverLetter: String(req.body?.coverLetter ?? req.body?.message ?? "").trim(),
    resumeUrl: String(req.body?.resumeUrl ?? "").trim(),
    status: "Pending",
    reviewedBy: "",
    reviewedAt: "",
    decisionNote: "",
    appliedAt: new Date().toISOString(),
  };

  await insertDoc("jobApplications", record);
  return res.status(201).json({ message: "Application submitted! We'll be in touch by email.", application: record });
});

// Admin/manager: list applications.
router.get("/applications", adminOrManager, async (_req, res) => {
  const applications = (await loadAll("jobApplications")).slice().sort((a, b) => byNewest(a, b, "appliedAt"));
  const metrics = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "Pending" || a.status === "Reviewing").length,
    approved: applications.filter((a) => a.status === "Approved").length,
    rejected: applications.filter((a) => a.status === "Rejected").length,
  };
  return res.json({ applications, metrics });
});

// Admin/manager: review an application. Approval/rejection emails the applicant.
router.patch("/applications/:id", adminOrManager, async (req, res) => {
  const application = await findOne("jobApplications", { id: req.params.id });
  if (!application) return res.status(404).json({ message: "Application not found." });

  const status = String(req.body?.status ?? "").trim();
  if (status && !APPLICATION_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Invalid application status." });
  }

  const actor = getRequestAuthUser(req);
  const note = String(req.body?.decisionNote ?? "").trim();
  const now = new Date().toISOString();

  const patch: Record<string, unknown> = {};
  if (status) patch.status = status;
  if (req.body?.decisionNote !== undefined) patch.decisionNote = note;
  if (status === "Approved" || status === "Rejected") {
    patch.reviewedBy = actor?.email ?? "";
    patch.reviewedAt = now;
  }

  let hiredStaff: Record<string, unknown> | null = null;
  if (status === "Approved") {
    hiredStaff = await ensureApprovedApplicationStaff(application, now);
    patch.hiredStaffId = Number(hiredStaff.id ?? 0);
    patch.hiredAt = String(application.hiredAt ?? "") || now;
  }

  await updateDoc("jobApplications", { id: req.params.id }, patch);

  // Email the applicant on a final decision.
  let emailResult: unknown = null;
  if (status === "Approved" || status === "Rejected") {
    const subject =
      status === "Approved"
        ? `Good news about your application — ${application.jobTitle}`
        : `Update on your application — ${application.jobTitle}`;

    const message =
      status === "Approved"
        ? `Hi ${application.name},\n\nCongratulations! Your application for "${application.jobTitle}" at Chicken House has been approved.${application.phone ? ` Our team will contact you at ${application.phone} shortly to arrange the next steps.` : " Our team will be in touch shortly to arrange the next steps."}${note ? `\n\nNote from our team: ${note}` : ""}\n\nWelcome aboard,\nChicken House Team`
        : `Hi ${application.name},\n\nThank you for applying for "${application.jobTitle}" at Chicken House and for the time you invested in your application. After careful review, we will not be moving forward at this stage.${note ? `\n\nNote: ${note}` : ""}\n\nWe truly appreciate your interest and wish you the very best.\n\nWarm regards,\nChicken House Team`;

    emailResult = await deliverNotification({
      channel: "email",
      title: subject,
      message,
      recipients: [{ email: application.email, name: application.name }],
    });
  }

  return res.json({ ...application, ...patch, hiredStaff, emailResult });
});

router.delete("/applications/:id", requireRole(["admin"]), async (req, res) => {
  const removed = await removeDoc("jobApplications", { id: req.params.id });
  if (!removed) return res.status(404).json({ message: "Application not found." });
  return res.json({ message: "Application removed." });
});

export default router;
