import express from 'express';
import {
  handleExtractSkills,
  handleGenerateProfile,
  handleGenerateServiceDescription,
  handleExtractRequirement,
  handleExplainMatch
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Skill Extraction
router.post('/extract-skills', protect, handleExtractSkills);

// 2. Profile Bio Generation
router.post('/generate-profile', protect, handleGenerateProfile);

// 3. Service Listing Description Generation
router.post('/generate-service-description', protect, handleGenerateServiceDescription);

// 4. Requirement Extraction
router.post('/extract-requirement', protect, handleExtractRequirement);

// 5. Match Explanation
router.post('/explain-match', protect, handleExplainMatch);

export default router;
