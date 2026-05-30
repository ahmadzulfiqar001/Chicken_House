# Assignment 1 - MongoDB Schema Overview

## Objective Fit

This document converts the existing Chicken House backend schema into an assignment-ready format. The source of truth is `server/models.ts`, while `server/mongo.ts` handles connection and seeding. The project uses MongoDB through Mongoose, so the assignment is directly related to this project.

## Files And Folders Used For This Assignment

- `server/models.ts` - all schema definitions
- `server/mongo.ts` - MongoDB connection and seed logic
- `server/routes/` - active feature routes that use collections
- `server/auth.ts` - auth and session logic
- `server/chicken-house-assistant.ts` - chatbot conversation data
- `server/menu-service.ts` - menu and inventory integration

## Collection Status Summary

### Active collections already used in project features

- `inventory`
- `vendorPurchases`
- `menu`
- `staff`
- `attendance`
- `leaveRequests`
- `payroll`
- `shiftSchedules`
- `performanceReviews`
- `finance`
- `orders`
- `customers`
- `assistantConversations`
- `userAccounts`
- `authSessions`
- `bookings`
- `contactMessages`
- `reviews`

### Schema-ready collections already defined in the project

- `branches`
- `promotions`
- `notifications`
- `supportTickets`
- `riders`
- `gallerySections`
- `serviceSections`
- `siteSettings`
- `analyticsSnapshots`
- `auditLogs`

## Top-Level Collection Schemas

### `inventory`

Status: Active

- `id`: Number, required
- `name`: String, required
- `category`: String, required
- `stock`: Number, required
- `unit`: String, required
- `minStock`: Number, required
- `price`: Number, required
- `supplier`: String, optional
- `costPerUnit`: Number, optional
- `lastUpdated`: String, optional

### `vendorPurchases`

Status: Active

- `id`: String, required
- `vendorName`: String, required
- `itemName`: String, required
- `unit`: String, optional
- `quotedPrice`: Number, optional
- `targetPrice`: Number, optional
- `quantityReceived`: Number, optional
- `minimumOrderQuantity`: Number, optional
- `billAmount`: Number, optional
- `amountPaid`: Number, optional
- `discountCut`: Number, optional
- `purchaseDate`: String, optional
- `status`: String, optional
- `notes`: String, optional

### `menu`

Status: Active

- `id`: String, required
- `name`: String, required
- `category`: String, required
- `subcategory`: String, required
- `description`: String, optional
- `image`: String, optional
- `rating`: Number, optional
- `status`: String, optional
- `recommended`: Boolean, optional
- `featured`: Boolean, optional
- `popular`: Boolean, optional
- `variants`: `Variant[]`, optional
- `inventoryUsage`: Mixed object, optional

### `staff`

Status: Active

- `id`: Number, required
- `name`: String, required
- `role`: String, required
- `status`: String, optional
- `shift`: String, optional
- `salary`: Number, optional
- `joinDate`: String, optional
- `email`: String, optional
- `phone`: String, optional
- `address`: String, optional
- `emergencyContact`: String, optional
- `department`: String, optional
- `leaveBalance`: Number, optional
- `performanceScore`: Number, optional

### `attendance`

Status: Active

- `id`: String, required
- `staffId`: Number, required
- `staffName`: String, required
- `date`: String, required
- `clockIn`: String, optional
- `clockOut`: String, optional
- `status`: String, optional
- `workHours`: Number, optional
- `notes`: String, optional

Note: This schema also auto-generates `createdAt` and `updatedAt` because `timestamps: true` is enabled.

### `leaveRequests`

Status: Active

- `id`: String, required
- `staffId`: Number, required
- `staffName`: String, required
- `leaveType`: String, optional
- `startDate`: String, required
- `endDate`: String, required
- `days`: Number, optional
- `reason`: String, optional
- `status`: String, optional
- `approvedBy`: String, optional
- `approvedAt`: String, optional
- `rejectionReason`: String, optional

Note: This schema also auto-generates `createdAt` and `updatedAt` because `timestamps: true` is enabled.

### `payroll`

Status: Active

- `id`: String, required
- `staffId`: Number, required
- `staffName`: String, required
- `month`: String, required
- `year`: Number, required
- `baseSalary`: Number, optional
- `bonus`: Number, optional
- `deductions`: Number, optional
- `netSalary`: Number, optional
- `workingDays`: Number, optional
- `presentDays`: Number, optional
- `absentDays`: Number, optional
- `leaveDays`: Number, optional
- `status`: String, optional
- `paidAt`: String, optional
- `paymentMethod`: String, optional
- `notes`: String, optional

Note: This schema also auto-generates `createdAt` and `updatedAt` because `timestamps: true` is enabled.

### `shiftSchedules`

Status: Active

- `id`: String, required
- `staffId`: Number, required
- `staffName`: String, required
- `date`: String, required
- `shiftType`: String, optional
- `startTime`: String, optional
- `endTime`: String, optional
- `notes`: String, optional

Note: This schema also auto-generates `createdAt` and `updatedAt` because `timestamps: true` is enabled.

### `performanceReviews`

Status: Active

- `id`: String, required
- `staffId`: Number, required
- `staffName`: String, required
- `reviewDate`: String, required
- `reviewPeriod`: String, optional
- `punctuality`: Number, optional
- `quality`: Number, optional
- `teamwork`: Number, optional
- `communication`: Number, optional
- `overallScore`: Number, optional
- `strengths`: String, optional
- `improvements`: String, optional
- `reviewedBy`: String, optional
- `notes`: String, optional

Note: This schema also auto-generates `createdAt` and `updatedAt` because `timestamps: true` is enabled.

### `finance`

Status: Active

- `id`: String, required
- `type`: String, required
- `amount`: Number, required
- `source`: String, optional
- `date`: String, optional
- `category`: String, optional

### `orders`

Status: Active

- `id`: String, required
- `customer`: String, required
- `customerEmail`: String, optional
- `customerPhone`: String, optional
- `items`: String, optional
- `subtotal`: Number, optional
- `deliveryFee`: Number, optional
- `total`: Number, optional
- `status`: String, optional
- `time`: String, optional
- `type`: String, optional
- `paymentMethod`: String, optional
- `details`: `OrderDetail[]`, optional
- `branchId`: String, optional
- `deliveryAddress`: String, optional
- `notes`: String, optional

### `customers`

Status: Active

- `id`: String, required
- `name`: String, required
- `email`: String, required
- `phone`: String, optional
- `address`: String, optional
- `city`: String, optional
- `memberSince`: String, optional
- `loyaltyPoints`: Number, optional
- `walletBalance`: Number, optional
- `favoriteCategory`: String, optional
- `orderCount`: Number, optional
- `avatarInitials`: String, optional
- `preferences`: `CustomerPreferences`, optional
- `addresses`: `CustomerAddress[]`, optional
- `wishlist`: `WishlistItem[]`, optional
- `walletTransactions`: `WalletTransaction[]`, optional
- `activity`: `String[]`, optional

### `assistantConversations`

Status: Active

- `id`: String, required
- `customerName`: String, required
- `customerNumber`: String, required
- `adminNumber`: String, required
- `channel`: String, optional
- `status`: String, optional
- `startedAt`: String, optional
- `updatedAt`: String, optional
- `messages`: `AssistantMessage[]`, optional

### `userAccounts`

Status: Active

- `id`: String, required
- `name`: String, required
- `email`: String, required
- `passwordHash`: String, optional
- `role`: String, optional
- `provider`: String, optional
- `status`: String, optional
- `phone`: String, optional
- `memberSince`: String, optional
- `emailVerified`: Boolean, optional
- `lastLoginAt`: String, optional
- `avatarUrl`: String, optional
- `avatarInitials`: String, optional
- `customerProfileId`: String, optional
- `preferences`: `UserPreference`, optional

Note: This schema also auto-generates `createdAt` and `updatedAt` because `timestamps: true` is enabled.

### `authSessions`

Status: Active

- `id`: String, required
- `userId`: String, required
- `email`: String, required
- `role`: String, optional
- `provider`: String, optional
- `accessTokenHash`: String, optional
- `refreshTokenHash`: String, optional
- `ipAddress`: String, optional
- `userAgent`: String, optional
- `deviceLabel`: String, optional
- `isActive`: Boolean, optional
- `lastSeenAt`: String, optional
- `expiresAt`: String, optional

Note: This schema also auto-generates `createdAt` and `updatedAt` because `timestamps: true` is enabled.

### `bookings`

Status: Active

- `id`: String, required
- `customerName`: String, required
- `customerEmail`: String, optional
- `customerPhone`: String, optional
- `eventType`: String, optional
- `zone`: String, optional
- `guests`: Number, optional
- `package`: String, optional
- `date`: String, optional
- `time`: String, optional
- `source`: String, optional
- `status`: String, optional
- `specialRequests`: String, optional
- `branchId`: String, optional
- `quotedPrice`: Number, optional
- `internalNotes`: String, optional
- `assignedTo`: String, optional

Note: This schema also auto-generates `createdAt` and `updatedAt` because `timestamps: true` is enabled.

### `contactMessages`

Status: Active

- `id`: String, required
- `name`: String, required
- `email`: String, optional
- `phone`: String, optional
- `subject`: String, optional
- `message`: String, required
- `source`: String, optional
- `status`: String, optional
- `priority`: String, optional
- `tags`: `String[]`, optional
- `assignedTo`: String, optional
- `responseMessage`: String, optional
- `respondedAt`: String, optional

Note: This schema also auto-generates `createdAt` and `updatedAt` because `timestamps: true` is enabled.

### `reviews`

Status: Active

- `id`: String, required
- `customerName`: String, required
- `customerEmail`: String, optional
- `source`: String, optional
- `rating`: Number, required
- `title`: String, optional
- `comment`: String, required
- `tags`: `String[]`, optional
- `status`: String, optional
- `isFeatured`: Boolean, optional
- `branchId`: String, optional
- `orderId`: String, optional

Note: This schema also auto-generates `createdAt` and `updatedAt` because `timestamps: true` is enabled.

### `branches`

Status: Schema-ready

- `id`: String, required
- `name`: String, required
- `slug`: String, required
- `status`: String, optional
- `manager`: String, optional
- `email`: String, optional
- `phone`: String, optional
- `addressLine1`: String, optional
- `addressLine2`: String, optional
- `city`: String, optional
- `landmark`: String, optional
- `coordinates`: `Coordinates`, optional
- `timings`: `BusinessHour[]`, optional
- `amenities`: `String[]`, optional
- `parkingAvailable`: Boolean, optional
- `staffCount`: Number, optional
- `rating`: Number, optional
- `averageDailyOrders`: Number, optional
- `averageDailyRevenue`: Number, optional
- `gallery`: `MediaItem[]`, optional

Note: This schema also auto-generates `createdAt` and `updatedAt` because `timestamps: true` is enabled.

### `promotions`

Status: Schema-ready

- `id`: String, required
- `title`: String, required
- `slug`: String, required
- `description`: String, optional
- `type`: String, optional
- `status`: String, optional
- `badge`: String, optional
- `image`: String, optional
- `startAt`: String, optional
- `endAt`: String, optional
- `discountLabel`: String, optional
- `appliesToCategories`: `String[]`, optional
- `appliesToMenuIds`: `String[]`, optional
- `branchIds`: `String[]`, optional
- `ctas`: `Cta[]`, optional

Note: This schema also auto-generates `createdAt` and `updatedAt` because `timestamps: true` is enabled.

### `notifications`

Status: Schema-ready

- `id`: String, required
- `title`: String, required
- `message`: String, required
- `audience`: String, optional
- `channel`: String, optional
- `status`: String, optional
- `scheduledAt`: String, optional
- `sentAt`: String, optional
- `createdBy`: String, optional
- `branchId`: String, optional
- `metadata`: Mixed object, optional

Note: This schema also auto-generates `createdAt` and `updatedAt` because `timestamps: true` is enabled.

### `supportTickets`

Status: Schema-ready

- `id`: String, required
- `customerName`: String, required
- `customerEmail`: String, optional
- `customerPhone`: String, optional
- `subject`: String, required
- `category`: String, optional
- `priority`: String, optional
- `status`: String, optional
- `assignedTo`: String, optional
- `orderId`: String, optional
- `messages`: `SupportTicketMessage[]`, optional
- `resolutionNote`: String, optional

Note: This schema also auto-generates `createdAt` and `updatedAt` because `timestamps: true` is enabled.

### `riders`

Status: Schema-ready

- `id`: String, required
- `name`: String, required
- `phone`: String, optional
- `status`: String, optional
- `shift`: String, optional
- `vehicleType`: String, optional
- `plateNumber`: String, optional
- `zone`: String, optional
- `rating`: Number, optional
- `activeOrders`: Number, optional

Note: This schema also auto-generates `createdAt` and `updatedAt` because `timestamps: true` is enabled.

### `gallerySections`

Status: Schema-ready

- `id`: String, required
- `key`: String, required
- `page`: String, optional
- `title`: String, required
- `subtitle`: String, optional
- `description`: String, optional
- `layout`: String, optional
- `order`: Number, optional
- `status`: String, optional
- `tags`: `String[]`, optional
- `media`: `MediaItem[]`, optional
- `ctas`: `Cta[]`, optional

Note: This schema also auto-generates `createdAt` and `updatedAt` because `timestamps: true` is enabled.

### `serviceSections`

Status: Schema-ready

- `id`: String, required
- `key`: String, required
- `page`: String, optional
- `title`: String, required
- `subtitle`: String, optional
- `description`: String, optional
- `layout`: String, optional
- `order`: Number, optional
- `status`: String, optional
- `icon`: String, optional
- `badges`: `String[]`, optional
- `highlights`: `String[]`, optional
- `media`: `MediaItem[]`, optional
- `ctas`: `Cta[]`, optional

Note: This schema also auto-generates `createdAt` and `updatedAt` because `timestamps: true` is enabled.

### `siteSettings`

Status: Schema-ready

- `key`: String, required
- `brandName`: String, optional
- `tagline`: String, optional
- `logoUrl`: String, optional
- `faviconUrl`: String, optional
- `primaryColor`: String, optional
- `accentColor`: String, optional
- `contactEmail`: String, optional
- `contactPhone`: String, optional
- `whatsappNumber`: String, optional
- `addressLine1`: String, optional
- `city`: String, optional
- `mapEmbedUrl`: String, optional
- `businessHours`: `BusinessHour[]`, optional
- `socialLinks`: `SocialLink[]`, optional
- `seoTitle`: String, optional
- `seoDescription`: String, optional
- `maintenanceMode`: Boolean, optional
- `settings`: Mixed object, optional

Note: This schema also auto-generates `createdAt` and `updatedAt` because `timestamps: true` is enabled.

### `analyticsSnapshots`

Status: Schema-ready

- `id`: String, required
- `dateKey`: String, required
- `branchId`: String, optional
- `totalOrders`: Number, optional
- `totalRevenue`: Number, optional
- `totalCustomers`: Number, optional
- `topItems`: `String[]`, optional
- `channelBreakdown`: Mixed object, optional
- `sourceBreakdown`: Mixed object, optional

Note: This schema also auto-generates `createdAt` and `updatedAt` because `timestamps: true` is enabled.

### `auditLogs`

Status: Schema-ready

- `id`: String, required
- `actorId`: String, optional
- `actorEmail`: String, optional
- `actorRole`: String, optional
- `action`: String, required
- `entityType`: String, required
- `entityId`: String, optional
- `details`: Mixed object, optional
- `createdAt`: String, optional

## Embedded Schemas Used By Top-Level Collections

### `SocialLink`

- `platform`: String, required
- `label`: String, optional
- `url`: String, optional
- `handle`: String, optional

### `BusinessHour`

- `day`: String, required
- `open`: String, optional
- `close`: String, optional
- `isClosed`: Boolean, optional

### `Coordinates`

- `lat`: Number, optional
- `lng`: Number, optional

### `Cta`

- `label`: String, required
- `href`: String, required
- `type`: String, optional

### `MediaItem`

- `id`: String, required
- `mediaType`: String, optional
- `title`: String, required
- `subtitle`: String, optional
- `caption`: String, optional
- `alt`: String, optional
- `url`: String, required
- `thumbnailUrl`: String, optional
- `page`: String, optional
- `sectionKey`: String, optional
- `category`: String, optional
- `tags`: `String[]`, optional
- `source`: String, optional
- `sortOrder`: Number, optional
- `status`: String, optional
- `isFeatured`: Boolean, optional
- `likes`: Number, optional
- `views`: Number, optional

### `Variant`

- `label`: String, required
- `price`: Number, required

### `PlatterItem`

- `id`: String, optional
- `name`: String, required
- `price`: Number, optional
- `quantity`: Number, optional

### `OrderCustomization`

- `variantLabel`: String, optional
- `drink`: String, optional
- `chutney`: String, optional
- `spices`: String, optional
- `instructions`: String, optional
- `extras`: `String[]`, optional
- `items`: `PlatterItem[]`, optional

### `OrderDetail`

- `menuItemId`: String, optional
- `name`: String, required
- `category`: String, optional
- `variantLabel`: String, optional
- `quantity`: Number, optional
- `price`: Number, optional
- `image`: String, optional
- `customizations`: `OrderCustomization`, optional

### `CustomerAddress`

- `id`: String, required
- `label`: String, required
- `line`: String, required
- `note`: String, optional

### `WishlistItem`

- `id`: String, required
- `name`: String, required
- `category`: String, required
- `price`: Number, optional
- `image`: String, optional

### `WalletTransaction`

- `id`: String, required
- `type`: String, required
- `amount`: Number, optional
- `reason`: String, optional
- `time`: String, optional

### `CustomerPreferences`

- `notifications`: Boolean, optional
- `promotions`: Boolean, optional
- `orderUpdates`: Boolean, optional
- `darkAlerts`: Boolean, optional

### `UserPreference`

- `notifications`: Boolean, optional
- `promotions`: Boolean, optional
- `orderUpdates`: Boolean, optional
- `language`: String, optional
- `theme`: String, optional

### `SupportTicketMessage`

- `id`: String, required
- `senderRole`: String, optional
- `text`: String, required
- `createdAt`: String, optional

### `AssistantMessage`

- `id`: String, required
- `role`: String, required
- `text`: String, required
- `createdAt`: String, optional

## Relationships Between Collections

The project mostly uses **logical references** such as IDs and emails instead of Mongoose `ref` fields. That means collections are connected through matching business keys rather than automatic population.

- `staff.id` -> `attendance.staffId`
- `staff.id` -> `leaveRequests.staffId`
- `staff.id` -> `payroll.staffId`
- `staff.id` -> `shiftSchedules.staffId`
- `staff.id` -> `performanceReviews.staffId`
- `customers.email` -> `orders.customerEmail`
- `userAccounts.customerProfileId` -> `customers.id`
- `userAccounts.id` -> `authSessions.userId`
- `branches.id` -> `orders.branchId`
- `branches.id` -> `bookings.branchId`
- `branches.id` -> `reviews.branchId`
- `branches.id` -> `notifications.branchId`
- `branches.id` -> `analyticsSnapshots.branchId`
- `orders.id` -> `reviews.orderId`
- `orders.id` -> `supportTickets.orderId`
- `menu.id` -> `orders.details[].menuItemId`
- `menu.id` -> `promotions.appliesToMenuIds[]`
- `branches.id` -> `promotions.branchIds[]`

## Why The Data Is Structured This Way

This schema is structured around the real modules of the Chicken House project, so each major feature such as orders, customers, HR, finance, bookings, and authentication has its own collection. Embedded subdocuments are used where the child data naturally belongs to one parent document, such as order details, wallet transactions, preferences, and chatbot messages, which keeps reads simple for the UI. Separate top-level collections are used where the records grow independently or need filtering, reporting, or auditing, such as payroll, attendance, leave requests, and finance transactions. The project also uses lightweight logical references like `staffId`, `branchId`, `orderId`, and `customerProfileId` so related data can stay connected without forcing heavy joins or deep population chains.
