// routes/contactMessages.js
const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/contactmessage');

// Create a new contact message
router.post('/', async (req, res) => {
  const { userId, username, useremail, message } = req.body;

  const contactMessage = new ContactMessage({
    userId,
    username,
    useremail,
    message
  });

  try {
    const savedMessage = await contactMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all contact messages
router.get('/', async (req, res) => {
  try {
    const messages = await ContactMessage.find();  // Retrieve all messages
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all contact messages by userId
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const messages = await ContactMessage.find({ userId });  // Filter messages by userId
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get a specific contact message by its ID
router.get('/:commentId', async (req, res) => {
    const { commentId } = req.params;
  
    try {
      const message = await ContactMessage.findById(commentId);  // Find message by its _id
      if (!message) {
        return res.status(404).json({ message: 'Contact message not found' });
      }
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

module.exports = router;
