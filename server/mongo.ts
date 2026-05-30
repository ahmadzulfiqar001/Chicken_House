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
} from "./models";

dotenv.config();

const seedDatabase = async () => {
  const seed = createDb();

  if ((await InventoryModel.estimatedDocumentCount()) === 0) {
    await InventoryModel.insertMany(seed.inventory);
  }

  if ((await MenuModel.estimatedDocumentCount()) === 0) {
    await MenuModel.insertMany(seed.menu);
  }

  if ((await VendorPurchaseModel.estimatedDocumentCount()) === 0 && seed.vendorPurchases.length > 0) {
    await VendorPurchaseModel.insertMany(seed.vendorPurchases);
  }

  if ((await StaffModel.estimatedDocumentCount()) === 0) {
    await StaffModel.insertMany(seed.staff);
  }

  if ((await FinanceModel.estimatedDocumentCount()) === 0) {
    await FinanceModel.insertMany(seed.finance);
  }

  if ((await OrderModel.estimatedDocumentCount()) === 0) {
    await OrderModel.insertMany(seed.orders);
  }

  if ((await CustomerModel.estimatedDocumentCount()) === 0) {
    await CustomerModel.insertMany(seed.customers);
  }

  if ((await UserAccountModel.estimatedDocumentCount()) === 0) {
    await UserAccountModel.insertMany(seed.userAccounts);
  }

  if ((await AuthSessionModel.estimatedDocumentCount()) === 0 && seed.authSessions.length > 0) {
    await AuthSessionModel.insertMany(seed.authSessions);
  }

  if ((await BookingRequestModel.estimatedDocumentCount()) === 0 && seed.bookings.length > 0) {
    await BookingRequestModel.insertMany(seed.bookings);
  }

  if ((await ContactMessageModel.estimatedDocumentCount()) === 0 && seed.contactMessages.length > 0) {
    await ContactMessageModel.insertMany(seed.contactMessages);
  }

  if ((await AssistantConversationModel.estimatedDocumentCount()) === 0) {
    await AssistantConversationModel.insertMany(seed.assistantConversations);
  }

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
        { day: "Monday", open: "11:00", close: "23:00", isClosed: false },
        { day: "Tuesday", open: "11:00", close: "23:00", isClosed: false },
        { day: "Wednesday", open: "11:00", close: "23:00", isClosed: false },
        { day: "Thursday", open: "11:00", close: "23:00", isClosed: false },
        { day: "Friday", open: "11:00", close: "23:59", isClosed: false },
        { day: "Saturday", open: "11:00", close: "23:59", isClosed: false },
        { day: "Sunday", open: "11:00", close: "23:00", isClosed: false },
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
  }

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
        { day: "Monday", open: "11:00", close: "23:00", isClosed: false },
        { day: "Tuesday", open: "11:00", close: "23:00", isClosed: false },
        { day: "Wednesday", open: "11:00", close: "23:00", isClosed: false },
        { day: "Thursday", open: "11:00", close: "23:00", isClosed: false },
        { day: "Friday", open: "11:00", close: "23:59", isClosed: false },
        { day: "Saturday", open: "11:00", close: "23:59", isClosed: false },
        { day: "Sunday", open: "11:00", close: "23:00", isClosed: false },
      ],
      amenities: ["Family Seating", "Takeaway", "Delivery"],
      parkingAvailable: true,
      staffCount: 0,
      rating: 0,
      averageDailyOrders: 0,
      averageDailyRevenue: 0,
      gallery: [],
    });
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

  try {
    await mongoose.connect(process.env.MONGODB_URI as string, {
      serverSelectionTimeoutMS: 10000,
    });
    await syncLegacyMongoData();
    await seedDatabase();
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
    return true;
  } catch (error) {
    console.error("MongoDB connection failed. Falling back to in-memory storage.", error);
    return false;
  }
};
