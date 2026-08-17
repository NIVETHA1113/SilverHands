import express from 'express';
import { handleChatbotMessage } from '../controllers/chatbotController.js';
import { optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/chatbot/message - Accepts optional Bearer Token in Authorization header
router.post('/message', optionalProtect, handleChatbotMessage);

export default router;
