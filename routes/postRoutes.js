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

// Get latest posts
router.get("/latest", async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 6;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const skip = (page - 1) * limit;

    // Count posts with valid authors
    const totalPosts = await Post.countDocuments({
      authorId: { $ne: null }, // Ensure authorId is not null
    });

    // Fetch posts with valid authors
    const posts = await Post.find({ authorId: { $ne: null } }) // Filter out null authorId
      .sort({ postDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "authorId",
        select: "name _id profilePictureUrl",
        match: { name: { $exists: true } }, // Filter only authors with a name
      });

    // Filter out posts where the authorId was not populated
    const filteredPosts = posts.filter((post) => post.authorId);

    const totalPages = Math.ceil(totalPosts / limit);

    const formattedPosts = filteredPosts.map((post) => {
      const { authorId, ...postWithoutAuthorId } = post.toObject();
      return {
        ...postWithoutAuthorId,
        author: {
          name: authorId.name,
          id: authorId._id,
          profilePicture: authorId.profilePictureUrl,
        },
      };
    });

    res.json({
      page,
      limit,
      totalPages,
      totalPosts,
      posts: formattedPosts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Get the most popular posts (this should be defined before the dynamic route)
router.get("/mostpopular", async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;

    const posts = await Post.find({});

    // Sort posts by the number of comments in descending order
    posts.sort((a, b) => b.comments.length - a.comments.length);

    // Apply limit
    const limitedPosts = limit ? posts.slice(0, limit) : posts;

    // Return the posts (either limited or all)
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

// Get area by ID
// Get pagination parameters from the query string, defaulting to page 1 and limit 10
// Default to page 1 if not provided
// Skip logic, default to 10 posts if limit is not specified

router.get("/area/:areaid", async (req, res) => {
  try {
    const areaid = req.params.areaid;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * (limit || 10);

    let query = Post.find({ areaId: areaid });

    if (limit) {
      query = query.skip(skip).limit(limit);
    }

    // Find posts for the healthcare area and populate the authorId field
    const posts = await query.populate(
      "authorId",
      "name _id profilePictureUrl"
    );

    if (posts.length === 0) {
      return res
        .status(404)
        .json({ message: "No posts found for this healthcare area" });
    }

    // If limit is provided, calculate total posts and total pages
    if (limit) {
      const totalPosts = await Post.countDocuments({ areaId: areaid });
      const totalPages = Math.ceil(totalPosts / limit);

      // Format the posts to include author data
      const formattedPosts = posts.map((post) => {
        const { authorId, ...postWithoutAuthorId } = post.toObject(); // Remove authorId
        return {
          ...postWithoutAuthorId,
          author: authorId
            ? {
                name: authorId.name || "Unknown", // Default value if name is not available
                id: authorId._id,
                profilePicture: authorId.profilePictureUrl || "", // Default empty string if profilePicture is missing
              }
            : { name: "Unknown", id: null, profilePicture: "" }, // Default values if authorId is null
        };
      });

      return res.status(200).json({
        page,
        limit,
        totalPosts,
        totalPages,
        posts: formattedPosts,
      });
    }

    // Returning all posts as an else and formatting them similarly
    const formattedPosts = posts.map((post) => {
      const { authorId, ...postWithoutAuthorId } = post.toObject();
      return {
        ...postWithoutAuthorId,
        author: authorId
          ? {
              name: authorId.name || "Unknown",
              id: authorId._id,
              profilePicture: authorId.profilePictureUrl || "",
            }
          : { name: "Unknown", id: null, profilePicture: "" },
      };
    });

    res.status(200).json(formattedPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get most popular posts by healthcare area ID
// Test 1 get most popoular posts by healthcare area ID

router.get("/area/:areaid/mostpopular", async (req, res) => {
  try {
    const areaid = req.params.areaid;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Use aggregation to get posts by areaId and sort by comments length
    const posts = await Post.aggregate([
      { $match: { areaId: new mongoose.Types.ObjectId(areaid) } },
      { $addFields: { commentCount: { $size: "$comments" } } }, // Add a field for the length of the comments array
      { $sort: { commentCount: -1 } }, // Sort by commentCount in descending order
      { $skip: skip },
      { $limit: limit },
    ]);

    if (posts.length === 0) {
      return res
        .status(404)
        .json({ message: "No posts found for this healthcare area" });
    }

    // Populate the authorId field with name, _id, and profilePictureUrl
    const populatedPosts = await Post.populate(posts, {
      path: "authorId",
      select: "name _id profilePictureUrl",
    });

    // Filter out posts without an author
    const postsWithAuthors = populatedPosts.filter(
      (post) => post.authorId !== null
    );

    if (postsWithAuthors.length === 0) {
      return res.status(404).json({ message: "No posts found with authors" });
    }

    // Format the posts to include the author object
    const formattedPosts = postsWithAuthors.map((post) => {
      const { authorId, ...postWithoutAuthorId } = post; // Directly access properties since it's no longer a Mongoose document
      return {
        ...postWithoutAuthorId,
        author: {
          name: authorId.name,
          id: authorId._id,
          profilePicture: authorId.profilePictureUrl,
        },
      };
    });

    const totalPosts = await Post.countDocuments({ areaId: areaid });
    const totalPages = Math.ceil(totalPosts / limit);

    return res.status(200).json({
      page,
      limit,
      totalPosts,
      totalPages,
      posts: formattedPosts,
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
        path: "comments", // Comment details
      })
      .populate({
        path: "authorId", // User details
        select: "name profilePictureUrl role",
        model: "User",
      })
      .exec();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Replacing 'authorId' with 'author' for the frontend
    const postWithAuthor = {
      ...post.toObject(),
      author: {
        id: post.authorId._id,
        name: post.authorId.name,
        profilePictureUrl: post.authorId.profilePictureUrl || null,
        role: post.authorId.role,
      },
      comments: post.comments.map((comment) => ({
        _id: comment._id,
        body: comment.body,
        postId: comment.postId,
        createdAt: comment.createdAt,
        author: {
          id: comment.authorId,
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
