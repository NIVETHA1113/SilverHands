import express from 'express';
import {
  getUserById,
  updateProfile,
  updateOnboarding,
  getPublicProviders,
  getPublicProviderById
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public discovery routes
router.get('/providers/public', getPublicProviders);
router.get('/providers/:id/public', getPublicProviderById);

// Protected user profile routes
router.get('/:id', getUserById);
router.put('/:id/profile', protect, updateProfile);
router.put('/:id/onboarding', protect, updateOnboarding);

export default router;
