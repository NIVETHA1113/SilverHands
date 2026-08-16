import express from 'express';
import { getProviderReviews, getProviderTrust } from '../controllers/reviewController.js';

const router = express.Router();

// Public: get all reviews for a provider
// Mounted under /api/users — GET /api/users/:id/reviews
router.get('/:id/reviews', getProviderReviews);

// Public: get trust stats for a provider
// GET /api/users/:id/trust
router.get('/:id/trust', getProviderTrust);

export default router;
