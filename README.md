# Chicken House — Restaurant ERP & Digital Ordering Platform

Chicken House is a full-stack **MERN** application for a restaurant: a public customer
storefront (menu, ordering, table booking, live order tracking, AI chat) plus a
role-based back-office ERP (orders, menu, inventory, finance, HR, users) served from a
single Node process.

- **Frontend:** React 19 + Vite 6 + TypeScript + Tailwind CSS v4
- **Backend:** Express 4 + TypeScript (run with `tsx`)
- **Database:** MongoDB (Mongoose) with an in-memory fallback for local dev
- **Realtime:** Socket.IO + MongoDB change streams
- **AI assistant:** Groq LLM (restaurant-scoped) with a rule-based fallback
- **Messaging:** Meta WhatsApp Cloud webhook (rule-based auto-replies)

---

## Features

**Customer site**
- Menu browsing, search, item customization, cart and checkout (delivery / takeaway)
- Local payment methods — Cash on Delivery, **Easypaisa, JazzCash, Bank transfer** with
  admin/manager **payment verification** and **live status updates** on the tracking page
- Order tracking by Order ID, table/event booking, contact form
- Post-delivery **star rating + feedback** (stored as reviews)
- AI chat widget (Groq) scoped to Chicken House topics, with a WhatsApp deep-link button
- Cookie consent (accept / reject, re-openable from the footer)

**Back-office (`/admin`) — role-based**
- **Admin:** full access to every module
- **Manager:** operations workspace + order/booking/inventory management + payment verification
- **HR:** workforce only (staff, attendance, leave, payroll, shifts, performance)
- **Rider / Staff:** self-service workspace (attendance, shifts, tasks, leave)
- **Customer:** account area (profile, orders, wishlist, wallet)
- Admin creates all staff logins from **User Management** (staff never self-register;
  public sign-up creates customers only)

---

## Project structure

```text
.
├── backend/
│   ├── server.ts                 # Express + Socket.IO + Vite middleware entrypoint
│   └── src/
│       ├── core/                 # db, mongo, models, store (repository), permissions, realtime, catalog
│       └── modules/              # one folder per domain (auth, orders, menu, inventory,
│                                 #   finance, hr, customer, bookings, contact, assistant,
│                                 #   whatsapp, users, operations)
├── frontend/
│   ├── index.html  vite.config.ts
│   ├── public/                   # served assets + menu image library
│   ├── assets/source-images/     # original menu/source images
│   └── src/
│       ├── components/{layout,marketing,whatsapp,admin}/
│       ├── pages/  context/  lib/
│       └── main.tsx  App.tsx  index.css
├── package.json  tsconfig.json
```

---

## Prerequisites

- Node.js 20+ and npm
- A MongoDB connection string (MongoDB Atlas works out of the box). MongoDB is **optional
  for local dev** — without it the app falls back to seeded in-memory data.

## Run locally

```bash
npm install
npm run dev
```

The whole app (API + frontend) runs at **http://localhost:3000**. API routes are under
`/api/*`; in development the React app is served via Vite middleware, in production from
the built `frontend/dist`.

## Scripts

```bash
npm run dev      # start API + frontend (tsx backend/server.ts)
npm run build    # build the frontend to frontend/dist
npm run preview  # preview the production build
npm run lint     # type-check the whole project (tsc --noEmit)
npm run clean    # remove build output
```

---

## Environment

Create a `.env` file in the project root. `.env` is git-ignored — never commit secrets.

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | recommended | MongoDB connection string. If unset, the app uses in-memory seed data (dev only — not persistent). |
| `NODE_ENV` | prod | Set to `production` to serve the built SPA and enable secure cookies. |
| `GROQ_API_KEY` | optional | Enables the Groq-powered AI chat widget. Without it, the assistant uses the built-in rule-based engine. |
| `GROQ_MODEL` | optional | Groq model id (default `openai/gpt-oss-20b`). |
| `META_WA_ACCESS_TOKEN` | optional | Meta WhatsApp Cloud access token (WhatsApp bot). |
| `META_WA_PHONE_NUMBER_ID` | optional | WhatsApp Cloud phone number id. |
| `META_WA_VERIFY_TOKEN` | optional | Webhook verification token. |
| `META_WA_ADMIN_NUMBER` | optional | Admin WhatsApp number for conversation logging. |
| `META_WA_APP_SECRET` | optional | Meta app secret — enables `X-Hub-Signature-256` verification on the WhatsApp webhook. |
| `APP_ORIGIN` | prod | Comma-separated allowed origin(s) for the realtime Socket.IO CORS (e.g. `https://your-domain.com`). |

> **Local bank/wallet accounts** shown at checkout are configured in
> `frontend/src/lib/site.ts` (`bankAccounts`). Replace the placeholders with the real
> account details.

---

## Roles & demo accounts

When running in **in-memory mode** (no `MONGODB_URI`), demo accounts are seeded
automatically. With MongoDB, seed them once (or create accounts via the admin panel).

| Role | Email | Password |
|---|---|---|
| Admin | admin@chickenhouse.com | admin123 |
| Manager | zubair@chickenhouse.com | manager123 |
| HR | hr@chickenhouse.com | hr123 |
| Rider | bilal@chickenhouse.com | rider123 |
| Staff | ammar@chickenhouse.com | staff123 |
| Customer | farhan@chickenhouse.com | user123 |

> Demo credentials are for local/testing use — remove or rotate them before a real launch.

---

## Data & persistence

- All data persists in MongoDB. **Restarting the server does not reset or wipe the
  database** — seeding only fills empty collections and never overwrites existing data.
- Order prices are always re-computed server-side from the menu (clients can't set prices).
- Sensitive list endpoints (orders, contact messages, users, HR, finance, inventory) are
  permission-gated; the realtime socket broadcasts only non-sensitive change pings.

## Deployment notes

1. Set `NODE_ENV=production`, `MONGODB_URI`, and `APP_ORIGIN` (plus any WhatsApp/Groq keys).
2. `npm install && npm run build`
3. `node --import tsx backend/server.ts` (or `npm run dev` behind a process manager).
4. Put it behind HTTPS — secure session cookies require it in production.
