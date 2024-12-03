const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        // Regular expression to validate email format
        return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
      },
      message: "Please enter a valid email address",
    },
  },
  password: {
    type: String,
    required: true,
    minlength: [8, "Password must be between 8 characters long"],
  },
  role: {
    type: String,
    enum: ["admin", "doctor", "individual"],
    default: "individual",
  },
  createdAt: { type: Date, default: Date.now },
  profilePictureUrl: { type: String },
  city: { type: String },
  state: { type: String },
  description: { type: String },
  university: { type: String },
  speciality: { type: String }, // for doctors only
});

module.exports = mongoose.model("User", userSchema);
