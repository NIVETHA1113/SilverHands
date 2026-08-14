import express from 'express';
import { updateProfile, updateOnboarding, getUserById } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/:id/profile', protect, updateProfile);
router.put('/:id/onboarding', protect, updateOnboarding);
router.get('/:id', getUserById);

export default router;
