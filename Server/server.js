const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db.js');

// Import Routes
const adminRoutes = require('./routes/adminRoutes'); 
const userRoutes = require('./routes/userRoutes'); 
const audioRoutes = require('./routes/audioRoutes'); 
const categoryRoutes = require('./routes/categoryRoutes'); 
const uploadRoutes = require('./routes/uploadRoutes');
const journalRoutes = require('./routes/journalRoutes');
const goalRoutes = require('./routes/goalRoutes');
const videoRoutes = require('./routes/videoRoutes'); 
const startGoalScheduler = require('./utils/scheduler');

dotenv.config();
connectDB();
startGoalScheduler();

const app = express();

// --- MIDDLEWARE (UPDATED) ---
// ⚠️ Added 500mb limit so Videos and Audios don't crash the server
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use(cors());

// Static Folder (Crucial for Local Storage to work)
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// --- MOUNT ROUTES ---

// 1. ADMIN API
app.use('/api/admin', adminRoutes);

// 2. USER API
app.use('/api/user', userRoutes);

// 3. PUBLIC CONTENT
app.use('/api/audios', audioRoutes);
app.use('/api/videos', videoRoutes); 
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