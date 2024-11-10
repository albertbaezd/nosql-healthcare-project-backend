// routes/video.js
const express = require("express");
const router = express.Router();
const Video = require("../models/video");

// Create a new video
router.post("/", async (req, res) => {
  const { title, description, thumbnail, area, videoId } = req.body;

  const video = new Video({
    title,
    description,
    thumbnail,
    area,
    videoId,
  });

  try {
    const savedVideo = await video.save();
    res.status(201).json(savedVideo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all videos
// Get all videos with pagination and sorting
router.get("/", async (req, res) => {
  const { limit, page, sortOrder, sortBy } = req.query; // Get limit, page, sortOrder, and sortBy from query params

  // Determine the sort direction: default to descending (-1) if sortOrder is not 'asc'
  const sortDirection = sortOrder === "asc" ? 1 : -1;

  // Default field to sort by if none is provided
  const sortField = sortBy || "createdAt"; // Sort by createdAt if no sortBy field is specified

  // Initialize query options
  const queryOptions = {
    sort: { [sortField]: sortDirection }, // Sorting by the specified field
  };

  // Apply pagination if limit and page are provided
  if (limit) {
    queryOptions.limit = parseInt(limit); // Apply limit if provided
  }

  if (page) {
    queryOptions.skip = (parseInt(page) - 1) * parseInt(limit); // Apply skip for pagination if page is provided
  }

  try {
    // Count the total number of videos
    const totalVideos = await Video.countDocuments(); // Get the total count of videos

    // Find videos with the applied query options (pagination, sorting)
    const videos = await Video.find({}, null, queryOptions).populate("area");

    // Calculate total pages
    const totalPages = limit ? Math.ceil(totalVideos / parseInt(limit)) : 1;

    // Response object with pagination and video data
    res.json({
      page: parseInt(page) || 1,
      limitOrTotal: limit ? parseInt(limit) : totalVideos, // If limit is provided, return it, else return total count of videos
      totalPages: totalPages,
      totalVideos: totalVideos,
      videos: videos, // Array of videos
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific video by ID
router.get("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate("area");
    if (!video) return res.status(404).json({ message: "Video not found" });
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a video by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedVideo)
      return res.status(404).json({ message: "Video not found" });
    res.json(updatedVideo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a video by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedVideo = await Video.findByIdAndDelete(req.params.id);
    if (!deletedVideo)
      return res.status(404).json({ message: "Video not found" });
    res.json({ message: "Video deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// // Get all videos by area
// router.get("/area/:areaId", async (req, res) => {
//   const { areaId } = req.params;

//   try {
//     const videos = await Video.find({ area: areaId }).populate("area");
//     res.json(videos);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// Get all videos by area with sorting and limit
router.get("/area/:areaId", async (req, res) => {
  const { areaId } = req.params;
  const { limit, page, sortOrder } = req.query; // Get limit, page, and sortOrder from query params

  // Determine the sort direction: default to descending (-1) if sortOrder is not 'asc'
  const sortDirection = sortOrder === "asc" ? 1 : -1;

  // Initialize query options
  const queryOptions = {
    sort: { createdAt: sortDirection }, // Sorting by createdAt based on sortOrder
    populate: "area", // Populate the area field
  };

  // Apply pagination if limit and page are provided
  if (limit) {
    queryOptions.limit = parseInt(limit); // Apply limit if provided
  }

  if (page) {
    queryOptions.skip = (parseInt(page) - 1) * parseInt(limit); // Apply skip for pagination if page is provided
  }

  try {
    // Find videos for the specified area, applying pagination, sorting, and populating
    const videos = await Video.find({ area: areaId }, null, queryOptions);

    // Return the videos
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all videos by area
router.get('/area/:areaId', async (req, res) => {
    const { areaId } = req.params;
  
    try {
      const videos = await Video.find({ area: areaId }).populate('area');
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all videos by area with sorting and limit
router.get('/area/:areaId', async (req, res) => {
    const { areaId } = req.params;
    const { limit } = req.query; // Get limit from query params, if provided
  
    try {
      const videos = await Video.find({ area: areaId })
        .sort({ createdAt: -1 }) // Sort by createdAt in descending order
        .limit(parseInt(limit) || 10) // Limit results; default to 10 if limit is not specified
        .populate('area');
  
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

module.exports = router;
