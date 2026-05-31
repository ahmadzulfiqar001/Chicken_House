import express from "express";
import { requirePermission } from "../auth/auth.service";
import { findOne, insertDoc, updateDoc } from "../../core/store";

const router = express.Router();

const DEFAULT_KEY = "default";

const buildDefaultSetting = () => ({
  key: DEFAULT_KEY,
  brandName: "Chicken House",
  tagline: "A Symbol of Quality & Freshness",
  logoUrl: "",
  faviconUrl: "",
  primaryColor: "#7f1215",
  accentColor: "#d8a82f",
  contactEmail: "info@chickenhouse.pk",
  contactPhone: "+92 345 7493339",
  whatsappNumber: "923457493339",
  addressLine1: "Near Mitchell's, GT Road",
  city: "Renala Khurd, Okara",
  mapEmbedUrl: "",
  businessHours: [],
  socialLinks: [],
  seoTitle: "",
  seoDescription: "",
  maintenanceMode: false,
  settings: {
    currency: "PKR",
    timezone: "Asia/Karachi",
    twoFactorAuth: false,
    autoBackup: true,
    orderNotifications: true,
  },
});

const ensureSetting = async () => {
  let setting = await findOne("siteSettings", { key: DEFAULT_KEY });
  if (!setting) {
    setting = buildDefaultSetting();
    await insertDoc("siteSettings", setting);
  }
  return setting;
};

// Admin: read site settings.
router.get("/", requirePermission("system:settings"), async (_req, res) => {
  const setting = await ensureSetting();
  return res.json(setting);
});

// Admin: update site settings (top-level fields + the free-form `settings` map).
router.put("/", requirePermission("system:settings"), async (req, res) => {
  const existing = await ensureSetting();

  const patch: Record<string, unknown> = {};
  const fields = [
    "brandName", "tagline", "logoUrl", "faviconUrl", "primaryColor", "accentColor",
    "contactEmail", "contactPhone", "whatsappNumber", "addressLine1", "city",
    "mapEmbedUrl", "seoTitle", "seoDescription", "maintenanceMode",
  ];
  for (const field of fields) {
    if (req.body?.[field] !== undefined) patch[field] = req.body[field];
  }

  if (req.body?.settings && typeof req.body.settings === "object") {
    patch.settings = { ...(existing.settings ?? {}), ...req.body.settings };
  }

  await updateDoc("siteSettings", { key: DEFAULT_KEY }, patch);
  return res.json({ ...existing, ...patch });
});

export default router;
