import express from 'express';
import { getPlayers, createPlayer, deletePlayer } from '../controllers/playerController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken); // Protect all routes
router.get('/', getPlayers);
router.post('/', createPlayer);
router.delete('/:id', deletePlayer);

export default router;