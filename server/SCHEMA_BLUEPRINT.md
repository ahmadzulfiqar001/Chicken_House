# Chicken House Mongo Schema Blueprint

This file documents the A-to-Z MongoDB collection plan for the current Chicken House project so data stays fetchable, searchable, and easy to extend.

## Active Core Collections

### `menu`
- Model: `MenuModel`
- Purpose: customer menu, admin menu management, recommendations, assistant replies, gallery hot-selling food cards
- Primary keys/indexes:
  - `id`
  - `category`
  - `subcategory`
  - `status`
  - `recommended`
- Main fields:
  - `id`, `name`, `category`, `subcategory`
  - `description`, `image`, `rating`
  - `status`, `recommended`
  - `variants[]`
  - `inventoryUsage{}`

### `inventory`
- Model: `InventoryModel`
- Purpose: stock control, order stock deduction, admin inventory CRUD
- Primary keys/indexes:
  - `id`
  - `name`
  - `category`
- Main fields:
  - `id`, `name`, `category`
  - `stock`, `unit`, `minStock`
  - `price`, `supplier`, `costPerUnit`
  - `lastUpdated`

### `orders`
- Model: `OrderModel`
- Purpose: customer orders, admin order management, order tracking, finance credit generation
- Primary keys/indexes:
  - `id`
  - `customerEmail`
  - `customer`
  - `status`
  - `time`
- Main fields:
  - `id`, `customer`, `customerEmail`
  - `items`, `total`, `status`, `time`, `type`, `paymentMethod`
  - `details[]`
  - `branchId`, `deliveryAddress`, `notes`

### `customers`
- Model: `CustomerModel`
- Purpose: profile panel, wallet, addresses, wishlist, activity, customer-linked orders
- Primary keys/indexes:
  - `id`
  - `email`
- Main fields:
  - `id`, `name`, `email`, `phone`
  - `address`, `city`, `memberSince`
  - `loyaltyPoints`, `walletBalance`
  - `favoriteCategory`, `orderCount`
  - `avatarInitials`
  - `preferences{}`
  - `addresses[]`
  - `wishlist[]`
  - `walletTransactions[]`
  - `activity[]`

### `staff`
- Model: `StaffModel`
- Purpose: HR management, admin workforce module
- Primary keys/indexes:
  - `id`
  - `role`
  - `status`
- Main fields:
  - `id`, `name`, `role`, `status`
  - `shift`, `salary`, `joinDate`

### `finance`
- Model: `FinanceModel`
- Purpose: accounts module, income/expense records, order-linked credits
- Primary keys/indexes:
  - `id`
  - `type`
  - `date`
  - `category`
- Main fields:
  - `id`, `type`, `amount`, `source`, `date`, `category`

### `assistantConversations`
- Model: `AssistantConversationModel`
- Purpose: website bot inbox, WhatsApp bot history, admin chatbot monitoring
- Primary keys/indexes:
  - `id`
  - `customerNumber`
  - `adminNumber`
  - `updatedAt`
- Main fields:
  - `id`, `customerName`, `customerNumber`, `adminNumber`
  - `channel`, `status`
  - `startedAt`, `updatedAt`
  - `messages[]`

## Auth Domain

### `userAccounts`
- Model: `UserAccountModel`
- Purpose: backend auth, roles, email login, Google login, admin/user separation
- Primary keys/indexes:
  - `id`
  - `email`
  - `role`
  - `provider`
  - `status`
- Main fields:
  - `id`, `name`, `email`, `passwordHash`
  - `role`, `provider`, `status`
  - `phone`, `memberSince`
  - `emailVerified`, `lastLoginAt`
  - `avatarUrl`, `avatarInitials`
  - `customerProfileId`
  - `preferences{}`

### `authSessions`
- Model: `AuthSessionModel`
- Purpose: JWT/refresh session tracking, device/session invalidation
- Primary keys/indexes:
  - `id`
  - `userId`
  - `email`
  - `isActive`
- Main fields:
  - `id`, `userId`, `email`, `role`
  - `provider`
  - `accessTokenHash`, `refreshTokenHash`
  - `ipAddress`, `userAgent`, `deviceLabel`
  - `isActive`, `lastSeenAt`, `expiresAt`

## Customer Experience Domain

### `bookings`
- Model: `BookingRequestModel`
- Purpose: event booking page, table reservations, indoor/outdoor booking flow
- Primary keys/indexes:
  - `id`
  - `customerEmail`
  - `eventType`
  - `zone`
  - `date`
  - `status`
- Main fields:
  - `id`, `customerName`, `customerEmail`, `customerPhone`
  - `eventType`, `zone`, `guests`, `package`
  - `date`, `time`
  - `source`, `status`
  - `specialRequests`, `branchId`
  - `quotedPrice`, `internalNotes`, `assignedTo`

### `contactMessages`
- Model: `ContactMessageModel`
- Purpose: contact page form submissions and follow-up
- Primary keys/indexes:
  - `id`
  - `email`
  - `status`
  - `priority`
- Main fields:
  - `id`, `name`, `email`, `phone`
  - `subject`, `message`
  - `source`, `status`, `priority`
  - `tags[]`, `assignedTo`
  - `responseMessage`, `respondedAt`

### `reviews`
- Model: `ReviewModel`
- Purpose: testimonials, ratings, social proof, moderation
- Primary keys/indexes:
  - `id`
  - `customerName`
  - `source`
  - `rating`
  - `status`
  - `isFeatured`
- Main fields:
  - `id`, `customerName`, `customerEmail`
  - `source`, `rating`, `title`, `comment`
  - `tags[]`
  - `status`, `isFeatured`
  - `branchId`, `orderId`

## Restaurant Operations Domain

### `branches`
- Model: `BranchModel`
- Purpose: branch admin, branch performance, location management
- Primary keys/indexes:
  - `id`
  - `slug`
  - `status`
- Main fields:
  - `id`, `name`, `slug`, `status`
  - `manager`, `email`, `phone`
  - `addressLine1`, `addressLine2`, `city`, `landmark`
  - `coordinates{}`
  - `timings[]`
  - `amenities[]`
  - `parkingAvailable`, `staffCount`, `rating`
  - `averageDailyOrders`, `averageDailyRevenue`
  - `gallery[]`

### `promotions`
- Model: `PromotionModel`
- Purpose: deals, campaigns, banners, combo offers
- Primary keys/indexes:
  - `id`
  - `slug`
  - `type`
  - `status`
  - `startAt`
  - `endAt`
- Main fields:
  - `id`, `title`, `slug`, `description`
  - `type`, `status`, `badge`, `image`
  - `startAt`, `endAt`, `discountLabel`
  - `appliesToCategories[]`
  - `appliesToMenuIds[]`
  - `branchIds[]`
  - `ctas[]`

### `notifications`
- Model: `NotificationModel`
- Purpose: admin notification center, customer notices, campaigns
- Primary keys/indexes:
  - `id`
  - `audience`
  - `channel`
  - `status`
  - `branchId`
- Main fields:
  - `id`, `title`, `message`
  - `audience`, `channel`, `status`
  - `scheduledAt`, `sentAt`
  - `createdBy`, `branchId`
  - `metadata{}`

### `supportTickets`
- Model: `SupportTicketModel`
- Purpose: support module, order issues, customer complaints, follow-ups
- Primary keys/indexes:
  - `id`
  - `customerEmail`
  - `priority`
  - `status`
  - `orderId`
- Main fields:
  - `id`, `customerName`, `customerEmail`, `customerPhone`
  - `subject`, `category`, `priority`, `status`
  - `assignedTo`, `orderId`
  - `messages[]`
  - `resolutionNote`

### `riders`
- Model: `RiderModel`
- Purpose: rider module, delivery assignment readiness
- Primary keys/indexes:
  - `id`
  - `status`
- Main fields:
  - `id`, `name`, `phone`
  - `status`, `shift`, `vehicleType`, `plateNumber`
  - `zone`, `rating`, `activeOrders`

## Content Management Domain

### `gallerySections`
- Model: `GallerySectionModel`
- Purpose: gallery page sections, images, videos, featured media
- Primary keys/indexes:
  - `id`
  - `key`
  - `page`
  - `order`
  - `status`
- Main fields:
  - `id`, `key`, `page`
  - `title`, `subtitle`, `description`
  - `layout`, `order`, `status`
  - `tags[]`
  - `media[]`
  - `ctas[]`

### `serviceSections`
- Model: `ServiceSectionModel`
- Purpose: services page sections, combos, highlights, media blocks
- Primary keys/indexes:
  - `id`
  - `key`
  - `page`
  - `order`
  - `status`
- Main fields:
  - `id`, `key`, `page`
  - `title`, `subtitle`, `description`
  - `layout`, `order`, `status`
  - `icon`, `badges[]`, `highlights[]`
  - `media[]`
  - `ctas[]`

### `siteSettings`
- Model: `SiteSettingModel`
- Purpose: brand settings, contact details, footer/header config, SEO, social links
- Primary keys/indexes:
  - `key`
- Main fields:
  - `key`, `brandName`, `tagline`
  - `logoUrl`, `faviconUrl`
  - `primaryColor`, `accentColor`
  - `contactEmail`, `contactPhone`, `whatsappNumber`
  - `addressLine1`, `city`, `mapEmbedUrl`
  - `businessHours[]`
  - `socialLinks[]`
  - `seoTitle`, `seoDescription`
  - `maintenanceMode`
  - `settings{}`

## Reporting & Internal Controls

### `analyticsSnapshots`
- Model: `AnalyticsSnapshotModel`
- Purpose: cached analytics, dashboards, branch performance snapshots
- Primary keys/indexes:
  - `id`
  - `dateKey`
  - `branchId`
- Main fields:
  - `id`, `dateKey`, `branchId`
  - `totalOrders`, `totalRevenue`, `totalCustomers`
  - `topItems[]`
  - `channelBreakdown{}`
  - `sourceBreakdown{}`

### `auditLogs`
- Model: `AuditLogModel`
- Purpose: admin action history, security trail, CRUD tracing
- Primary keys/indexes:
  - `id`
  - `actorId`
  - `actorEmail`
  - `action`
  - `entityType`
  - `entityId`
  - `createdAt`
- Main fields:
  - `id`, `actorId`, `actorEmail`, `actorRole`
  - `action`, `entityType`, `entityId`
  - `details{}`
  - `createdAt`

## Current Route-to-Collection Mapping

- `/api/menu` -> `menu`
- `/api/inventory` -> `inventory`
- `/api/orders` -> `orders` + `finance` + `customers`
- `/api/hr` -> `staff`
- `/api/finance` -> `finance`
- `/api/customer` -> `customers` + `orders`
- `/api/assistant` -> `assistantConversations` + `menu` + `orders`
- `/api/whatsapp` -> `assistantConversations`

## Recommended Fetch Strategy

- Customer profile page:
  - fetch `customers` by `email`
  - fetch `orders` by `customerEmail`
- Admin dashboard:
  - fetch collection-specific lists with indexed fields and sort by `createdAt`, `time`, or `date`
- Menu availability:
  - fetch `menu`
  - cross-check `inventoryUsage` against `inventory`
- Booking and contact:
  - keep `status` indexed for inbox-style filtering
- Reviews and promotions:
  - fetch only `Approved`/`Active`

## Notes

- The active code path already uses Mongo-backed models for menu, inventory, orders, staff, finance, customers, and assistant conversations when `MONGODB_URI` is configured.
- The rest of the schemas are added to make the project future-safe and consistent with the current pages/components, even if some routes are not wired yet.
