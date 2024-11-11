// routes/posts.js
const express = require("express");
const router = express.Router();
const Post = require("../models/post");

// Create a new post
router.post("/", async (req, res) => {
  const { image, area, title, description, body, createdAt, authorId } =
    req.body;
  const post = new Post({
    image,
    area,
    title,
    description,
    body,
    createdAt,
    authorId,
  });
  try {
    const savedPost = await post.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all posts with support for pagination and limit

/*
/api/posts → returns all posts.
/api/posts?limit=10 → returns the first 10 posts.
/api/posts?page=2 → returns all posts (ignores page since no limit is specified).
/api/posts?page=2&limit=10 → returns page 2 with 10 posts per page.
*/
router.get("/", async (req, res) => {
  try {
    // Parse page and limit from query, if they exist
    const page = req.query.page ? parseInt(req.query.page) : 1; // Default to page 1 if not specified
    const limit = req.query.limit ? parseInt(req.query.limit) : 0; // Default to 0, meaning no limit

    let posts;
    if (limit === 0) {
      // If limit is 0 (or not specified), fetch all posts
      posts = await Post.find();
    } else {
      // Calculate the number of documents to skip
      const skip = (page - 1) * limit;

      // Apply pagination with specified limit and page
      posts = await Post.find().limit(limit).skip(skip);
    }

    const totalPosts = await Post.countDocuments();
    const totalPages = limit ? Math.ceil(totalPosts / limit) : 1;

    res.json({
      page,
      limitOrTotal: limit || totalPosts, // Shows totalPosts as limit if no limit is applied
      totalPages,
      totalPosts,
      posts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific post by ID
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a post by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedPost)
      return res.status(404).json({ message: "Post not found" });
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a post by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost)
      return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get the latest 5 posts sorted by postDate in descending order
router.get("/latest", async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ postDate: -1 }) // Sort by the `postDate` field in descending order
      .limit(5); // Limit to 5 posts

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
