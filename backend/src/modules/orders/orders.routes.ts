import express from "express";
import crypto from "crypto";
import {
  getAuthenticatedUser,
  getRequestAuthUser,
  requirePermission,
  requireRole,
} from "../auth/auth.service";
import { db } from "../../core/db";
import { priceOrderDetails, reserveInventoryForOrder } from "../menu/menu.service";
import { CustomerModel, FinanceModel, OrderModel, ReviewModel } from "../../core/models";
import { isMongoConfigured } from "../../core/mongo";
import { calculateDeliveryFee, validateOrderPayload } from "./orders.pricing";
import { deliverNotification } from "../notifications/notify.service";

const router = express.Router();
const validStatuses = ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

// Every non-cash method (Easypaisa, JazzCash, bank transfer) is a manual transfer
// that admin/manager must verify before the order proceeds. Cash on Delivery does not.
const requiresPaymentVerification = (method: string) =>
  /easypaisa|jazz\s*cash|bank|transfer|wallet|online/i.test(method);

const findCustomerDocument = async (email: string) =>
  CustomerModel.findOne({ email: email.toLowerCase() });

// Record a Sales credit in finance (used at placement for instant-pay methods,
// and at verification time for bank transfers).
const recordSaleCredit = async (orderId: string, total: number) => {
  const tx = {
    id: `TX-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: "Credit",
    amount: total,
    source: `Order ${orderId}`,
    date: new Date().toISOString(),
    category: "Sales",
  };
  if (isMongoConfigured()) {
    await FinanceModel.create(tx);
  } else {
    db.finance.unshift(tx);
  }
};

// Email the customer when their order is approved (payment verified) or cancelled.
const emailOrderDecision = async (order: Record<string, unknown>, action: string, note: string) => {
  const email = String(order.customerEmail ?? "").trim();
  if (!email) return null;

  const id = String(order.id ?? "");
  const name = String(order.customer ?? "there");
  const total = Number(order.total ?? 0);

  const subject =
    action === "verify"
      ? `Your Chicken House order ${id} is confirmed ✅`
      : `Your Chicken House order ${id} was cancelled`;

  const message =
    action === "verify"
      ? `Hi ${name},\n\nGood news — your payment for order ${id} (Rs. ${total.toLocaleString()}) has been verified and your order is now confirmed. Our kitchen has started preparing it, and you can track it live on our website.${note ? `\n\nNote from our team: ${note}` : ""}\n\nThank you for ordering with Chicken House!`
      : `Hi ${name},\n\nWe're sorry — the payment for order ${id} (Rs. ${total.toLocaleString()}) could not be verified, so the order has been cancelled. If you have already paid or believe this is a mistake, please reply to this email or contact us and we'll make it right.${note ? `\n\nNote: ${note}` : ""}\n\nThank you,\nChicken House Team`;

  return deliverNotification({
    channel: "email",
    title: subject,
    message,
    recipients: [{ email, name }],
  });
};

const buildTimeline = (status: string) => {
  const states = ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered"];
  const currentIndex = Math.max(states.findIndex((item) => item === status), 0);
  const now = new Date();

  return states.map((item, index) => ({
    status: item,
    time:
      index <= currentIndex
        ? new Date(now.getTime() - (currentIndex - index) * 8 * 60 * 1000).toLocaleTimeString(
            "en-PK",
            { hour: "2-digit", minute: "2-digit" },
          )
        : "--",
    completed: index < currentIndex,
    active: index === currentIndex,
  }));
};

router.get("/", requirePermission("orders:view"), async (req, res) => {
  const authUser = await getAuthenticatedUser(req);
  const email = String(req.query.email ?? "").toLowerCase();
  const customerName = String(req.query.customer ?? "").toLowerCase();

  if (isMongoConfigured()) {
    const query: Record<string, unknown> = {};

    if (authUser?.role === "user") {
      query.customerEmail = authUser.email.toLowerCase();
    } else if (email && customerName) {
      query.$or = [
        { customerEmail: email },
        { customer: { $regex: customerName, $options: "i" } },
      ];
    } else if (email) {
      query.customerEmail = email;
    } else if (customerName) {
      query.customer = { $regex: customerName, $options: "i" };
    }

    const orders = await OrderModel.find(query).sort({ time: -1 }).lean();
    return res.json(orders);
  }

  let filtered = [...db.orders];

  if (authUser?.role === "user") {
    filtered = filtered.filter(
      (order) => String(order.customerEmail ?? "").toLowerCase() === authUser.email.toLowerCase(),
    );
  } else if (email || customerName) {
    filtered = filtered.filter((order) => {
      const matchesEmail = email
        ? String(order.customerEmail ?? "").toLowerCase() === email
        : false;
      const matchesCustomer = customerName
        ? String(order.customer ?? "").toLowerCase().includes(customerName)
        : false;

      return matchesEmail || matchesCustomer;
    });
  }

  return res.json(filtered);
});

router.get("/:id", async (req, res) => {
  const id = String(req.params.id ?? "").trim();

  if (!id) {
    return res.status(400).json({ message: "Order ID is required." });
  }

  if (isMongoConfigured()) {
    const order = await OrderModel.findOne({ id }).lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    return res.json({
      ...order,
      estimatedArrival:
        order.status === "Delivered"
          ? "Delivered"
          : order.type === "Takeaway"
            ? "Ready in 15-20 mins"
            : "25-35 mins",
      timeline: buildTimeline(String(order.status ?? "Pending")),
    });
  }

  const order = db.orders.find((item) => item.id === id);

  if (!order) {
    return res.status(404).json({ message: "Order not found." });
  }

  return res.json({
    ...order,
    estimatedArrival:
      order.status === "Delivered"
        ? "Delivered"
        : order.type === "Takeaway"
          ? "Ready in 15-20 mins"
          : "25-35 mins",
    timeline: buildTimeline(String(order.status ?? "Pending")),
  });
});

router.post("/", async (req, res) => {
  const authUser = await getAuthenticatedUser(req);
  const customer = String(req.body?.customer ?? authUser?.name ?? "").trim();
  const customerEmail = String(req.body?.customerEmail ?? authUser?.email ?? "")
    .trim()
    .toLowerCase();
  const customerPhone = String(req.body?.customerPhone ?? authUser?.phone ?? "").trim();
  const orderType = String(req.body?.type ?? "Delivery").trim() || "Delivery";
  const paymentMethod = String(req.body?.paymentMethod ?? "Cash on Delivery").trim();
  const paymentReference = String(req.body?.paymentReference ?? "").trim();
  const needsVerification = requiresPaymentVerification(paymentMethod);
  const deliveryAddress = String(req.body?.deliveryAddress ?? "").trim();
  const city = String(req.body?.city ?? "").trim();
  const notes = String(req.body?.notes ?? "").trim();
  const assignedStaffId = Math.max(0, Number(req.body?.assignedStaffId ?? 0));
  const assignedRole = String(req.body?.assignedRole ?? "").trim();
  const rawDetails = Array.isArray(req.body?.details) ? req.body.details : [];
  // Server-side re-pricing against the menu — never trust client-supplied prices.
  const pricing = await priceOrderDetails(rawDetails);
  if (!pricing.ok) {
    return res.status(400).json({ message: "One or more selected items are unavailable.", errors: pricing.errors });
  }
  const details = pricing.priced;
  const subtotal = pricing.subtotal;
  const deliveryFee = calculateDeliveryFee({
    orderType,
    city,
    address: deliveryAddress,
    subtotal,
  });
  const total = subtotal + deliveryFee;
  const validationError = validateOrderPayload({
    customer,
    customerEmail,
    customerPhone,
    orderType,
    deliveryAddress,
    paymentMethod,
    details,
    subtotal,
    total,
  });

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const reservation = await reserveInventoryForOrder(details);

  if (!reservation.ok) {
    return res.status(400).json({
      message: "Inventory is not enough for one or more selected items.",
      shortages: reservation.shortages,
    });
  }

  const orderRecord = {
    // High-entropy random suffix so order IDs can't be enumerated/guessed
    // (the tracking endpoint is public by design).
    id: `ORD-${Date.now()}-${crypto.randomBytes(6).toString("hex")}`,
    customer,
    customerEmail,
    customerPhone,
    items: details.map((item: Record<string, unknown>) => {
      const quantity = Number(item.quantity ?? 1);
      const name = String(item.name ?? "Chicken House Item");
      const variant = String(item.variantLabel ?? "");
      return `${quantity}x ${name}${variant ? ` (${variant})` : ""}`;
    }).join(", "),
    total,
    status: "Pending",
    time: new Date().toISOString(),
    type: orderType,
    paymentMethod,
    paymentStatus: needsVerification ? "Pending Verification" : "Unpaid",
    paymentReference,
    paymentVerifiedBy: "",
    paymentVerifiedAt: "",
    paymentNote: "",
    rating: 0,
    feedback: "",
    reviewId: "",
    ratedAt: "",
    details,
    branchId: "renala-khurd-main",
    deliveryAddress,
    notes,
    subtotal: Number.isFinite(subtotal) && subtotal > 0 ? subtotal : total - deliveryFee,
    deliveryFee,
    assignedStaffId,
    assignedStaffName:
      db.staff.find((member) => Number(member.id) === assignedStaffId)?.name ?? "",
    assignedRole,
  };

  if (isMongoConfigured()) {
    const createdOrder = await OrderModel.create(orderRecord);
    let existingCustomer = await findCustomerDocument(customerEmail);

    if (!existingCustomer) {
      existingCustomer = await CustomerModel.create({
        id: `customer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: customer,
        email: customerEmail,
        phone: customerPhone,
        address: deliveryAddress,
        city: city || "Renala Khurd",
        memberSince: new Date().getFullYear().toString(),
        loyaltyPoints: 0,
        walletBalance: 0,
        favoriteCategory: "House Specials",
        orderCount: 0,
        avatarInitials: customer
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
        activity: ["Customer account created from website checkout."],
      });
    }

    if (existingCustomer) {
      existingCustomer.name = customer;
      existingCustomer.phone = customerPhone || existingCustomer.phone;
      existingCustomer.address = deliveryAddress || existingCustomer.address;
      existingCustomer.city = city || existingCustomer.city;
      existingCustomer.orderCount += 1;
      existingCustomer.loyaltyPoints += Math.round(total / 10);
      existingCustomer.activity.unshift(`New order ${orderRecord.id} placed.`);
      await existingCustomer.save();
    }

    // Bank-transfer revenue is only booked once payment is verified (see PATCH /:id/payment).
    if (!needsVerification) {
      await recordSaleCredit(orderRecord.id, total);
    }

    return res.status(201).json(createdOrder.toObject());
  }

  db.orders.push(orderRecord);

  let existingCustomer = db.customers.find(
    (item) => item.email.toLowerCase() === customerEmail.toLowerCase(),
  );

  if (!existingCustomer) {
    existingCustomer = {
      id: `customer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: customer,
      email: customerEmail,
      phone: customerPhone,
      address: deliveryAddress,
      city: city || "Renala Khurd",
      memberSince: new Date().getFullYear().toString(),
      loyaltyPoints: 0,
      walletBalance: 0,
      favoriteCategory: "House Specials",
      orderCount: 0,
      avatarInitials: customer
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
      activity: ["Customer account created from website checkout."],
    };
    db.customers.push(existingCustomer);
  }

  if (existingCustomer) {
    existingCustomer.name = customer;
    existingCustomer.phone = customerPhone || existingCustomer.phone;
    existingCustomer.address = deliveryAddress || existingCustomer.address;
    existingCustomer.city = city || existingCustomer.city;
    existingCustomer.orderCount += 1;
    existingCustomer.loyaltyPoints += Math.round(total / 10);
    existingCustomer.activity.unshift(`New order ${orderRecord.id} placed.`);
  }

  if (!needsVerification) {
    await recordSaleCredit(orderRecord.id, total);
  }

  return res.status(201).json(orderRecord);
});

// Admin/manager verifies or rejects a bank-transfer payment. Verifying confirms the
// order and books revenue; rejecting cancels it. The update flows through the orders
// change stream, so the customer's tracking page reflects it in realtime.
router.patch("/:id/payment", requireRole(["admin", "manager"]), async (req, res) => {
  const action = String(req.body?.action ?? "").trim().toLowerCase();
  const note = String(req.body?.note ?? "").trim();
  const verifier = getRequestAuthUser(req);
  const verifierName = verifier?.name || verifier?.role || "Staff";
  const now = new Date().toISOString();

  if (action !== "verify" && action !== "reject") {
    return res.status(400).json({ message: "Action must be 'verify' or 'reject'." });
  }

  const patch: Record<string, unknown> =
    action === "verify"
      ? { paymentStatus: "Verified", status: "Confirmed", paymentVerifiedBy: verifierName, paymentVerifiedAt: now, paymentNote: note }
      : { paymentStatus: "Rejected", status: "Cancelled", paymentVerifiedBy: verifierName, paymentVerifiedAt: now, paymentNote: note };

  if (isMongoConfigured()) {
    const order = await OrderModel.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ message: "Order not found." });

    const wasPending = order.paymentStatus === "Pending Verification";
    Object.assign(order, patch);
    await order.save();

    if (action === "verify" && wasPending) {
      await recordSaleCredit(String(order.id), Number(order.total ?? 0));
    }
    await emailOrderDecision(order.toObject(), action, note);
    return res.json(order.toObject());
  }

  const index = db.orders.findIndex((order) => order.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Order not found." });

  const wasPending = (db.orders[index] as Record<string, unknown>).paymentStatus === "Pending Verification";
  db.orders[index] = { ...db.orders[index], ...patch };

  if (action === "verify" && wasPending) {
    await recordSaleCredit(String(db.orders[index].id), Number(db.orders[index].total ?? 0));
  }
  await emailOrderDecision(db.orders[index], action, note);
  return res.json(db.orders[index]);
});

// Customer submits a star rating + feedback after delivery. Stored as a real Review
// (Mongo) and linked back to the order. Allowed once, only after delivery.
router.post("/:id/feedback", async (req, res) => {
  const rating = Math.round(Number(req.body?.rating ?? 0));
  const comment = String(req.body?.comment ?? "").trim();
  const now = new Date().toISOString();

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Please provide a rating between 1 and 5 stars." });
  }

  const buildReview = (order: Record<string, unknown>) => ({
    id: `REV-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    customerName: String(order.customer ?? "Guest"),
    customerEmail: String(order.customerEmail ?? ""),
    source: "website",
    rating,
    title: "",
    comment: comment || `${rating}-star rating`,
    tags: [],
    status: "Pending",
    isFeatured: false,
    branchId: String(order.branchId ?? ""),
    orderId: String(order.id ?? ""),
  });

  if (isMongoConfigured()) {
    const order = await OrderModel.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (order.status !== "Delivered") {
      return res.status(400).json({ message: "Feedback can be submitted once your order is delivered." });
    }
    if (order.ratedAt) {
      return res.status(409).json({ message: "Feedback already submitted for this order." });
    }

    const review = buildReview(order.toObject());
    await ReviewModel.create(review);
    order.rating = rating;
    order.feedback = comment;
    order.reviewId = review.id;
    order.ratedAt = now;
    await order.save();

    return res.status(201).json({ message: "Thank you for your feedback!", rating, reviewId: review.id });
  }

  const index = db.orders.findIndex((order) => order.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Order not found." });

  const order = db.orders[index] as Record<string, unknown>;
  if (order.status !== "Delivered") {
    return res.status(400).json({ message: "Feedback can be submitted once your order is delivered." });
  }
  if (order.ratedAt) {
    return res.status(409).json({ message: "Feedback already submitted for this order." });
  }

  const review = buildReview(order);
  const feedbackPatch: Record<string, unknown> = { rating, feedback: comment, reviewId: review.id, ratedAt: now };
  db.orders[index] = { ...db.orders[index], ...feedbackPatch };
  return res.status(201).json({ message: "Thank you for your feedback!", rating, reviewId: review.id });
});

router.patch("/:id", requirePermission("orders:update"), async (req, res) => {
  const actor = getRequestAuthUser(req);
  const isManagerOrAdmin = actor?.role === "admin" || actor?.role === "manager";
  const status = String(req.body?.status ?? "").trim();

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid order status." });
  }

  // Operational fields any orders:update role (incl. staff/rider) may change.
  const nextPayload: Record<string, unknown> = {};
  if (status) nextPayload.status = status;
  if (req.body?.assignedRole !== undefined) nextPayload.assignedRole = String(req.body.assignedRole);
  if (req.body?.notes !== undefined) nextPayload.notes = String(req.body.notes);

  if (req.body?.assignedStaffId !== undefined) {
    const assignedStaffId = Math.max(0, Number(req.body.assignedStaffId));
    const assignedStaff = db.staff.find((member) => Number(member.id) === assignedStaffId);
    nextPayload.assignedStaffId = assignedStaffId;
    nextPayload.assignedStaffName = assignedStaff?.name ?? "";
  }

  // Admin/manager may also edit order content (customer info, items, money, type).
  // SECURITY: payment-verification state (paymentStatus / paymentVerifiedBy /
  // paymentVerifiedAt) is NEVER set here for ANY role — it changes only via the
  // admin/manager PATCH /:id/payment route. This stops staff/rider (who also hold
  // orders:update) from forging a "Verified" payment or rewriting the verifier.
  if (isManagerOrAdmin) {
    for (const field of ["customer", "customerEmail", "customerPhone", "deliveryAddress", "items", "type", "paymentMethod", "paymentReference"]) {
      if (req.body?.[field] !== undefined) nextPayload[field] = String(req.body[field]);
    }
    if (Array.isArray(req.body?.details)) nextPayload.details = req.body.details;
    if (req.body?.subtotal !== undefined) nextPayload.subtotal = Math.max(0, Number(req.body.subtotal));
    if (req.body?.deliveryFee !== undefined) nextPayload.deliveryFee = Math.max(0, Number(req.body.deliveryFee));
    if (req.body?.total !== undefined) nextPayload.total = Math.max(0, Number(req.body.total));
  }

  if (Object.keys(nextPayload).length === 0) {
    return res.status(400).json({ message: "No editable fields provided." });
  }

  if (isMongoConfigured()) {
    const updated = await OrderModel.findOneAndUpdate(
      { id: req.params.id },
      nextPayload,
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json(updated);
  }

  const index = db.orders.findIndex((order) => order.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Order not found" });
  }

  db.orders[index] = { ...db.orders[index], ...nextPayload };
  return res.json(db.orders[index]);
});

router.delete("/:id", requirePermission("orders:delete"), async (req, res) => {
  if (isMongoConfigured()) {
    const deleted = await OrderModel.findOneAndDelete({ id: req.params.id }).lean();

    if (!deleted) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ message: "Order deleted", order: deleted });
  }

  const index = db.orders.findIndex((order) => order.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Order not found" });
  }

  const [deleted] = db.orders.splice(index, 1);
  return res.json({ message: "Order deleted", order: deleted });
});

export default router;
