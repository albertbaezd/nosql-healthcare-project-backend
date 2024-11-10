// models/Post.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    { type: Schema.Types.ObjectId, ref: 'comment' }  // Array of Comment references
  ]
});

module.exports = mongoose.model('post', postSchema);
