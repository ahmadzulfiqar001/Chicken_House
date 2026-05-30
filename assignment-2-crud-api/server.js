const express = require("express");
const { connectToMongo } = require("./config/db");
const itemRoutes = require("./routes/items");

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(express.json());

app.get("/", (_req, res) => {
  return res.status(200).json({
    message: "Assignment 2 standalone CRUD API is running",
    resource: "ingredients",
    routes: [
      "GET /items",
      "GET /items/:id",
      "POST /items",
      "PUT /items/:id",
      "DELETE /items/:id"
    ]
  });
});

app.use("/items", itemRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
});

const startServer = async () => {
  try {
    await connectToMongo();
    app.listen(PORT, () => {
      console.log(`Assignment 2 CRUD API listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Could not start Assignment 2 API", error);
    process.exit(1);
  }
};

startServer();
