const express = require('express');
const router = express.Router();
const ShortUrl = require('../models/ShortUrl');
const Visit = require('../models/Visit');
const parseUserAgent = require('../utils/uaParser');

router.get('/:code', async (req, res) => {
  const { code } = req.params;

  // Ignore calls for files (like favicon.ico) or api pathing safety
  if (code === 'favicon.ico') {
    return res.status(204).end();
  }

  try {
    // Lookup by shortCode OR customAlias
    const url = await ShortUrl.findOne({
      $or: [
        { shortCode: code },
        { customAlias: code }
      ]
    });

    if (!url) {
      return res.status(404).send(getErrorHtml('Link Not Found', 'The link you are trying to reach does not exist or has been deleted.'));
    }

    // Check expiration
    if (url.expiryDate && new Date(url.expiryDate) < new Date()) {
      return res.status(410).send(getErrorHtml('Link Expired', 'This link has expired and is no longer available.'));
    }

    // 1. Increment click count
    url.clickCount += 1;
    await url.save();

    // 2. Parse request environment and log visit (async, doesn't block redirection)
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    // Clean IP address
    const ipAddress = rawIp.split(',')[0].trim();
    const userAgent = req.headers['user-agent'] || '';
    
    const { device, browser, os } = parseUserAgent(userAgent);

    const visit = new Visit({
      shortUrl: url._id,
      ipAddress,
      userAgent,
      device,
      browser,
      os
    });

    // Save visit log in background
    visit.save().catch(err => {
      console.error('Failed to log visit analytics:', err.message);
    });

    // 3. Perform redirect
    res.redirect(302, url.originalUrl);

  } catch (err) {
    console.error('Redirection route error:', err.message);
    res.status(500).send(getErrorHtml('Server Error', 'An unexpected error occurred while resolving your link.'));
  }
});

function getErrorHtml(title, message) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>LinkTrack - ${title}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          background: linear-gradient(135deg, #090d16 0%, #111827 100%);
          color: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .container {
          background: rgba(31, 41, 55, 0.4);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 3rem 2rem;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          max-width: 440px;
          width: 90%;
        }
        .icon {
          font-size: 3.5rem;
          margin-bottom: 1.5rem;
          display: inline-block;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 1rem;
          border-radius: 50%;
          width: 70px;
          height: 70px;
          line-height: 70px;
        }
        h1 {
          font-size: 1.75rem;
          margin-top: 0;
          margin-bottom: 0.75rem;
          color: #f3f4f6;
          font-weight: 700;
        }
        p {
          font-size: 1rem;
          color: #9ca3af;
          line-height: 1.6;
          margin-bottom: 2rem;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #ffffff;
          text-decoration: none;
          padding: 0.75rem 1.75rem;
          border-radius: 8px;
          font-weight: 600;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
          transition: all 0.2s ease;
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">✕</div>
        <h1>${title}</h1>
        <p>${message}</p>
        <a href="http://localhost:5173" class="btn">Back to Dashboard</a>
      </div>
    </body>
    </html>
  `;
}

module.exports = router;
