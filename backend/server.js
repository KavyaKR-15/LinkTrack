const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/linktrack')
  .then(() => console.log('MongoDB connected to local database successfully.'))
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
