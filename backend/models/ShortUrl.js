const mongoose = require('mongoose');

const ShortUrlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
    trim: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  customAlias: {
    type: String,
    unique: true,
    sparse: true, // Allows null/empty values without violating unique constraints
    trim: true
  },
  title: {
    type: String,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clickCount: {
    type: Number,
    default: 0
  },
  expiryDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ShortUrl', ShortUrlSchema);
