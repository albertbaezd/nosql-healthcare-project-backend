// models/Comment.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  authorId: String,          // ID of the comment's author
  body: String,              // The main content of the comment
  createdAt: { type: Date, default: Date.now }  // The date the comment was created
});

module.exports = mongoose.model('Comment', commentSchema);
