// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

// middleware
app.use(express.json());
app.use(cors({
  origin: FRONTEND_URL,// frontend URL (Vite default)
  credentials: true
}));


// routes
const authRoutes = require('./routes/auth');
const donationsRoutes = require('./routes/donations');
const ngosRoutes = require('./routes/ngos');
const orphanagesRoutes = require('./routes/orphanages');

app.use('/api/auth', authRoutes);
app.use('/api', donationsRoutes);
app.use('/api', ngosRoutes);
app.use('/api', orphanagesRoutes);

// health
app.get('/api/health', (req, res) => res.json({ success: true, data: { now: new Date().toISOString() }, message: 'OK' }));

// error handling fallback
app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ success: false, error: 'Server error', status: 500 });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
