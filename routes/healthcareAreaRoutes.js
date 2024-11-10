// routes/health_care_areas.js
const express = require('express');
const router = express.Router();
const HealthcareArea = require('../models/healthcareArea');
const Post = require('../models/post');

// Create a new healthcare area
router.post('/', async (req, res) => {
  const { name, description, bannerImage, videos, posts } = req.body;

  const healthcareArea = new HealthcareArea({
    name,
    description,
    bannerImage,
    videos,
    posts
  });

  try {
    const savedHealthcareArea = await healthcareArea.save();
    res.status(201).json(savedHealthcareArea);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all healthcare areas
router.get('/', async (req, res) => {
  try {
    const healthcareAreas = await HealthcareArea.find();  // Fetch all healthcare areas
    res.json(healthcareAreas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get healthcare area by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;  // Get the id from the URL parameter

  try {
    const healthcareArea = await HealthcareArea.findById(id);  // Fetch the healthcare area by id
    if (!healthcareArea) {
      return res.status(404).json({ message: 'Healthcare area not found' });  // Return 404 if not found
    }
    res.json(healthcareArea);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a healthcare area by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedHealthcareArea = await HealthcareArea.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedHealthcareArea) return res.status(404).json({ message: 'Healthcare area not found' });
    res.json(updatedHealthcareArea);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a healthcare area by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedHealthcareArea = await HealthcareArea.findByIdAndDelete(req.params.id);
    if (!deletedHealthcareArea) return res.status(404).json({ message: 'Healthcare area not found' });
    res.json({ message: 'Healthcare area deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
