# Assignment 2 Standalone CRUD API

This is a standalone **Node.js + Express + MongoDB** backend created specifically for Assignment 2.

## Why It Is Related To The Project

The chosen resource is `ingredients`, which belongs directly to the Chicken House restaurant project. That means the assignment stays project-related while still remaining a clean single-resource CRUD backend.

## Tech Used

- Node.js
- Express
- MongoDB
- Mongoose

## Resource Chosen

- Route name used for assignment: `/items`
- Actual MongoDB collection used: `ingredients`

## Run Instructions

1. Open terminal in `backend/assignment-2-crud-api`
2. Ensure `MONGODB_URI` is available in:
   - `backend/assignment-2-crud-api/.env`, or
   - parent project `.env`
3. Start the server:

```bash
npm start
```

For auto-reload style development:

```bash
npm run dev
```

## Required CRUD Routes

- `GET /items` -> fetch all records
- `GET /items/:id` -> fetch one record by MongoDB `_id`
- `POST /items` -> create a new record
- `PUT /items/:id` -> update a record
- `DELETE /items/:id` -> delete a record

## Sample JSON For POST / PUT

```json
{
  "name": "Mozzarella Cheese",
  "unit": "kg",
  "currentStock": 18,
  "reorderLevel": 5,
  "costPerUnit": 1450,
  "supplierName": "Punjab Dairy Point",
  "isActive": true
}
```

## Expected HTTP Status Codes

- `200` success for GET, PUT, DELETE
- `201` success for POST
- `404` record not found
- `500` server/database error
- `400` invalid input payload

## Postman / Thunder Client Evidence To Capture

Take screenshots for:

1. `GET /items`
2. `GET /items/:id`
3. `POST /items`
4. `PUT /items/:id`
5. `DELETE /items/:id`
6. one `404` not found case

## File Structure

- `backend/assignment-2-crud-api/server.js` -> main Express server
- `backend/assignment-2-crud-api/config/db.js` -> MongoDB connection
- `backend/assignment-2-crud-api/models/Item.js` -> Mongoose model
- `backend/assignment-2-crud-api/routes/items.js` -> all 5 CRUD routes
