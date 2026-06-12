const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ShortUrl = require('../models/ShortUrl');
const Visit = require('../models/Visit');

// @route   GET api/analytics/:id
// @desc    Get detailed analytics for a short URL
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const url = await ShortUrl.findById(req.params.id);

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Verify ownership
    if (url.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to access these analytics' });
    }

    // Fetch all visits for this URL
    const visits = await Visit.find({ shortUrl: url._id }).sort({ timestamp: -1 });

    // 1. Calculate general stats
    const totalClicks = url.clickCount;
    const lastVisited = visits.length > 0 ? visits[0].timestamp : null;

    // 2. Aggregate device, browser, and OS distributions
    const devices = { Desktop: 0, Mobile: 0, Tablet: 0, Unknown: 0 };
    const browsers = {};
    const oss = {};

    visits.forEach(v => {
      // Devices
      if (devices[v.device] !== undefined) {
        devices[v.device]++;
      } else {
        devices.Unknown++;
      }

      // Browsers
      browsers[v.browser] = (browsers[v.browser] || 0) + 1;

      // OS
      oss[v.os] = (oss[v.os] || 0) + 1;
    });

    // 3. Aggregate timeline (last 7 days)
    const timeline = [];
    const now = new Date();
    
    // Create map of last 7 days with 0 clicks
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      timeline.push({
        date: dateStr,
        displayDate: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        clicks: 0
      });
    }

    // Populate daily counts from visits
    visits.forEach(v => {
      const visitDateStr = new Date(v.timestamp).toISOString().split('T')[0];
      const match = timeline.find(t => t.date === visitDateStr);
      if (match) {
        match.clicks++;
      }
    });

    // 4. Retrieve recent visits list (limit to 20, obfuscate IP addresses for GDPR compliance)
    const recentVisits = visits.slice(0, 20).map(v => {
      let obfuscatedIp = 'Unknown';
      if (v.ipAddress) {
        if (v.ipAddress.includes('.')) {
          // IPv4: Obfuscate the last octet (e.g. 192.168.1.12 -> 192.168.1.xxx)
          const parts = v.ipAddress.split('.');
          if (parts.length === 4) {
            obfuscatedIp = `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
          } else {
            obfuscatedIp = v.ipAddress;
          }
        } else if (v.ipAddress.includes(':')) {
          // IPv6: Obfuscate the last blocks
          const parts = v.ipAddress.split(':');
          if (parts.length > 2) {
            obfuscatedIp = `${parts.slice(0, 3).join(':')}::xxxx`;
          } else {
            obfuscatedIp = v.ipAddress;
          }
        } else {
          obfuscatedIp = v.ipAddress;
        }
      }

      return {
        id: v._id,
        timestamp: v.timestamp,
        ipAddress: obfuscatedIp,
        device: v.device,
        browser: v.browser,
        os: v.os
      };
    });

    // Send complete response package
    res.json({
      urlInfo: {
        id: url._id,
        title: url.title,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        customAlias: url.customAlias,
        expiryDate: url.expiryDate,
        createdAt: url.createdAt
      },
      stats: {
        totalClicks,
        lastVisited,
        devices,
        browsers: Object.entries(browsers).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
        oss: Object.entries(oss).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
        timeline,
        recentVisits
      }
    });

  } catch (err) {
    console.error('Analytics retrieval error:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
