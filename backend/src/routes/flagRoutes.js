import express from 'express';
import { getFlags, createFlag, deleteFlag } from '../controllers/flagController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All flag routes require authentication
router.use(authenticateToken);

router.get('/', getFlags);
router.post('/', createFlag);
router.delete('/:id', deleteFlag);

export default router;