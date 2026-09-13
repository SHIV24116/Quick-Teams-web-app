const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { testConnection, sequelize } = require('./config/db');
require('./models'); // Load associations

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const teamRoutes = require('./routes/teamRoutes');
const inviteRoutes = require('./routes/inviteRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded avatars statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Quick Teams Backend Operational', timestamp: new Date() });
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Quick Teams API v1 Operational', timestamp: new Date() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/teams', teamRoutes);
app.use('/api/v1/invites', inviteRoutes);
app.use('/api/v1/chats', chatRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start Server & Sync DB
const startServer = async () => {
  try {
    await testConnection();
    await sequelize.sync();
    console.log('[DB] Database tables synced successfully.');

    app.listen(PORT, () => {
      console.log(`[SERVER] Quick Teams Backend listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[SERVER ERROR] Could not start server:', error);
  }
};

startServer();
