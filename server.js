const express = require("express");
const connectDB = require("./config/db");
const morgan = require("morgan");
const cors = require("cors");

require("dotenv").config();

const app = express();

// Allow all origins (or you can specify only certain origins)
app.use(cors());

// Connect to MongoDB
connectDB();

// Middleware
app.use(morgan("dev")); // Log incoming requests (development mode)
app.use(express.json()); // For parsing JSON
app.use((req, res, next) => {
  const requestTime = new Date().toISOString();
  console.log(`[${requestTime}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/users", require("./routes/userRoutes"));

// Auth Routes
app.use("/api/auth", require("./routes/authRoutes"));

// Post Route

app.use("/api/posts", require("./routes/postRoutes"));

// Comment Route

app.use("/api/comments", require("./routes/commentsRoutes"));

// healthcareArea Route

app.use("/api/healthcareArea", require("./routes/healthcareAreaRoutes"));

// video Route

app.use("/api/video", require("./routes/videoRoutes"));

// contact message

app.use("/api/contactmessage", require("./routes/contactmessageRoutes"));

// Subscribe Route

app.use("/api/subscribe", require("./routes/subscriberRoutes"));


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
