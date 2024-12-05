// routes/posts.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Post = require("../models/post");
const isAuth = require("../middleware/isAuth");

// Create a new post
router.post("/", isAuth, async (req, res) => {
  const { image, area, title, description, body, authorId, areaId } = req.body;

  // Set createdAt to the current date and time
  const createdAt = new Date();

  const post = new Post({
    image,
    area,
    areaId,
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

// Update a post by ID
router.put("/:id", isAuth, async (req, res) => {
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
router.delete("/:id", isAuth, async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost)
      return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/latest", async (req, res) => {
  try {
    // Get the limit and page from the query, or use defaults
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const page = req.query.page ? parseInt(req.query.page) : 1;

    // Calculate the skip value based on the page and limit
    const skip = (page - 1) * limit;

    // Fetch the total number of posts
    const totalPosts = await Post.countDocuments();

    // Fetch the posts for the current page, sorted by `postDate`
    const posts = await Post.find()
      .sort({ postDate: -1 })
      .skip(skip) // Skip posts based on the current page
      .limit(limit); // Limit the number of posts fetched

    // Calculate total pages
    const totalPages = Math.ceil(totalPosts / limit);

    // Send the response with the desired format
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

// Get the most popular posts (this should be defined before the dynamic route)
router.get("/mostpopular", async (req, res) => {
  try {
    // Get the limit from the query, or use undefined if not provided
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;

    // Fetch all posts from the database
    const posts = await Post.find({});

    // Sort posts by the length of the comments array (descending order)
    posts.sort((a, b) => b.comments.length - a.comments.length);

    // If a limit is provided, slice the posts to that limit
    const limitedPosts = limit ? posts.slice(0, limit) : posts;

    // Return the posts (with or without the limit)
    res.status(200).json(limitedPosts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching posts", error: error.message });
  }
});

// Get a specific post by ID (this should be defined after the specific routes)
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get posts by healthcareareaid
// router.get("/area/:areaid", async (req, res) => {
//   try {
//     const areaid = req.params.areaid;

//     // Find posts where areaId matches the given healthcareAreaId
//     const posts = await Post.find({ areaId: areaid });

//     if (posts.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No posts found for this healthcare area" });
//     }

//     res.status(200).json(posts);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// Get area by ID
router.get("/area/:areaid", async (req, res) => {
  try {
    const areaid = req.params.areaid;

    // Get pagination parameters from the query string, defaulting to page 1 and limit 10
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit); // No default limit
    const skip = (page - 1) * (limit || 10); // Skip logic, default to 10 posts if limit is not specified

    // Query to find posts by areaId
    let query = Post.find({ areaId: areaid });

    // Apply pagination if a limit is provided
    if (limit) {
      query = query.skip(skip).limit(limit);
    }

    // Find posts for the healthcare area
    const posts = await query;

    if (posts.length === 0) {
      return res
        .status(404)
        .json({ message: "No posts found for this healthcare area" });
    }

    // If limit is provided, calculate total posts and total pages
    if (limit) {
      const totalPosts = await Post.countDocuments({ areaId: areaid });
      const totalPages = Math.ceil(totalPosts / limit);

      return res.status(200).json({
        page,
        limit,
        totalPosts,
        totalPages,
        posts,
      });
    }

    // If no limit is specified, just return all posts
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get most popular posts by healthcare area ID
router.get("/area/:areaid/mostpopular", async (req, res) => {
  try {
    const areaid = req.params.areaid;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Use aggregation to get posts by areaId and sort by comments length
    const posts = await Post.aggregate([
      { $match: { areaId: new mongoose.Types.ObjectId(areaid) } }, // Use 'new' with ObjectId
      { $addFields: { commentCount: { $size: "$comments" } } }, // Add a field for the length of the comments array
      { $sort: { commentCount: -1 } }, // Sort by commentCount in descending order
      { $skip: skip }, // Skip documents for pagination
      { $limit: limit }, // Limit documents for pagination
    ]);

    if (posts.length === 0) {
      return res
        .status(404)
        .json({ message: "No posts found for this healthcare area" });
    }

    const totalPosts = await Post.countDocuments({ areaId: areaid });
    const totalPages = Math.ceil(totalPosts / limit);

    return res.status(200).json({
      page,
      limit,
      totalPosts,
      totalPages,
      posts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET post by ID with full comments and author details
router.get("/full/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate({
        path: "comments", // Populate the comments array with full comment details
      })
      .populate({
        path: "authorId", // Populate the post's authorId field with user details
        select: "name profilePictureUrl role", // Include name, profilePictureUrl, and role
        model: "User", // Referencing the User model
      })
      .exec();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Restructure the response to replace 'authorId' with 'author'
    const postWithAuthor = {
      ...post.toObject(),
      author: {
        id: post.authorId._id,
        name: post.authorId.name,
        profilePictureUrl: post.authorId.profilePictureUrl || null, // Ensure profilePictureUrl is included
        role: post.authorId.role,
      },
      comments: post.comments.map((comment) => ({
        _id: comment._id,
        body: comment.body,
        postId: comment.postId,
        createdAt: comment.createdAt,
        author: {
          id: comment.authorId, // Use the authorId directly (no need to populate this from User)
          authorName: comment.authorName, // Include the authorName field directly from the comment
        },
      })),
    };

    // Remove the original authorId from the response
    delete postWithAuthor.authorId;

    res.json(postWithAuthor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET post by ID with full comments and author details
router.get("/full/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate({
        path: "comments", // Populate the comments array with full comment details
      })
      .populate({
        path: "authorId", // Populate the authorId field with user details
        select: "name profilePictureUrl role", // Include name, profilePictureUrl, and role
        model: "User", // Referencing the User model
      })
      .exec();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Restructure the response to replace 'authorId' with 'author'
    const postWithAuthor = {
      ...post.toObject(),
      author: {
        id: post.authorId._id,
        name: post.authorId.name,
        profilePictureUrl: post.authorId.profilePictureUrl || null, // Ensure profilePictureUrl is included
        role: post.authorId.role,
      },
    };

    // Remove the original authorId from the response
    delete postWithAuthor.authorId;

    res.json(postWithAuthor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
