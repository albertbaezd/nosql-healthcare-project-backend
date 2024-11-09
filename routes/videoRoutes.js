// routes/video.js
const express = require('express');
const router = express.Router();
const Video = require('../models/video');

// Create a new video
router.post('/', async (req, res) => {
  const { title, description, thumbnail, area } = req.body;

  const video = new Video({
    title,
    description,
    thumbnail,
    area
  });

  try {
    const savedVideo = await video.save();
    res.status(201).json(savedVideo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().populate('area');
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific video by ID
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate('area');
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a video by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedVideo) return res.status(404).json({ message: 'Video not found' });
    res.json(updatedVideo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a video by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedVideo = await Video.findByIdAndDelete(req.params.id);
    if (!deletedVideo) return res.status(404).json({ message: 'Video not found' });
    res.json({ message: 'Video deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
