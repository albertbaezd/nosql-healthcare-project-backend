const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Make sure the path matches your User model
const nodemailer = require("nodemailer");

require("dotenv").config();

// Create User
router.post("/register", async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    profilePictureUrl = "",
    city = "",
    state = "",
    country = "",
    description = "",
    university = "",
    speciality = "",
  } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "individual", // Default to "individual" if no role is provided
      createdAt: Date.now(),
      profilePictureUrl, // Already initialized to an empty string if not provided
      city,
      state,
      country,
      description,
      university,
      speciality,
    });
    await newUser.save();

    ///// MAIL SEND to Doctors

    // Send an email if the user is a doctor
    if (role === "doctor") {
      // Create a transporter using your email service (e.g., Gmail, SendGrid)
      const transporter = nodemailer.createTransport({
        service: "Gmail", // or any other email service you use
        auth: {
          user: process.env.EMAIL_USER, // Your email address
          pass: process.env.EMAIL_PASSWORD, // Your email password or app password
        },
      });

      // Define email options
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to SerenitySpace, Dr. " + name + "!",
        text: `Dear Dr. ${name},

            Thank you for joining SerenitySpace! We are thrilled to have you as part of our community. As a trusted professional in the healthcare industry, we value your contribution and are excited about the opportunity to collaborate with you.
            
            To help us verify the authenticity of your credentials and ensure a secure environment for all of our users, we kindly request that you complete the following verification process:
            
            [Google Form for Doctor Verification](https://forms.gle/rgJm12W45EsYcN6M6)
            
            Please fill out the form with accurate and up-to-date information. Our team will review your submission promptly and reach out to you with the next steps. This is an essential part of our efforts to maintain the highest standards of professionalism and trust within our platform.
            
            If you have any questions or encounter any issues, please feel free to contact us at any time. We’re here to support you and ensure you have the best experience with SerenitySpace.
            
            Thank you once again for being part of SerenitySpace. We look forward to seeing you on the platform and wish you all the best in your professional endeavors.
            
            Best regards,
            The SerenitySpace Team
            `,
      };

      // Send the email
      await transporter.sendMail(mailOptions);
    }

    ///// END

    ///// MAIL SEND to individual

    // Send an email if the user is a individual
    if (role === "individual") {
      // Create a transporter using your email service (e.g., Gmail, SendGrid)
      const transporter = nodemailer.createTransport({
        service: "Gmail", // or any other email service you use
        auth: {
          user: process.env.EMAIL_USER, // Your email address
          pass: process.env.EMAIL_PASSWORD, // Your email password or app password
        },
      });

      // Define email options
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to SerenitySpace, " + name + "!",
        text: `Dear ${name},

Thank you for joining SerenitySpace! We are excited to have you as part of our growing community. Whether you're here to find support, explore resources, or connect with others, we are confident that you'll find great value in what our platform offers.

To help us create the best possible experience for you, we invite you to complete your profile and explore all the features we provide. This will allow you to make the most of SerenitySpace and get the support you need.

Next Steps:
1. Log in to your account and complete your profile.
2. Start exploring the resources, forums, and services available to you.
3. Feel free to connect with others in the community!

If you have any questions or need assistance, our team is here to help. You can reach out to us anytime, and we'll be happy to assist you.

Thank you once again for joining SerenitySpace. We look forward to supporting you on your journey and helping you make the most of our platform.

Best regards,  
The SerenitySpace Team
`,
      };

      // Send the email
      await transporter.sendMail(mailOptions);
    }

    ///// END

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Convert the user document to an object and exclude the password
    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;

    res.status(201).json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Convert Mongoose document to plain object and exclude the password field
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.status(200).json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

module.exports = router;
