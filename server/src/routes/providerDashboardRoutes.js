import express from 'express';
import { getProviderDashboard } from '../controllers/providerDashboardController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/providers/dashboard - Protected Provider Only
router.get('/dashboard', protect, authorizeRoles('provider'), getProviderDashboard);

export default router;
