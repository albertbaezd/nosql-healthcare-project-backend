// models/ContactMessage.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactMessageSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },  // Reference to the User model
  username: { type: String, required: true },
  useremail: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }  // Automatically sets the date to current date and time
});

module.exports = mongoose.model('contactmessage', contactMessageSchema);
