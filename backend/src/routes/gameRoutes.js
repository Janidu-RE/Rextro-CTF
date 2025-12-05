import express from 'express';
import { 
  playerLogin, 
  submitFlag, 
  getLeaderboard, 
  getGameStatus,
  getChallenges // <--- Import
} from '../controllers/gameController.js';

const router = express.Router();

router.post('/login', playerLogin);
router.post('/submit', submitFlag);
router.get('/leaderboard', getLeaderboard);
router.get('/status', getGameStatus);
router.get('/challenges', getChallenges); // <--- New Route

export default router;