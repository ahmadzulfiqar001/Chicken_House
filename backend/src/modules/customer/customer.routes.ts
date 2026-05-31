import express from "express";
import { getRequestAuthUser, requireAuth } from "../auth/auth.service";
import { db } from "../../core/db";
import { CustomerModel, OrderModel } from "../../core/models";
import { isMongoConfigured } from "../../core/mongo";

const router = express.Router();

const buildCustomerSeed = (email: string, name?: string, phone?: string) => ({
  id: `customer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name: name ?? "Chicken House Guest",
  email,
  phone: phone ?? "",
  address: "",
  city: "Renala Khurd",
  memberSince: new Date().getFullYear().toString(),
  loyaltyPoints: 0,
  walletBalance: 0,
  favoriteCategory: "House Specials",
  orderCount: 0,
  avatarInitials: (name ?? "Guest")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase(),
  preferences: {
    notifications: true,
    promotions: true,
    orderUpdates: true,
    darkAlerts: false,
  },
  addresses: [],
  wishlist: [],
  walletTransactions: [],
  activity: ["Customer account created."],
});

const ensureCustomer = (email: string, name?: string, phone?: string) => {
  let customer = db.customers.find((item) => item.email.toLowerCase() === email.toLowerCase());

  if (!customer) {
    customer = buildCustomerSeed(email, name, phone);
    db.customers.push(customer);
  }

  return customer;
};

const ensureCustomerDocument = async (email: string, name?: string, phone?: string) => {
  let customer = await CustomerModel.findOne({ email: email.toLowerCase() });

  if (!customer) {
    customer = await CustomerModel.create(buildCustomerSeed(email, name, phone));
  }

  return customer;
};

router.use(requireAuth);

router.get("/", async (req, res) => {
  const authUser = getRequestAuthUser(req);

  if (!authUser) {
    return res.status(401).json({ message: "Please sign in to continue." });
  }

  if (isMongoConfigured()) {
    const customer = await ensureCustomerDocument(authUser.email, authUser.name, authUser.phone);
    const orders = await OrderModel.find({
      customerEmail: authUser.email.toLowerCase(),
    })
      .sort({ time: -1 })
      .lean();

    return res.json({
      profile: customer.toObject(),
      orders,
    });
  }

  const customer = ensureCustomer(authUser.email, authUser.name, authUser.phone);
  const orders = db.orders
    .filter((order) => order.customerEmail?.toLowerCase() === authUser.email.toLowerCase())
    .sort((a, b) => Date.parse(b.time) - Date.parse(a.time));

  return res.json({
    profile: customer,
    orders,
  });
});

router.patch("/profile", async (req, res) => {
  const authUser = getRequestAuthUser(req);

  if (!authUser) {
    return res.status(401).json({ message: "Please sign in to continue." });
  }

  if (isMongoConfigured()) {
    const customer = await ensureCustomerDocument(authUser.email, authUser.name, authUser.phone);

    customer.name = String(req.body?.name ?? customer.name).trim() || customer.name;
    customer.phone = String(req.body?.phone ?? customer.phone).trim();
    customer.address = String(req.body?.address ?? customer.address).trim();
    customer.city = String(req.body?.city ?? customer.city).trim();
    customer.favoriteCategory =
      String(req.body?.favoriteCategory ?? customer.favoriteCategory).trim() ||
      customer.favoriteCategory;
    customer.avatarInitials = customer.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    customer.activity.unshift("Profile updated successfully.");
    await customer.save();

    return res.json(customer.toObject());
  }

  const customer = ensureCustomer(authUser.email, authUser.name, authUser.phone);
  customer.name = String(req.body?.name ?? customer.name).trim() || customer.name;
  customer.phone = String(req.body?.phone ?? customer.phone).trim();
  customer.address = String(req.body?.address ?? customer.address).trim();
  customer.city = String(req.body?.city ?? customer.city).trim();
  customer.favoriteCategory =
    String(req.body?.favoriteCategory ?? customer.favoriteCategory).trim() ||
    customer.favoriteCategory;
  customer.avatarInitials = customer.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  customer.activity.unshift("Profile updated successfully.");

  return res.json(customer);
});

router.patch("/preferences", async (req, res) => {
  const authUser = getRequestAuthUser(req);

  if (!authUser) {
    return res.status(401).json({ message: "Please sign in to continue." });
  }

  if (isMongoConfigured()) {
    const customer = await ensureCustomerDocument(authUser.email, authUser.name, authUser.phone);
    customer.preferences = {
      ...customer.preferences,
      ...req.body.preferences,
    };
    customer.activity.unshift("Preferences updated.");
    await customer.save();
    return res.json(customer.preferences);
  }

  const customer = ensureCustomer(authUser.email, authUser.name, authUser.phone);
  customer.preferences = {
    ...customer.preferences,
    ...req.body.preferences,
  };
  customer.activity.unshift("Preferences updated.");
  return res.json(customer.preferences);
});

router.post("/addresses", async (req, res) => {
  const authUser = getRequestAuthUser(req);

  if (!authUser) {
    return res.status(401).json({ message: "Please sign in to continue." });
  }

  const address = {
    id: `ADDR-${Date.now()}`,
    label: String(req.body?.label ?? "Address").trim() || "Address",
    line: String(req.body?.line ?? "").trim(),
    note: String(req.body?.note ?? "").trim(),
  };

  if (!address.line) {
    return res.status(400).json({ message: "Please enter the address line." });
  }

  if (isMongoConfigured()) {
    const customer = await ensureCustomerDocument(authUser.email, authUser.name, authUser.phone);
    customer.addresses.unshift(address);
    customer.address = address.line || customer.address;
    customer.activity.unshift(`New address "${address.label}" saved.`);
    await customer.save();
    return res.status(201).json(address);
  }

  const customer = ensureCustomer(authUser.email, authUser.name, authUser.phone);
  customer.addresses.unshift(address);
  customer.address = address.line || customer.address;
  customer.activity.unshift(`New address "${address.label}" saved.`);
  return res.status(201).json(address);
});

router.delete("/addresses/:id", async (req, res) => {
  const authUser = getRequestAuthUser(req);

  if (!authUser) {
    return res.status(401).json({ message: "Please sign in to continue." });
  }

  if (isMongoConfigured()) {
    const customer = await ensureCustomerDocument(authUser.email, authUser.name, authUser.phone);
    const index = customer.addresses.findIndex((item) => item.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: "Address not found." });
    }

    const [deleted] = customer.addresses.splice(index, 1);
    customer.activity.unshift(`Address "${deleted.label}" removed.`);
    await customer.save();
    return res.json({ message: "Address removed.", address: deleted });
  }

  const customer = ensureCustomer(authUser.email, authUser.name, authUser.phone);
  const index = customer.addresses.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Address not found." });
  }

  const [deleted] = customer.addresses.splice(index, 1);
  customer.activity.unshift(`Address "${deleted.label}" removed.`);
  return res.json({ message: "Address removed.", address: deleted });
});

router.post("/wishlist", async (req, res) => {
  const authUser = getRequestAuthUser(req);

  if (!authUser) {
    return res.status(401).json({ message: "Please sign in to continue." });
  }

  const item = {
    id: `WISH-${Date.now()}`,
    name: String(req.body?.name ?? "Chicken House Favorite").trim(),
    category: String(req.body?.category ?? "House Specials").trim(),
    price: Number(req.body?.price ?? 0),
    image: String(req.body?.image ?? "").trim(),
  };

  if (isMongoConfigured()) {
    const customer = await ensureCustomerDocument(authUser.email, authUser.name, authUser.phone);
    customer.wishlist.unshift(item);
    customer.activity.unshift(`${item.name} added to wishlist.`);
    await customer.save();
    return res.status(201).json(item);
  }

  const customer = ensureCustomer(authUser.email, authUser.name, authUser.phone);
  customer.wishlist.unshift(item);
  customer.activity.unshift(`${item.name} added to wishlist.`);
  return res.status(201).json(item);
});

router.delete("/wishlist/:id", async (req, res) => {
  const authUser = getRequestAuthUser(req);

  if (!authUser) {
    return res.status(401).json({ message: "Please sign in to continue." });
  }

  if (isMongoConfigured()) {
    const customer = await ensureCustomerDocument(authUser.email, authUser.name, authUser.phone);
    const index = customer.wishlist.findIndex((item) => item.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: "Wishlist item not found." });
    }

    const [deleted] = customer.wishlist.splice(index, 1);
    customer.activity.unshift(`${deleted.name} removed from wishlist.`);
    await customer.save();
    return res.json({ message: "Wishlist item removed.", item: deleted });
  }

  const customer = ensureCustomer(authUser.email, authUser.name, authUser.phone);
  const index = customer.wishlist.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Wishlist item not found." });
  }

  const [deleted] = customer.wishlist.splice(index, 1);
  customer.activity.unshift(`${deleted.name} removed from wishlist.`);
  return res.json({ message: "Wishlist item removed.", item: deleted });
});

router.post("/wallet/topup", async (req, res) => {
  const authUser = getRequestAuthUser(req);

  if (!authUser) {
    return res.status(401).json({ message: "Please sign in to continue." });
  }

  const amount = Number(req.body?.amount ?? 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: "Please enter a valid top-up amount." });
  }

  if (isMongoConfigured()) {
    const customer = await ensureCustomerDocument(authUser.email, authUser.name, authUser.phone);
    customer.walletBalance += amount;

    const transaction = {
      id: `W-${Date.now()}`,
      type: "Top-up",
      amount,
      reason: String(req.body?.reason ?? "Wallet top-up"),
      time: new Date().toISOString(),
    };

    customer.walletTransactions.unshift(transaction);
    customer.activity.unshift(`Wallet topped up with Rs. ${amount.toLocaleString()}.`);
    await customer.save();

    return res.status(201).json({
      balance: customer.walletBalance,
      transaction,
    });
  }

  const customer = ensureCustomer(authUser.email, authUser.name, authUser.phone);
  customer.walletBalance += amount;

  const transaction = {
    id: `W-${Date.now()}`,
    type: "Top-up",
    amount,
    reason: String(req.body?.reason ?? "Wallet top-up"),
    time: new Date().toISOString(),
  };

  customer.walletTransactions.unshift(transaction);
  customer.activity.unshift(`Wallet topped up with Rs. ${amount.toLocaleString()}.`);

  return res.status(201).json({
    balance: customer.walletBalance,
    transaction,
  });
});

export default router;
