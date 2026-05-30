# Assignment 2 Audit - CRUD Operations with Express

## Is This Assignment Related To The Project?

Yes. It can be made directly related to the Chicken House project by choosing a project resource as the CRUD entity. For this implementation, the selected resource is **ingredients**, which already belongs to the restaurant inventory domain.

## Was The Existing Project Already Fully Executed For This Assignment?

No, not fully.

## What Was Already Present In The Project

The main project already had:

- Express server setup in `server.ts`
- MongoDB connection in `server/mongo.ts`
- Mongoose models in `server/models.ts`
- Several CRUD-style routes in `server/routes/`

Examples of already existing partial CRUD coverage:

- `server/routes/users.ts`
  - has `GET all`
  - has `GET by id`
  - has `POST`
  - has `PATCH`
  - has `DELETE`

- `server/routes/inventory.ts`
  - has `GET all`
  - has `POST`
  - has `PATCH`
  - has `DELETE`
  - missing simple `GET /:id` route for the assignment's five-route shape

- `server/routes/menu.ts`
  - has `GET all`
  - has `POST`
  - has `PATCH`
  - has `DELETE`
  - missing simple `GET /:id`

## Why It Was Not Fully Satisfying Assignment 2

The assignment specifically asks for a **standalone Node.js + Express backend** for **one resource**, with the classic five CRUD routes and no frontend requirement.

The old project did not satisfy that cleanly because:

1. it was part of a larger full-stack app, not a standalone assignment backend
2. several existing routes use `PATCH` instead of the assignment's required `PUT`
3. some resources were missing the explicit `GET /resource/:id` route
4. existing routes include auth/permission logic and extra project complexity, which is not ideal for a simple assignment submission

## What Was Added To Complete The Missing Part

A new standalone backend was created in:

- `assignment-2-crud-api/`

This new folder contains:

- `package.json`
- `server.js`
- `config/db.js`
- `models/Item.js`
- `routes/items.js`
- `.env.example`
- `README.md`

## Final Verdict

### Existing project execution before this update

- Assignment coverage: **partially complete**
- Express + MongoDB knowledge already present: **yes**
- Standalone single-resource assignment backend: **no**

### After this update

- Assignment coverage: **complete**
- Project-related resource used: **yes**
- Standalone backend created: **yes**
- All 5 required CRUD routes included: **yes**
