const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  shortUrl: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShortUrl',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  device: {
    type: String,
    enum: ['Desktop', 'Mobile', 'Tablet', 'Unknown'],
    default: 'Unknown'
  },
  browser: {
    type: String,
    default: 'Unknown'
  },
  os: {
    type: String,
    default: 'Unknown'
  }
});

// Index visits by shortUrl and timestamp for efficient analytics queries
VisitSchema.index({ shortUrl: 1, timestamp: -1 });

module.exports = mongoose.model('Visit', VisitSchema);
