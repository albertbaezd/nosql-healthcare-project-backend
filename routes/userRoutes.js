const express = require("express");
const router = express.Router();
const User = require("../models/user");
const isAuth = require("../middleware/isAuth");

// Get All Users
router.get("/", isAuth, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get User By ID
router.get("/:id", isAuth, async (req, res) => {
  try {
    // Find user by ID
    const user = await User.findById(req.params.id);

    // If user not found, return 404 error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the user data (excluding password for security)
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      profilePictureUrl: user.profilePictureUrl,
      city: user.city,
      state: user.state,
      country: user.country,
      description: user.description,
      university: user.university,
      speciality: user.speciality,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: error.message });
  }
});

// Update User By ID
router.put("/:id", isAuth, async (req, res) => {
  const {
    name,
    email,
    role,
    profilePictureUrl,
    city,
    state,
    country,
    description,
    university,
    speciality,
  } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(req.params.id);

    // If user doesn't exist, return a 404 error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user fields if they are provided in the request
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (profilePictureUrl) user.profilePictureUrl = profilePictureUrl;
    if (city) user.city = city;
    if (state) user.state = state;
    if (country) user.country = country;
    if (description) user.description = description;
    if (university) user.university = university;
    if (speciality) user.speciality = speciality;

    // Save the updated user
    await user.save();

    // Respond with the updated user data
    res.json({
      id: user._id,
      createdAt: user.createdAt,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePictureUrl: user.profilePictureUrl,
      city: user.city,
      state: user.state,
      country: user.country,
      description: user.description,
      university: user.university,
      speciality: user.speciality,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
});

// Delete User by ID
router.delete("/:id", isAuth, async (req, res) => {
  try {
    // Find and delete the user by ID
    const user = await User.findByIdAndDelete(req.params.id);

    // If user not found, return a 404 error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return a success message after deleting the user
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
});

module.exports = router;
