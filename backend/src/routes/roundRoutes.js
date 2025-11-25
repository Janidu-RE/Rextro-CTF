import express from 'express';
import { getCurrentRound, startRound, endRound, updateRoundTime } from '../controllers/roundController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);
router.get('/current', getCurrentRound);
router.post('/start', startRound);
router.post('/end', endRound);
router.put('/update-time', updateRoundTime);

export default router;