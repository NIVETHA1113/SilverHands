import express from 'express';
import { sendMessage, getMyMessages, markMessageRead } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/my', protect, getMyMessages);
router.patch('/:id/read', protect, markMessageRead);

export default router;
