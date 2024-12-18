// routes/comments.js
const express = require("express");
const router = express.Router();
const Comment = require("../models/comment");
const Post = require("../models/post");
const User = require("../models/user");
const isAuth = require("../middleware/isAuth");

// Create a new comment and associate it with a post
router.post("/", isAuth, async (req, res) => {
  const { authorId, body, postId } = req.body;

  try {
    // Fetch the author details using the authorId from the User collection
    const author = await User.findById(authorId).select("name");

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    // Create the comment and include the author's name
    const comment = new Comment({
      authorId,
      body,
      postId,
      authorName: author.name, // Save the author's name in the comment
    });

    // Save the comment to the database
    const savedComment = await comment.save();

    // Add the comment ID to the post's comments array
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: savedComment._id },
    });

    // Respond with the populated comment
    res.status(201).json(savedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all comments for a specific post
router.get("/:postId", async (req, res) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId).populate("comments");
    if (!post) return res.status(404).json({ message: "comment not found" });

    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific comment by ID
router.get("/comment/:commentId", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a comment by ID
router.put("/comment/:commentId", isAuth, async (req, res) => {
  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      { $set: req.body },
      { new: true }
    );
    if (!updatedComment)
      return res.status(404).json({ message: "Comment not found" });
    res.json(updatedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a comment by ID and remove it from the associated post
router.delete("/comment/:commentId", isAuth, async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment)
      return res.status(404).json({ message: "Comment not found" });

    // Remove the comment ID from the post's comments array
    await Post.findOneAndUpdate(
      { comments: commentId },
      { $pull: { comments: commentId } }
    );

    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all comments
router.get("/", async (req, res) => {
  try {
    const comments = await Comment.find(); // Fetch all comments
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
