import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Config
import connectDB from './src/config/db.js';
import { initializeUsers } from './src/utils/seed.js';
import { startGlobalCountdown } from './src/services/gameService.js';
import Round from './src/models/Round.js';

// Routes
import authRoutes from './src/routes/authRoutes.js';
import playerRoutes from './src/routes/playerRoutes.js';
import groupRoutes from './src/routes/groupRoutes.js';
import roundRoutes from './src/routes/roundRoutes.js';
import flagRoutes from './src/routes/flagRoutes.js';
import gameRoutes from './src/routes/gameRoutes.js'; // <--- 1. IMPORT THIS

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: ['http://10.38.29.187:5173', 'http://127.0.0.1:5173', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/rounds', roundRoutes);
app.use('/api/flags', flagRoutes);
app.use('/api/game', gameRoutes); // <--- 2. REGISTER THIS

// Server Init
const startServer = async () => {
  try {
    await connectDB();
    await initializeUsers();
    
    // Resume countdown if active round exists
    const activeRound = await Round.findOne({ active: true });
    if (activeRound && activeRound.remainingTime > 0) {
      console.log('Resuming global countdown for existing round');
      startGlobalCountdown();
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

startServer();