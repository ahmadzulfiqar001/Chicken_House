# Assignment 1 Audit - MongoDB Schema Design

## Verdict

The project is **not fully complete as an assignment submission**, but the **MongoDB/Mongoose implementation is largely complete**.

- Backend schema implementation: **complete**
- Human-readable assignment document: **partially complete before this audit**
- Relationship diagram: **missing before this audit**

## Coverage Summary

### Deliverable 1 - Mongoose model files from the project

Status: **100% complete**

Source files:

- `server/models.ts` - all top-level collections and embedded schemas
- `server/mongo.ts` - MongoDB connection, health helpers, and seed loading
- `server/db.ts` - seed data used to populate collections

### Deliverable 2 - Written schema overview document

Status before this update: **partially complete**

Existing file:

- `server/SCHEMA_BLUEPRINT.md`

What it already had:

- collection names
- collection purposes
- some route-to-collection mapping
- high-level field summaries

What it was missing for the assignment:

- every field for every collection
- field data types for every field
- clear required vs optional labeling
- a clean separation between active collections and schema-ready collections
- a final assignment-style structure explanation paragraph

### Deliverable 3 - Diagram showing collection relationships

Status before this update: **missing**

There was no dedicated diagram file in the repository before this assignment audit.

## What Is Already Executed In The Project

### Folder-level execution

- `server/` contains the MongoDB connection and all Mongoose schemas
- `server/routes/` contains feature routes that actively use many of the models
- `server/auth.ts` uses the authentication-related collections
- `server/chicken-house-assistant.ts` uses chatbot and order/menu data
- `server/menu-service.ts` uses menu and inventory collections

### Top-level collections defined in code

The project currently defines **28 MongoDB collections** in `server/models.ts`.

### Actively wired collections

These collections are not just defined; they are used by routes, services, or auth logic.

| Collection | Active in files |
| --- | --- |
| `inventory` | `server/menu-service.ts`, `server/routes/inventory.ts` |
| `vendorPurchases` | `server/routes/inventory.ts` |
| `menu` | `server/chicken-house-assistant.ts`, `server/menu-service.ts`, `server/routes/inventory.ts`, `server/routes/menu.ts` |
| `staff` | `server/routes/hr.ts`, `server/routes/leaves.ts`, `server/routes/performance.ts` |
| `attendance` | `server/routes/attendance.ts`, `server/routes/payroll.ts` |
| `leaveRequests` | `server/routes/leaves.ts` |
| `payroll` | `server/routes/payroll.ts` |
| `shiftSchedules` | `server/routes/shifts.ts` |
| `performanceReviews` | `server/routes/performance.ts` |
| `finance` | `server/routes/finance.ts`, `server/routes/orders.ts` |
| `orders` | `server/chicken-house-assistant.ts`, `server/routes/customer.ts`, `server/routes/finance.ts`, `server/routes/inventory.ts`, `server/routes/orders.ts` |
| `customers` | `server/auth.ts`, `server/routes/customer.ts`, `server/routes/orders.ts` |
| `assistantConversations` | `server/chicken-house-assistant.ts` |
| `userAccounts` | `server/auth.ts`, `server/routes/auth.ts`, `server/routes/users.ts` |
| `authSessions` | `server/auth.ts` |
| `bookings` | `server/routes/bookings.ts` |
| `contactMessages` | `server/routes/contact.ts` |
| `reviews` | `server/routes/performance.ts` |

Active collection count: **18 / 28**

### Schema-ready but not fully wired collections

These collections already have schema definitions, but they are not yet actively connected to routes/services beyond documentation or future planning.

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

Schema-ready collection count: **10 / 28**

## Missing Parts Identified

The project backend was already strong, but the assignment itself was incomplete in three specific ways:

1. There was no assignment-ready document listing **all fields, data types, and required/optional status** for every collection.
2. There was no dedicated **relationship diagram** file.
3. The repository did not clearly separate **active collections already used in features** from **planned collections already modeled for future use**.

## What Was Added To Complete The Missing Part

This audit is accompanied by two new assignment-ready files:

- `server/ASSIGNMENT_1_SCHEMA_OVERVIEW.md`
- `server/ASSIGNMENT_1_SCHEMA_DIAGRAM.md`

Together, these now complete the missing assignment artifacts without changing the runtime backend behavior.
