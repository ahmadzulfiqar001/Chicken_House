import express from "express";
import { getAuthenticatedUser, requirePermission } from "../auth/auth.service";
import { db } from "../../core/db";
import { reserveInventoryForOrder } from "../menu/menu.service";
import { CustomerModel, FinanceModel, OrderModel } from "../../core/models";
import { isMongoConnected } from "../../core/mongo";
import { calculateDeliveryFee, validateOrderPayload } from "./orders.pricing";

const router = express.Router();
const validStatuses = ["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

const findCustomerDocument = async (email: string) =>
  CustomerModel.findOne({ email: email.toLowerCase() });

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

router.get("/", async (req, res) => {
  const authUser = await getAuthenticatedUser(req);
  const email = String(req.query.email ?? "").toLowerCase();
  const customerName = String(req.query.customer ?? "").toLowerCase();

  if (isMongoConnected()) {
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

  if (isMongoConnected()) {
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
  const deliveryAddress = String(req.body?.deliveryAddress ?? "").trim();
  const city = String(req.body?.city ?? "").trim();
  const notes = String(req.body?.notes ?? "").trim();
  const assignedStaffId = Math.max(0, Number(req.body?.assignedStaffId ?? 0));
  const assignedRole = String(req.body?.assignedRole ?? "").trim();
  const details = Array.isArray(req.body?.details) ? req.body.details : [];
  const subtotal = details.reduce((sum, item) => {
    const quantity = Math.max(1, Number((item as Record<string, unknown>).quantity ?? 1));
    const price = Math.max(0, Number((item as Record<string, unknown>).price ?? 0));
    return sum + quantity * price;
  }, 0);
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
    id: `ORD-${Date.now()}`,
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

  if (isMongoConnected()) {
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

    await FinanceModel.create({
      id: `TX-${Date.now()}`,
      type: "Credit",
      amount: total,
      source: `Order ${orderRecord.id}`,
      date: new Date().toISOString(),
      category: "Sales",
    });

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

  db.finance.unshift({
    id: `TX-${Date.now()}`,
    type: "Credit",
    amount: total,
    source: `Order ${orderRecord.id}`,
    date: new Date().toISOString(),
    category: "Sales",
  });

  return res.status(201).json(orderRecord);
});

router.patch("/:id", requirePermission("orders:update"), async (req, res) => {
  const status = String(req.body?.status ?? "").trim();
  const nextPayload = { ...req.body } as Record<string, unknown>;

  if (req.body?.assignedStaffId !== undefined) {
    const assignedStaffId = Math.max(0, Number(req.body.assignedStaffId));
    const assignedStaff = db.staff.find((member) => Number(member.id) === assignedStaffId);
    nextPayload.assignedStaffId = assignedStaffId;
    nextPayload.assignedStaffName = assignedStaff?.name ?? "";
  }

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid order status." });
  }

  if (isMongoConnected()) {
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
  if (isMongoConnected()) {
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
