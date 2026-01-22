const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db.js');

// Import Routes
const adminRoutes = require('./routes/adminRoutes'); // <--- NEW Admin API
const userRoutes = require('./routes/userRoutes');   // <--- Clean User API
const audioRoutes = require('./routes/audioRoutes'); // Public Read-Only
const categoryRoutes = require('./routes/categoryRoutes'); // Public Read-Only
const uploadRoutes = require('./routes/uploadRoutes');
const journalRoutes = require('./routes/journalRoutes');
const goalRoutes = require('./routes/goalRoutes');
const startGoalScheduler = require('./utils/scheduler');


dotenv.config();
connectDB();
startGoalScheduler();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Static Folder
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// --- MOUNT ROUTES ---

// 1. ADMIN API (Dashboard)
// All admin actions go here: /api/admin/users, /api/admin/audios, etc.
app.use('/api/admin', adminRoutes);

// 2. USER API (Mobile App/Web)
// Login/Register goes here: /api/user/login, /api/user/register
app.use('/api/user', userRoutes);

// 3. PUBLIC CONTENT (Read-Only)
// This allows the app to fetch lists without being an admin
app.use('/api/audios', audioRoutes);
app.use('/api/categories', categoryRoutes);

// 4. UTILITIES
app.use('/api/upload', uploadRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/goals', goalRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Miracle API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});