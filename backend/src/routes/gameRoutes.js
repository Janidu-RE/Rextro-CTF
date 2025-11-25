import express from 'express';
import { playerLogin, submitFlag, getLeaderboard } from '../controllers/gameController.js';

const router = express.Router();

// Public routes (Player Access)
router.post('/login', playerLogin);
router.post('/submit', submitFlag);
router.get('/leaderboard', getLeaderboard);

export default router;