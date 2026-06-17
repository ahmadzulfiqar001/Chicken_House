import dotenv from "dotenv";
import mongoose from "mongoose";
import { createDb } from "./db";
import { syncLegacyMongoData } from "./legacy-mongo-sync";
import {
  AssistantConversationModel,
  AuthSessionModel,
  BranchModel,
  BookingRequestModel,
  ContactMessageModel,
  CustomerModel,
  FinanceModel,
  InventoryModel,
  MenuModel,
  OrderModel,
  SiteSettingModel,
  StaffModel,
  VendorPurchaseModel,
  UserAccountModel,
  StaffNoticeModel,
  StaffRequestModel,
  ActivityLogModel,
  RiderModel,
  JobOpeningModel,
} from "./models";

const jobOpeningSeed = [
  { id: "JOB-chef", title: "Chef / Cook", department: "Kitchen", type: "Full-time", location: "Renala Khurd", description: "Prepare BBQ, karahi, and fast-food items to Chicken House standards.", requirements: ["2+ years kitchen experience", "Knowledge of desi & fast food", "Hygiene & food safety"], salaryRange: "Rs. 40,000 - 70,000", status: "Open", createdAt: new Date().toISOString() },
  { id: "JOB-rider", title: "Delivery Rider", department: "Delivery", type: "Full-time", location: "Renala Khurd / Okara", description: "Deliver orders quickly and safely across the service area.", requirements: ["Own bike + valid license", "Knows local routes", "Smartphone"], salaryRange: "Rs. 30,000 + fuel", status: "Open", createdAt: new Date().toISOString() },
  { id: "JOB-cashier", title: "Cashier / Counter Staff", department: "Front of House", type: "Full-time", location: "Renala Khurd", description: "Handle billing, takeaway orders, and customer service at the counter.", requirements: ["Basic POS skills", "Good communication", "Honest & punctual"], salaryRange: "Rs. 28,000 - 40,000", status: "Open", createdAt: new Date().toISOString() },
  { id: "JOB-server", title: "Waiter / Server", department: "Front of House", type: "Part-time", location: "Renala Khurd", description: "Serve dine-in guests and keep the seating area clean and welcoming.", requirements: ["Friendly attitude", "Team player", "Flexible hours"], salaryRange: "Rs. 25,000 - 35,000", status: "Open", createdAt: new Date().toISOString() },
];

const riderSeed = [
  { id: "RD-001", name: "Bilal Ahmed", phone: "+92 333 4880841", status: "Available", shift: "Evening", vehicleType: "Bike", plateNumber: "OKR-1234", zone: "Renala Khurd", rating: 4.8, activeOrders: 0 },
  { id: "RD-002", name: "Usman Ghani", phone: "+92 333 4880842", status: "On Delivery", shift: "Day", vehicleType: "Bike", plateNumber: "OKR-5678", zone: "Okara City", rating: 4.6, activeOrders: 1 },
  { id: "RD-003", name: "Ali Raza", phone: "+92 333 4880843", status: "Offline", shift: "Night", vehicleType: "Bike", plateNumber: "OKR-9012", zone: "GT Road", rating: 4.9, activeOrders: 0 },
];

dotenv.config();

// Seed one collection only when empty. Each step is isolated: a failure here
// (bad doc, schema drift) is logged and skipped so it never blocks other
// collections from seeding — this is what previously left userAccounts empty.
const seedMany = async (
  label: string,
  model: { estimatedDocumentCount: () => Promise<number>; insertMany: (docs: unknown[], opts?: unknown) => Promise<unknown> },
  docs: unknown[],
) => {
  try {
    if (!docs || docs.length === 0) return;
    if ((await model.estimatedDocumentCount()) === 0) {
      await model.insertMany(docs, { ordered: false });
      console.log(`Seeded ${label} (${docs.length}).`);
    }
  } catch (error) {
    console.error(`Seed ${label} skipped:`, (error as Error).message);
  }
};

const seedDatabase = async () => {
  const seed = createDb();

  await seedMany("inventory", InventoryModel as never, seed.inventory);
  await seedMany("menu", MenuModel as never, seed.menu);
  await seedMany("vendorPurchases", VendorPurchaseModel as never, seed.vendorPurchases);
  await seedMany("staff", StaffModel as never, seed.staff);
  await seedMany("finance", FinanceModel as never, seed.finance);
  await seedMany("orders", OrderModel as never, seed.orders);
  await seedMany("customers", CustomerModel as never, seed.customers);
  await seedMany("userAccounts", UserAccountModel as never, seed.userAccounts);
  await seedMany("authSessions", AuthSessionModel as never, seed.authSessions);
  await seedMany("bookings", BookingRequestModel as never, seed.bookings);
  await seedMany("contactMessages", ContactMessageModel as never, seed.contactMessages);
  await seedMany("assistantConversations", AssistantConversationModel as never, seed.assistantConversations);
  await seedMany("staffNotices", StaffNoticeModel as never, seed.staffNotices);
  await seedMany("staffRequests", StaffRequestModel as never, seed.staffRequests);
  await seedMany("activityLogs", ActivityLogModel as never, seed.activityLogs);
  await seedMany("riders", RiderModel as never, riderSeed);
  await seedMany("jobOpenings", JobOpeningModel as never, jobOpeningSeed);

  try {
  if ((await SiteSettingModel.estimatedDocumentCount()) === 0) {
    await SiteSettingModel.create({
      key: "default",
      brandName: "Chicken House",
      tagline: "A Symbol of Quality & Freshness",
      logoUrl: "",
      faviconUrl: "",
      primaryColor: "#7f1215",
      accentColor: "#d8a82f",
      contactEmail: "hello@chickenhouse.demo",
      contactPhone: "+92 300 1234567",
      whatsappNumber: "+92 300 1234567",
      addressLine1: "GT Road near Mitchell's Fruit Farm, Renala Khurd",
      city: "Renala Khurd",
      mapEmbedUrl: "",
      businessHours: [
        { day: "Monday", open: "11:00", close: "00:00", isClosed: false },
        { day: "Tuesday", open: "11:00", close: "00:00", isClosed: false },
        { day: "Wednesday", open: "11:00", close: "00:00", isClosed: false },
        { day: "Thursday", open: "11:00", close: "00:00", isClosed: false },
        { day: "Friday", open: "11:00", close: "00:00", isClosed: false },
        { day: "Saturday", open: "11:00", close: "00:00", isClosed: false },
        { day: "Sunday", open: "11:00", close: "00:00", isClosed: false },
      ],
      socialLinks: [
        { platform: "facebook", label: "Facebook", url: "", handle: "" },
        { platform: "instagram", label: "Instagram", url: "", handle: "" },
      ],
      seoTitle: "Chicken House | A Symbol of Quality & Freshness",
      seoDescription: "Chicken House restaurant site settings for the digital ecosystem.",
      maintenanceMode: false,
      settings: {
        source: "seed",
        currency: "PKR",
      },
    });
    console.log("Seeded siteSettings.");
  }
  } catch (error) {
    console.error("Seed siteSettings skipped:", (error as Error).message);
  }

  try {
  if ((await BranchModel.estimatedDocumentCount()) === 0) {
    await BranchModel.create({
      id: "renala-khurd-main",
      name: "Chicken House Main Branch",
      slug: "renala-khurd-main",
      status: "Active",
      manager: "",
      email: "hello@chickenhouse.demo",
      phone: "+92 300 1234567",
      addressLine1: "GT Road near Mitchell's Fruit Farm, Renala Khurd",
      addressLine2: "",
      city: "Renala Khurd",
      landmark: "Mitchell's Fruit Farm",
      coordinates: { lat: 0, lng: 0 },
      timings: [
        { day: "Monday", open: "11:00", close: "00:00", isClosed: false },
        { day: "Tuesday", open: "11:00", close: "00:00", isClosed: false },
        { day: "Wednesday", open: "11:00", close: "00:00", isClosed: false },
        { day: "Thursday", open: "11:00", close: "00:00", isClosed: false },
        { day: "Friday", open: "11:00", close: "00:00", isClosed: false },
        { day: "Saturday", open: "11:00", close: "00:00", isClosed: false },
        { day: "Sunday", open: "11:00", close: "00:00", isClosed: false },
      ],
      amenities: ["Family Seating", "Takeaway", "Delivery"],
      parkingAvailable: true,
      staffCount: 0,
      rating: 0,
      averageDailyOrders: 0,
      averageDailyRevenue: 0,
      gallery: [],
    });
    console.log("Seeded branches.");
  }
  } catch (error) {
    console.error("Seed branches skipped:", (error as Error).message);
  }
};

export const isMongoConfigured = () => Boolean(process.env.MONGODB_URI?.trim());

export const isMongoConnected = () => mongoose.connection.readyState === 1;

export const getMongoHealth = () => ({
  configured: isMongoConfigured(),
  connected: isMongoConnected(),
  database: mongoose.connection.name || null,
  host: mongoose.connection.host || null,
});

export const connectToMongo = async () => {
  if (!isMongoConfigured()) {
    console.warn("MONGODB_URI is not configured. Falling back to in-memory storage.");
    return false;
  }

  if (isMongoConnected()) {
    return true;
  }

  // Observability: surface connection drops/recoveries (writes buffer in between).
  mongoose.connection.on("disconnected", () =>
    console.warn("MongoDB disconnected — operations will buffer until it reconnects."),
  );
  mongoose.connection.on("reconnected", () => console.log("MongoDB reconnected."));
  mongoose.connection.on("error", (error) =>
    console.error("MongoDB connection error:", (error as Error).message),
  );

  try {
    await mongoose.connect(process.env.MONGODB_URI as string, {
      serverSelectionTimeoutMS: 10000,
    });
    // Run legacy sync + seeding at most once per process/instance. They are
    // idempotent (only fill empty collections), but on serverless they would
    // otherwise re-run their count checks on every cold start.
    const seedFlag = globalThis as typeof globalThis & { __chSeeded__?: boolean };
    if (!seedFlag.__chSeeded__) {
      seedFlag.__chSeeded__ = true;
      await syncLegacyMongoData();
      await seedDatabase();
    }
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
    return true;
  } catch (error) {
    console.error("MongoDB connection failed. Falling back to in-memory storage.", error);
    return false;
  }
};
