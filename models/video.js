// models/Video.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const videoSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  thumbnail: String,       // URL to the video's thumbnail image
  area: { type: Schema.Types.ObjectId, ref: 'HealthcareArea' },  // Reference to a healthcare area
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Video', videoSchema);
