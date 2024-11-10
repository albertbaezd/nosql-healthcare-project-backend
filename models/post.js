// models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  image: String,
  area: String,
  title: String,
  description: String,
  body: String,
  createdAt: Date,
  authorId: String,
  postDate: { type: Date, default: Date.now },
  comments: [
    {
      user: String,
      comment: String,
      date: { type: Date, default: Date.now },
    }
  ]
});

module.exports = mongoose.model('Post', postSchema);
