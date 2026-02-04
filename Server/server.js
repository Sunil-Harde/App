const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db.js');

// --- 1. IMPORT ROUTES ---
const adminRoutes = require('./routes/adminRoutes'); 
const userRoutes = require('./routes/userRoutes'); 
const audioRoutes = require('./routes/audioRoutes'); 
const videoRoutes = require('./routes/videoRoutes'); // <--- Video Route
const categoryRoutes = require('./routes/categoryRoutes'); 
const uploadRoutes = require('./routes/uploadRoutes');
const journalRoutes = require('./routes/journalRoutes');
const goalRoutes = require('./routes/goalRoutes');
const startGoalScheduler = require('./utils/scheduler');

// --- 2. CONFIGURATION ---
dotenv.config();
connectDB();
startGoalScheduler(); // Starts the auto-check for expired goals

const app = express();

// --- 3. MIDDLEWARE ---

// A. Increase limit to 500MB to allow large Video/Audio uploads
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// B. CORS: Allow requests from ANYWHERE (Fixes Netlify Login Error)
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// --- 4. STATIC FOLDER (CRITICAL) ---
// This makes the 'uploads' folder publicly accessible via URL
// Example: https://your-app.onrender.com/uploads/image-123.png
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// --- 5. MOUNT ROUTES ---

// Admin API (Dashboard)
app.use('/api/admin', adminRoutes);

// User API (Login/Register/Profile)
app.use('/api/user', userRoutes);

// Content API (Public Read-Only for App)
app.use('/api/audios', audioRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/categories', categoryRoutes);

// Utilities (Uploads & Personal Tools)
app.use('/api/upload', uploadRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/goals', goalRoutes);

// --- 6. ROOT ROUTE (Health Check) ---
app.get('/', (req, res) => {
  res.send('✅ Miracle API is running...');
});

// --- 7. START SERVER ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});