const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const ShortUrl = require('../models/ShortUrl');

// Helper: base62 random code generator (length 6)
function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// @route   POST api/urls
// @desc    Create a shortened URL
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('originalUrl', 'Original URL is required').not().isEmpty(),
      check('title', 'Title must be less than 100 characters').optional().isLength({ max: 100 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { originalUrl, title, customAlias, expiryDate } = req.body;

    // Smart URL formatting: Auto-prepend protocol if missing
    let formattedUrl = originalUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'http://' + formattedUrl;
    }

    // Validate URL format
    try {
      new URL(formattedUrl);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid URL format' });
    }

    try {
      let shortCode = '';
      
      // Handle Custom Alias
      if (customAlias && customAlias.trim() !== '') {
        const aliasClean = customAlias.trim();
        // Regex validation: numbers and letters only
        if (!/^[a-zA-Z0-9_-]+$/.test(aliasClean)) {
          return res.status(400).json({ message: 'Custom alias can only contain alphanumeric characters, hyphens, and underscores' });
        }

        // Check availability
        const aliasExists = await ShortUrl.findOne({
          $or: [
            { shortCode: aliasClean },
            { customAlias: aliasClean }
          ]
        });
        if (aliasExists) {
          return res.status(400).json({ message: 'Custom alias or short code is already in use' });
        }
        shortCode = aliasClean;
      } else {
        // Generate unique random code
        let isUnique = false;
        let attempts = 0;
        while (!isUnique && attempts < 10) {
          const code = generateShortCode();
          const codeExists = await ShortUrl.findOne({
            $or: [
              { shortCode: code },
              { customAlias: code }
            ]
          });
          if (!codeExists) {
            shortCode = code;
            isUnique = true;
          }
          attempts++;
        }
        if (!isUnique) {
          return res.status(500).json({ message: 'Failed to generate a unique short code' });
        }
      }

      // Check Expiry Date
      let parsedExpiry = null;
      if (expiryDate) {
        parsedExpiry = new Date(expiryDate);
        if (isNaN(parsedExpiry.getTime())) {
          return res.status(400).json({ message: 'Invalid expiry date format' });
        }
        if (parsedExpiry < new Date()) {
          return res.status(400).json({ message: 'Expiry date must be in the future' });
        }
      }

      // Create model
      const newUrl = new ShortUrl({
        originalUrl: formattedUrl,
        shortCode,
        customAlias: (customAlias && customAlias.trim() !== '') ? customAlias.trim() : undefined,
        title: title ? title.trim() : (new URL(formattedUrl).hostname || 'Shortened URL'),
        user: req.user.id,
        expiryDate: parsedExpiry
      });

      const url = await newUrl.save();
      res.json(url);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/urls
// @desc    Get all URLs for logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const urls = await ShortUrl.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(urls);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/urls/:id
// @desc    Delete short URL
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const url = await ShortUrl.findById(req.params.id);

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Verify ownership
    if (url.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await ShortUrl.findByIdAndDelete(req.params.id);
    
    // Also delete any associated analytics visits in the background
    const Visit = require('../models/Visit');
    await Visit.deleteMany({ shortUrl: req.params.id });

    res.json({ message: 'URL and associated analytics deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
