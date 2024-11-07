const express = require("express");
const connectDB = require("./config/db");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(morgan("dev")); // Log incoming requests (development mode)
app.use(express.json()); // For parsing JSON

// Routes
app.use("/api/users", require("./routes/userRoutes"));

// Auth Routes
app.use("/api/auth", require("./routes/authRoutes"));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
