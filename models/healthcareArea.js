// models/HealthcareArea.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const healthcareAreaSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  bannerImage: String,   // URL of the banner image
  videos: [String],      // Array of video URLs
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }], // Array of related Post IDs
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HealthcareArea', healthcareAreaSchema);
