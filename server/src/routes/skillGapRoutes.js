import express from 'express';
import { getProviderSkillGaps } from '../controllers/skillGapController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/providers/skill-gaps - Protected Provider Only
router.get('/skill-gaps', protect, authorizeRoles('provider'), getProviderSkillGaps);

export default router;
