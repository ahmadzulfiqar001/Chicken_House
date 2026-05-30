# Chicken House

Chicken House is a restaurant ERP and digital ordering platform with a React/Vite customer frontend and an Express API backend.

## Project Structure

```text
.
├── backend/
│   ├── server.ts                  # Express API + Vite middleware entrypoint
│   ├── src/                       # API routes, auth, data services, models, seed data
│   ├── docs/                      # Backend schema and assignment documentation
│   └── assignment-2-crud-api/     # Standalone Assignment 2 CRUD API
├── frontend/
│   ├── index.html
│   ├── vite.config.ts
│   ├── public/                    # Served static assets and menu library
│   ├── assets/source-images/      # Original menu/source images
│   └── src/                       # React pages, components, contexts, and shared libs
├── docs/                          # Project implementation and testing notes
├── package.json
└── tsconfig.json
```

## Run Locally

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`. API routes are served from `/api/*`; the frontend is served through Vite middleware in development.

## Useful Scripts

```bash
npm run lint
npm run build
npm run preview
npm run clean
```

## Environment

Copy `.env.example` to `.env` and set the values needed for your setup. `MONGODB_URI` is optional during local development because the backend can fall back to in-memory seed data.
