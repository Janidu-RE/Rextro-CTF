import express from 'express';
// Import getGameStatus
import { playerLogin, submitFlag, getLeaderboard, getGameStatus } from '../controllers/gameController.js';

const router = express.Router();

router.post('/login', playerLogin);
router.post('/submit', submitFlag);
router.get('/leaderboard', getLeaderboard);

// Register the status route
router.get('/status', getGameStatus); 

export default router;