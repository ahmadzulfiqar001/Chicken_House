const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const loadEnv = () => {
  const candidates = [
    path.join(__dirname, "..", ".env"),
    path.join(__dirname, "..", "..", ".env"),
    path.join(__dirname, "..", "..", ".env.local"),
    path.join(__dirname, "..", "..", "..", ".env"),
    path.join(__dirname, "..", "..", "..", ".env.local"),
  ];

  candidates.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      dotenv.config({ path: filePath, override: false });
    }
  });
};

const connectToMongo = async () => {
  loadEnv();

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Add it to assignment-2-crud-api/.env or the parent .env file.");
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`Assignment 2 API connected to MongoDB database: ${mongoose.connection.name}`);
};

module.exports = { connectToMongo };
