# Assignment 1 - Collection Relationship Diagram

## Diagram Note

This project mostly uses **logical references** such as `staffId`, `branchId`, `orderId`, `customerEmail`, and `customerProfileId` instead of Mongoose `ref` properties. The arrows below therefore show how collections relate in practice inside the application.

```mermaid
graph TD
    STAFF[staff]
    ATTENDANCE[attendance]
    LEAVES[leaveRequests]
    PAYROLL[payroll]
    SHIFTS[shiftSchedules]
    REVIEWS_PERF[performanceReviews]

    CUSTOMERS[customers]
    ORDERS[orders]
    USERS[userAccounts]
    SESSIONS[authSessions]

    MENU[menu]
    INVENTORY[inventory]
    FINANCE[finance]
    BOOKINGS[bookings]
    CONTACT[contactMessages]
    CHAT[assistantConversations]

    BRANCHES[branches]
    REVIEWS[reviews]
    PROMOTIONS[promotions]
    NOTIFICATIONS[notifications]
    SUPPORT[supportTickets]
    ANALYTICS[analyticsSnapshots]

    STAFF -->|id -> staffId| ATTENDANCE
    STAFF -->|id -> staffId| LEAVES
    STAFF -->|id -> staffId| PAYROLL
    STAFF -->|id -> staffId| SHIFTS
    STAFF -->|id -> staffId| REVIEWS_PERF

    CUSTOMERS -->|email -> customerEmail| ORDERS
    USERS -->|customerProfileId -> id| CUSTOMERS
    USERS -->|id -> userId| SESSIONS

    MENU -->|id -> details[].menuItemId| ORDERS
    INVENTORY -->|used by inventoryUsage| MENU
    ORDERS -->|creates income records| FINANCE

    BRANCHES -->|id -> branchId| ORDERS
    BRANCHES -->|id -> branchId| BOOKINGS
    BRANCHES -->|id -> branchId| REVIEWS
    BRANCHES -->|id -> branchId| NOTIFICATIONS
    BRANCHES -->|id -> branchId| ANALYTICS
    BRANCHES -->|id in branchIds[]| PROMOTIONS

    ORDERS -->|id -> orderId| REVIEWS
    ORDERS -->|id -> orderId| SUPPORT
    MENU -->|id in appliesToMenuIds[]| PROMOTIONS

    CUSTOMERS -->|support / booking / contact ownership by customer data| BOOKINGS
    CUSTOMERS -->|support / contact identity fields| CONTACT
    CUSTOMERS -->|conversation owner fields| CHAT
```

## Quick Reading Guide

- HR collections are centered around `staff`.
- Commerce collections are centered around `orders`, `customers`, and `menu`.
- Branch-aware collections connect back to `branches` through `branchId`.
- Auth collections connect `userAccounts` to `authSessions` and optionally to `customers`.
