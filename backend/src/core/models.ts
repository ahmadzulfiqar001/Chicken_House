import mongoose, { Schema } from "mongoose";

const socialLinkSchema = new Schema(
  {
    platform: { type: String, required: true },
    label: { type: String, default: "" },
    url: { type: String, default: "" },
    handle: { type: String, default: "" },
  },
  { _id: false },
);

const businessHourSchema = new Schema(
  {
    day: { type: String, required: true },
    open: { type: String, default: "11:00" },
    close: { type: String, default: "00:00" },
    isClosed: { type: Boolean, default: false },
  },
  { _id: false },
);

const coordinatesSchema = new Schema(
  {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },
  { _id: false },
);

const ctaSchema = new Schema(
  {
    label: { type: String, required: true },
    href: { type: String, required: true },
    type: { type: String, default: "link" },
  },
  { _id: false },
);

const mediaItemSchema = new Schema(
  {
    id: { type: String, required: true },
    mediaType: { type: String, enum: ["image", "video"], default: "image" },
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    caption: { type: String, default: "" },
    alt: { type: String, default: "" },
    url: { type: String, required: true },
    thumbnailUrl: { type: String, default: "" },
    page: { type: String, default: "gallery" },
    sectionKey: { type: String, default: "" },
    category: { type: String, default: "" },
    tags: { type: [String], default: [] },
    source: { type: String, default: "curated" },
    sortOrder: { type: Number, default: 0 },
    status: { type: String, default: "Active" },
    isFeatured: { type: Boolean, default: false },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  { _id: false },
);

const variantSchema = new Schema(
  {
    label: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false },
);

const inventoryUsageSchema = new Schema({}, { _id: false, strict: false });

const inventorySchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    unit: { type: String, required: true },
    minStock: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    supplier: { type: String, default: "Chicken House Supplier" },
    costPerUnit: { type: Number, default: 0 },
    lastUpdated: { type: String, default: () => new Date().toISOString() },
  },
  { versionKey: false },
);

const vendorPurchaseSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    vendorName: { type: String, required: true, index: true },
    itemName: { type: String, required: true, index: true },
    unit: { type: String, default: "kg" },
    quotedPrice: { type: Number, default: 0 },
    targetPrice: { type: Number, default: 0 },
    quantityReceived: { type: Number, default: 0 },
    minimumOrderQuantity: { type: Number, default: 0 },
    billAmount: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    discountCut: { type: Number, default: 0 },
    purchaseDate: { type: String, default: () => new Date().toISOString(), index: true },
    status: { type: String, enum: ["Unpaid", "Partially Paid", "Paid"], default: "Unpaid", index: true },
    notes: { type: String, default: "" },
  },
  { versionKey: false },
);

const menuSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    rating: { type: Number, default: 4.7 },
    status: { type: String, default: "Active" },
    recommended: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    popular: { type: Boolean, default: false },
    variants: { type: [variantSchema], default: [] },
    inventoryUsage: { type: inventoryUsageSchema, default: {} },
  },
  { versionKey: false },
);

const staffSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    status: { type: String, default: "Active" },
    shift: { type: String, default: "Morning" },
    salary: { type: Number, default: 0 },
    joinDate: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    emergencyContact: { type: String, default: "" },
    userAccountId: { type: String, default: "", index: true },
    department: { type: String, default: "" },
    leaveBalance: { type: Number, default: 20 },
    performanceScore: { type: Number, default: 0 },
    careerApplicationId: { type: String, default: "", index: true },
    experience: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    coverLetter: { type: String, default: "" },
  },
  { versionKey: false },
);

const attendanceSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    staffId: { type: Number, required: true, index: true },
    staffName: { type: String, required: true },
    date: { type: String, required: true, index: true },
    clockIn: { type: String, default: "" },
    clockOut: { type: String, default: "" },
    status: { type: String, enum: ["Present", "Absent", "Late", "Half Day", "Leave"], default: "Present", index: true },
    workHours: { type: Number, default: 0 },
    notes: { type: String, default: "" },
  },
  { versionKey: false, timestamps: true },
);

const leaveRequestSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    staffId: { type: Number, required: true, index: true },
    staffName: { type: String, required: true },
    leaveType: { type: String, enum: ["Sick", "Casual", "Annual", "Emergency", "Unpaid"], default: "Casual", index: true },
    startDate: { type: String, required: true, index: true },
    endDate: { type: String, required: true },
    days: { type: Number, default: 1 },
    reason: { type: String, default: "" },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending", index: true },
    approvedBy: { type: String, default: "" },
    approvedAt: { type: String, default: "" },
    rejectionReason: { type: String, default: "" },
  },
  { versionKey: false, timestamps: true },
);

const payrollSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    staffId: { type: Number, required: true, index: true },
    staffName: { type: String, required: true },
    month: { type: String, required: true, index: true },
    year: { type: Number, required: true, index: true },
    baseSalary: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 },
    workingDays: { type: Number, default: 0 },
    presentDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    leaveDays: { type: Number, default: 0 },
    status: { type: String, enum: ["Pending", "Processed", "Paid"], default: "Pending", index: true },
    paidAt: { type: String, default: "" },
    paymentMethod: { type: String, default: "Bank Transfer" },
    notes: { type: String, default: "" },
  },
  { versionKey: false, timestamps: true },
);

const shiftScheduleSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    staffId: { type: Number, required: true, index: true },
    staffName: { type: String, required: true },
    date: { type: String, required: true, index: true },
    shiftType: { type: String, enum: ["Morning", "Evening", "Night", "Off"], default: "Morning", index: true },
    startTime: { type: String, default: "09:00" },
    endTime: { type: String, default: "17:00" },
    notes: { type: String, default: "" },
  },
  { versionKey: false, timestamps: true },
);

const performanceReviewSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    staffId: { type: Number, required: true, index: true },
    staffName: { type: String, required: true },
    reviewDate: { type: String, required: true, index: true },
    reviewPeriod: { type: String, default: "" },
    punctuality: { type: Number, default: 0 },
    quality: { type: Number, default: 0 },
    teamwork: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
    strengths: { type: String, default: "" },
    improvements: { type: String, default: "" },
    reviewedBy: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { versionKey: false, timestamps: true },
);

const financeSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    type: { type: String, required: true },
    amount: { type: Number, required: true, default: 0 },
    source: { type: String, default: "" },
    date: { type: String, default: () => new Date().toISOString() },
    category: { type: String, default: "General" },
  },
  { versionKey: false },
);

const platterItemSchema = new Schema(
  {
    id: { type: String, default: "" },
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 },
  },
  { _id: false },
);

const orderCustomizationSchema = new Schema(
  {
    variantLabel: { type: String, default: "" },
    drink: { type: String, default: "" },
    chutney: { type: String, default: "" },
    spices: { type: String, default: "" },
    instructions: { type: String, default: "" },
    extras: { type: [String], default: [] },
    items: { type: [platterItemSchema], default: [] },
  },
  { _id: false },
);

const orderDetailSchema = new Schema(
  {
    menuItemId: { type: String, default: "" },
    name: { type: String, required: true },
    category: { type: String, default: "" },
    variantLabel: { type: String, default: "" },
    quantity: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
    image: { type: String, default: "" },
    customizations: { type: orderCustomizationSchema, default: () => ({}) },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    customer: { type: String, required: true },
    customerEmail: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    items: { type: String, default: "" },
    subtotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: { type: String, default: "Pending" },
    time: { type: String, default: () => new Date().toISOString() },
    type: { type: String, default: "Delivery" },
    paymentMethod: { type: String, default: "Cash" },
    // Local payment verification flow (bank transfer is verified by admin/manager).
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Pending Verification", "Verified", "Rejected"],
      default: "Unpaid",
      index: true,
    },
    paymentReference: { type: String, default: "" },
    paymentVerifiedBy: { type: String, default: "" },
    paymentVerifiedAt: { type: String, default: "" },
    paymentNote: { type: String, default: "" },
    // Post-delivery customer feedback.
    rating: { type: Number, default: 0 },
    feedback: { type: String, default: "" },
    reviewId: { type: String, default: "" },
    ratedAt: { type: String, default: "" },
    details: { type: [orderDetailSchema], default: [] },
    branchId: { type: String, default: "" },
    deliveryAddress: { type: String, default: "" },
    notes: { type: String, default: "" },
    assignedStaffId: { type: Number, default: 0, index: true },
    assignedStaffName: { type: String, default: "" },
    assignedRole: { type: String, default: "", index: true },
    acceptedByStaffId: { type: Number, default: 0, index: true },
    acceptedByStaffName: { type: String, default: "" },
    acceptedAt: { type: String, default: "" },
    workStatus: { type: String, default: "Pending" },
  },
  { versionKey: false },
);

const customerAddressSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    line: { type: String, required: true },
    note: { type: String, default: "" },
  },
  { _id: false },
);

const wishlistItemSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, default: 0 },
    image: { type: String, default: "" },
  },
  { _id: false },
);

const walletTransactionSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    amount: { type: Number, default: 0 },
    reason: { type: String, default: "" },
    time: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false },
);

const customerPreferencesSchema = new Schema(
  {
    notifications: { type: Boolean, default: true },
    promotions: { type: Boolean, default: true },
    orderUpdates: { type: Boolean, default: true },
    darkAlerts: { type: Boolean, default: false },
  },
  { _id: false },
);

const customerSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    memberSince: { type: String, default: () => new Date().getFullYear().toString() },
    loyaltyPoints: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0 },
    favoriteCategory: { type: String, default: "House Specials" },
    orderCount: { type: Number, default: 0 },
    avatarInitials: { type: String, default: "CH" },
    preferences: { type: customerPreferencesSchema, default: () => ({}) },
    addresses: { type: [customerAddressSchema], default: [] },
    wishlist: { type: [wishlistItemSchema], default: [] },
    walletTransactions: { type: [walletTransactionSchema], default: [] },
    activity: { type: [String], default: [] },
    createdAt: { type: String, default: () => new Date().toISOString(), index: true },
  },
  { versionKey: false },
);

const userPreferenceSchema = new Schema(
  {
    notifications: { type: Boolean, default: true },
    promotions: { type: Boolean, default: true },
    orderUpdates: { type: Boolean, default: true },
    language: { type: String, default: "en" },
    theme: { type: String, default: "restaurant-dark" },
  },
  { _id: false },
);

const userAccountSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, default: "" },
    role: {
      type: String,
      enum: ["admin", "manager", "hr", "rider", "staff", "user"],
      default: "user",
      index: true,
    },
    provider: { type: String, enum: ["email", "google", "facebook", "demo"], default: "email", index: true },
    status: { type: String, enum: ["Active", "Suspended", "Pending"], default: "Active", index: true },
    phone: { type: String, default: "" },
    staffMemberId: { type: Number, default: 0, index: true },
    memberSince: { type: String, default: () => new Date().getFullYear().toString() },
    emailVerified: { type: Boolean, default: false },
    lastLoginAt: { type: String, default: "" },
    passwordResetTokenHash: { type: String, default: "", index: true },
    passwordResetExpiresAt: { type: String, default: "" },
    passwordChangedAt: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    avatarInitials: { type: String, default: "CH" },
    customerProfileId: { type: String, default: "", index: true },
    preferences: { type: userPreferenceSchema, default: () => ({}) },
  },
  { versionKey: false, timestamps: true },
);

const authSessionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    email: { type: String, required: true, index: true },
    role: { type: String, default: "user" },
    provider: { type: String, default: "email" },
    accessTokenHash: { type: String, default: "" },
    refreshTokenHash: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    deviceLabel: { type: String, default: "" },
    isActive: { type: Boolean, default: true, index: true },
    lastSeenAt: { type: String, default: () => new Date().toISOString() },
    expiresAt: { type: String, default: "" },
  },
  { versionKey: false, timestamps: true },
);

const bookingRequestSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true, index: true },
    customerEmail: { type: String, default: "", index: true },
    customerPhone: { type: String, default: "" },
    eventType: { type: String, default: "", index: true },
    zone: { type: String, default: "", index: true },
    tableId: { type: Number, default: 0, index: true },
    guests: { type: Number, default: 0 },
    package: { type: String, default: "" },
    date: { type: String, default: "", index: true },
    time: { type: String, default: "" },
    source: { type: String, default: "website", index: true },
    status: { type: String, enum: ["Pending", "Confirmed", "Completed", "Cancelled"], default: "Pending", index: true },
    specialRequests: { type: String, default: "" },
    branchId: { type: String, default: "", index: true },
    quotedPrice: { type: Number, default: 0 },
    internalNotes: { type: String, default: "" },
    assignedTo: { type: String, default: "" },
  },
  { versionKey: false, timestamps: true },
);

const contactMessageSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    email: { type: String, default: "", index: true },
    phone: { type: String, default: "" },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    source: { type: String, default: "website", index: true },
    status: { type: String, enum: ["Unread", "Read", "Replied", "Archived"], default: "Unread", index: true },
    priority: { type: String, enum: ["Low", "Normal", "High"], default: "Normal", index: true },
    tags: { type: [String], default: [] },
    assignedTo: { type: String, default: "" },
    responseMessage: { type: String, default: "" },
    respondedAt: { type: String, default: "" },
  },
  { versionKey: false, timestamps: true },
);

const reviewSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true, index: true },
    customerEmail: { type: String, default: "" },
    source: { type: String, enum: ["website", "google", "facebook", "instagram"], default: "website", index: true },
    rating: { type: Number, min: 1, max: 5, required: true, index: true },
    title: { type: String, default: "" },
    comment: { type: String, required: true },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Approved", index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    branchId: { type: String, default: "", index: true },
    orderId: { type: String, default: "", index: true },
  },
  { versionKey: false, timestamps: true },
);

const branchSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    status: { type: String, enum: ["Active", "Closed", "Under Construction"], default: "Active", index: true },
    manager: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    addressLine1: { type: String, default: "" },
    addressLine2: { type: String, default: "" },
    city: { type: String, default: "" },
    landmark: { type: String, default: "" },
    coordinates: { type: coordinatesSchema, default: () => ({}) },
    timings: { type: [businessHourSchema], default: [] },
    amenities: { type: [String], default: [] },
    parkingAvailable: { type: Boolean, default: true },
    staffCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    averageDailyOrders: { type: Number, default: 0 },
    averageDailyRevenue: { type: Number, default: 0 },
    gallery: { type: [mediaItemSchema], default: [] },
  },
  { versionKey: false, timestamps: true },
);

const promotionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["deal", "discount", "banner", "combo"], default: "deal", index: true },
    status: { type: String, enum: ["Draft", "Active", "Expired"], default: "Draft", index: true },
    badge: { type: String, default: "" },
    image: { type: String, default: "" },
    startAt: { type: String, default: "", index: true },
    endAt: { type: String, default: "", index: true },
    discountLabel: { type: String, default: "" },
    appliesToCategories: { type: [String], default: [] },
    appliesToMenuIds: { type: [String], default: [] },
    branchIds: { type: [String], default: [] },
    ctas: { type: [ctaSchema], default: [] },
  },
  { versionKey: false, timestamps: true },
);

const notificationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    audience: { type: String, enum: ["all", "customers", "admins", "staff"], default: "all", index: true },
    channel: { type: String, enum: ["in-app", "email", "sms", "whatsapp"], default: "in-app", index: true },
    status: { type: String, enum: ["Draft", "Queued", "Sent", "Failed"], default: "Draft", index: true },
    scheduledAt: { type: String, default: "" },
    sentAt: { type: String, default: "" },
    createdBy: { type: String, default: "" },
    branchId: { type: String, default: "", index: true },
    metadata: { type: new Schema({}, { _id: false, strict: false }), default: {} },
  },
  { versionKey: false, timestamps: true },
);

const supportTicketMessageSchema = new Schema(
  {
    id: { type: String, required: true },
    senderRole: { type: String, enum: ["customer", "admin", "bot"], default: "customer" },
    text: { type: String, required: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false },
);

const supportTicketSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true, index: true },
    customerEmail: { type: String, default: "", index: true },
    customerPhone: { type: String, default: "" },
    subject: { type: String, required: true },
    category: { type: String, default: "General", index: true },
    priority: { type: String, enum: ["Low", "Normal", "High", "Urgent"], default: "Normal", index: true },
    status: { type: String, enum: ["Open", "In Progress", "Resolved", "Closed"], default: "Open", index: true },
    assignedTo: { type: String, default: "" },
    orderId: { type: String, default: "", index: true },
    messages: { type: [supportTicketMessageSchema], default: [] },
    resolutionNote: { type: String, default: "" },
  },
  { versionKey: false, timestamps: true },
);

const riderSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, default: "" },
    status: { type: String, enum: ["Available", "On Delivery", "Offline"], default: "Available", index: true },
    shift: { type: String, default: "Day" },
    vehicleType: { type: String, default: "Bike" },
    plateNumber: { type: String, default: "" },
    zone: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    activeOrders: { type: Number, default: 0 },
  },
  { versionKey: false, timestamps: true },
);

const gallerySectionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    key: { type: String, required: true, unique: true, index: true },
    page: { type: String, default: "gallery", index: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    description: { type: String, default: "" },
    layout: { type: String, default: "grid" },
    order: { type: Number, default: 0, index: true },
    status: { type: String, enum: ["Active", "Hidden"], default: "Active", index: true },
    tags: { type: [String], default: [] },
    media: { type: [mediaItemSchema], default: [] },
    ctas: { type: [ctaSchema], default: [] },
  },
  { versionKey: false, timestamps: true },
);

const serviceSectionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    key: { type: String, required: true, unique: true, index: true },
    page: { type: String, default: "services", index: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    description: { type: String, default: "" },
    layout: { type: String, default: "split" },
    order: { type: Number, default: 0, index: true },
    status: { type: String, enum: ["Active", "Hidden"], default: "Active", index: true },
    icon: { type: String, default: "" },
    badges: { type: [String], default: [] },
    highlights: { type: [String], default: [] },
    media: { type: [mediaItemSchema], default: [] },
    ctas: { type: [ctaSchema], default: [] },
  },
  { versionKey: false, timestamps: true },
);

const siteSettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    brandName: { type: String, default: "Chicken House" },
    tagline: { type: String, default: "A Symbol of Quality & Freshness" },
    logoUrl: { type: String, default: "" },
    faviconUrl: { type: String, default: "" },
    primaryColor: { type: String, default: "#7f1215" },
    accentColor: { type: String, default: "#d8a82f" },
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    whatsappNumber: { type: String, default: "" },
    addressLine1: { type: String, default: "" },
    city: { type: String, default: "" },
    mapEmbedUrl: { type: String, default: "" },
    businessHours: { type: [businessHourSchema], default: [] },
    socialLinks: { type: [socialLinkSchema], default: [] },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    maintenanceMode: { type: Boolean, default: false },
    settings: { type: new Schema({}, { _id: false, strict: false }), default: {} },
  },
  { versionKey: false, timestamps: true },
);

const analyticsSnapshotSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    dateKey: { type: String, required: true, index: true },
    branchId: { type: String, default: "", index: true },
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalCustomers: { type: Number, default: 0 },
    topItems: { type: [String], default: [] },
    channelBreakdown: { type: new Schema({}, { _id: false, strict: false }), default: {} },
    sourceBreakdown: { type: new Schema({}, { _id: false, strict: false }), default: {} },
  },
  { versionKey: false, timestamps: true },
);

const auditLogSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    actorId: { type: String, default: "", index: true },
    actorEmail: { type: String, default: "", index: true },
    actorRole: { type: String, default: "" },
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: String, default: "", index: true },
    details: { type: new Schema({}, { _id: false, strict: false }), default: {} },
    createdAt: { type: String, default: () => new Date().toISOString(), index: true },
  },
  { versionKey: false },
);

const assistantMessageSchema = new Schema(
  {
    id: { type: String, required: true },
    role: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false },
);

const assistantConversationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true },
    customerNumber: { type: String, required: true, index: true },
    adminNumber: { type: String, required: true, index: true },
    channel: { type: String, default: "WhatsApp" },
    status: { type: String, default: "Bot Active" },
    startedAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
    messages: { type: [assistantMessageSchema], default: [] },
  },
  { versionKey: false },
);

const staffNoticeSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    message: { type: String, default: "" },
    audience: { type: [String], default: [] },
    createdAt: { type: String, default: () => new Date().toISOString(), index: true },
    seenBy: { type: [Number], default: [] },
  },
  { versionKey: false },
);

const staffRequestSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    staffId: { type: Number, required: true, index: true },
    staffName: { type: String, default: "" },
    category: { type: String, default: "General Request", index: true },
    subject: { type: String, default: "" },
    message: { type: String, default: "" },
    targetDate: { type: String, default: "" },
    status: { type: String, enum: ["Pending", "Approved", "Rejected", "Resolved"], default: "Pending", index: true },
    createdAt: { type: String, default: () => new Date().toISOString(), index: true },
    resolvedAt: { type: String, default: "" },
  },
  { versionKey: false },
);

const activityLogSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    staffId: { type: Number, index: true },
    staffName: { type: String, default: "" },
    role: { type: String, default: "" },
    action: { type: String, required: true },
    detail: { type: String, default: "" },
    createdAt: { type: String, default: () => new Date().toISOString(), index: true },
  },
  { versionKey: false },
);

const newsletterSubscriberSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "" },
    source: { type: String, default: "website" },
    status: { type: String, enum: ["Subscribed", "Unsubscribed"], default: "Subscribed", index: true },
    createdAt: { type: String, default: () => new Date().toISOString(), index: true },
    updatedAt: { type: String, default: () => new Date().toISOString(), index: true },
    unsubscribedAt: { type: String, default: "" },
  },
  { versionKey: false },
);

const jobOpeningSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, index: true },
    department: { type: String, default: "General", index: true },
    type: { type: String, enum: ["Full-time", "Part-time", "Contract", "Internship"], default: "Full-time" },
    location: { type: String, default: "Renala Khurd" },
    description: { type: String, default: "" },
    requirements: { type: [String], default: [] },
    salaryRange: { type: String, default: "" },
    status: { type: String, enum: ["Open", "Closed"], default: "Open", index: true },
    createdAt: { type: String, default: () => new Date().toISOString(), index: true },
  },
  { versionKey: false },
);

const jobApplicationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    jobId: { type: String, default: "", index: true },
    jobTitle: { type: String, default: "General Application" },
    name: { type: String, required: true, index: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, default: "" },
    experience: { type: String, default: "" },
    coverLetter: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    status: { type: String, enum: ["Pending", "Reviewing", "Approved", "Rejected"], default: "Pending", index: true },
    reviewedBy: { type: String, default: "" },
    reviewedAt: { type: String, default: "" },
    decisionNote: { type: String, default: "" },
    hiredStaffId: { type: Number, default: 0, index: true },
    hiredAt: { type: String, default: "" },
    appliedAt: { type: String, default: () => new Date().toISOString(), index: true },
  },
  { versionKey: false },
);

export const InventoryModel =
  mongoose.models.InventoryItem || mongoose.model("InventoryItem", inventorySchema, "inventory");
export const VendorPurchaseModel =
  mongoose.models.VendorPurchase || mongoose.model("VendorPurchase", vendorPurchaseSchema, "vendorPurchases");
export const MenuModel =
  mongoose.models.MenuItem || mongoose.model("MenuItem", menuSchema, "menu");
export const StaffModel =
  mongoose.models.StaffMember || mongoose.model("StaffMember", staffSchema, "staff");
export const AttendanceModel =
  mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema, "attendance");
export const LeaveRequestModel =
  mongoose.models.LeaveRequest || mongoose.model("LeaveRequest", leaveRequestSchema, "leaveRequests");
export const PayrollModel =
  mongoose.models.Payroll || mongoose.model("Payroll", payrollSchema, "payroll");
export const ShiftScheduleModel =
  mongoose.models.ShiftSchedule || mongoose.model("ShiftSchedule", shiftScheduleSchema, "shiftSchedules");
export const PerformanceReviewModel =
  mongoose.models.PerformanceReview || mongoose.model("PerformanceReview", performanceReviewSchema, "performanceReviews");
export const FinanceModel =
  mongoose.models.FinanceTransaction ||
  mongoose.model("FinanceTransaction", financeSchema, "finance");
export const OrderModel =
  mongoose.models.OrderRecord || mongoose.model("OrderRecord", orderSchema, "orders");
export const CustomerModel =
  mongoose.models.CustomerProfile || mongoose.model("CustomerProfile", customerSchema, "customers");
export const AssistantConversationModel =
  mongoose.models.AssistantConversation ||
  mongoose.model("AssistantConversation", assistantConversationSchema, "assistantConversations");
export const UserAccountModel =
  mongoose.models.UserAccount || mongoose.model("UserAccount", userAccountSchema, "userAccounts");
export const AuthSessionModel =
  mongoose.models.AuthSession || mongoose.model("AuthSession", authSessionSchema, "authSessions");
export const BookingRequestModel =
  mongoose.models.BookingRequest || mongoose.model("BookingRequest", bookingRequestSchema, "bookings");
export const ContactMessageModel =
  mongoose.models.ContactMessage || mongoose.model("ContactMessage", contactMessageSchema, "contactMessages");
export const ReviewModel =
  mongoose.models.Review || mongoose.model("Review", reviewSchema, "reviews");
export const BranchModel =
  mongoose.models.Branch || mongoose.model("Branch", branchSchema, "branches");
export const PromotionModel =
  mongoose.models.Promotion || mongoose.model("Promotion", promotionSchema, "promotions");
export const NotificationModel =
  mongoose.models.Notification || mongoose.model("Notification", notificationSchema, "notifications");
export const SupportTicketModel =
  mongoose.models.SupportTicket || mongoose.model("SupportTicket", supportTicketSchema, "supportTickets");
export const RiderModel =
  mongoose.models.Rider || mongoose.model("Rider", riderSchema, "riders");
export const GallerySectionModel =
  mongoose.models.GallerySection || mongoose.model("GallerySection", gallerySectionSchema, "gallerySections");
export const ServiceSectionModel =
  mongoose.models.ServiceSection || mongoose.model("ServiceSection", serviceSectionSchema, "serviceSections");
export const SiteSettingModel =
  mongoose.models.SiteSetting || mongoose.model("SiteSetting", siteSettingSchema, "siteSettings");
export const AnalyticsSnapshotModel =
  mongoose.models.AnalyticsSnapshot ||
  mongoose.model("AnalyticsSnapshot", analyticsSnapshotSchema, "analyticsSnapshots");
export const AuditLogModel =
  mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema, "auditLogs");
export const StaffNoticeModel =
  mongoose.models.StaffNotice || mongoose.model("StaffNotice", staffNoticeSchema, "staffNotices");
export const StaffRequestModel =
  mongoose.models.StaffRequest || mongoose.model("StaffRequest", staffRequestSchema, "staffRequests");
export const ActivityLogModel =
  mongoose.models.ActivityLog || mongoose.model("ActivityLog", activityLogSchema, "activityLogs");
export const NewsletterSubscriberModel =
  mongoose.models.NewsletterSubscriber ||
  mongoose.model("NewsletterSubscriber", newsletterSubscriberSchema, "newsletterSubscribers");
export const JobOpeningModel =
  mongoose.models.JobOpening || mongoose.model("JobOpening", jobOpeningSchema, "jobOpenings");
export const JobApplicationModel =
  mongoose.models.JobApplication || mongoose.model("JobApplication", jobApplicationSchema, "jobApplications");
