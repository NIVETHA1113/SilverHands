import express from 'express';
import { handleExtractSkills, handleGenerateServiceDescription } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/extract-skills', protect, handleExtractSkills);
router.post('/generate-service-description', protect, handleGenerateServiceDescription);

export default router;
