const dns = require('dns');
// Set custom DNS resolvers to bypass local DNS resolution failures for MongoDB Atlas SRV/TXT records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  console.warn('Failed to set custom DNS servers:', dnsErr.message);
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();


const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://linktrackk.netlify.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => {
    console.error('MongoDB database connection error:', err.message);
    process.exit(1);
  });

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/urls', require('./routes/urls'));
app.use('/api/analytics', require('./routes/analytics'));

// Redirect Route (Must be registered last to avoid hijacking API paths)
app.use('/', require('./routes/redirect'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({ message: 'An unexpected internal server error occurred.' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`LinkTrack backend server is running on port ${PORT}`);
});
