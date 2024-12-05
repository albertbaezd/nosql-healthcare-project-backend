const express = require("express");
const router = express.Router();
const Subscriber = require("../models/subscriber");
const nodemailer = require("nodemailer");
const isAuth = require("../middleware/isAuth");

// Route to get all subscribers
router.get("/", isAuth, async (req, res) => {
  try {
    const subscribers = await Subscriber.find(); // Fetch all subscribers from the database
    res.status(200).json(subscribers); // Return the list of subscribers
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve subscribers.",
      error: error.message,
    });
  }
});

// Create subscriber
router.post("/", isAuth, async (req, res) => {
  const { email } = req.body;
  try {
    // Check if email already exists
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ message: "You are already subscribed!" });
    }

    // Save email to the database
    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    // Send a thank-you email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "fordcheggacc@gmail.com",
        pass: "qcse zaps zqfp vpzu",
      },
    });

    const mailOptions = {
      from: "fordcheggacc@gmail.com",
      to: email,
      subject: "Thank You for Subscribing SerenitySpace Community!",
      html: `<p>Welcome to our community! Thank you for subscribing to our newsletter.</p>

        <p>We are excited to have you on board. As a valued member, you'll gain access to a wealth of resources designed to keep you informed and empowered in the medical field. Our community offers a wide range of insightful posts, expert articles, and educational videos created by experienced professionals.</p>

        <p>You can explore topics such as the latest medical advancements, health tips, case studies, and professional development insights. Our mission is to provide you with reliable, up-to-date information that supports your personal and professional growth.</p>

        <p>In addition, you will be receiving news and updates periodically, so you'll always stay informed about the latest developments and content available within our community.</p>

        <p>Stay connected, engage with our content, and become part of a network that values learning and collaboration. Together, we aim to create a vibrant environment where knowledge and expertise thrive.</p>

        <p>Thank you again for joining us. We look forward to sharing this journey with you!</p>

        <p>Best regards,<br>Serenity Space Team</p>

        <p><img src="cid:communityImage" alt="Community Logo" style="max-width: 200px; height: auto;" /></p>`, // Adjusted image size to make it smaller

      attachments: [
        {
          filename: "0LaCRPi.png",
          path: "C:/Users/Carlo/Documents/0LaCRPi.png", // Specify the path to your image
          cid: "communityImage", // Embed image inline using CID
        },
      ],
    };
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Thank you for subscribing!" });
  } catch (error) {
    res.status(500).json({ message: "Subscription failed.", error });
  }
});

// Route to delete a subscriber by ID
router.delete("/:id", isAuth, async (req, res) => {
  const { id } = req.params;

  try {
    // Find and delete the subscriber by ID
    const deletedSubscriber = await Subscriber.findByIdAndDelete(id);

    if (!deletedSubscriber) {
      return res.status(404).json({ message: "Subscriber not found!" });
    }

    res
      .status(200)
      .json({ message: "Subscriber deleted successfully!", deletedSubscriber });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete subscriber.", error: error.message });
  }
});

module.exports = router;
