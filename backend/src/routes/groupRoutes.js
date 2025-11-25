import express from 'express';
import { 
  getGroups, updateGroupTime, addPlayerToGroup, 
  removePlayerFromGroup, updateBulkGroupTimes 
} from '../controllers/groupController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);
router.get('/', getGroups);
router.put('/:id', updateGroupTime);
router.put('/update-times/:groupId', updateBulkGroupTimes);
router.post('/:groupId/players/:playerId', addPlayerToGroup);
router.delete('/:groupId/players/:playerId', removePlayerFromGroup);

export default router;