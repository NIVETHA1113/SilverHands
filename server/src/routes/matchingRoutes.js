/**
 * matchingRoutes.js  —  SilverHands Phase 6
 *
 * Existing route:
 *   POST /api/matching/           → matchCandidates  (legacy, kept intact)
 *
 * Phase 6 addition:
 *   POST /api/matching/providers  → matchProviders
 */

import express from 'express';
import { matchCandidates, matchProviders } from '../controllers/matchingController.js';

const router = express.Router();

// Legacy endpoint — accepts a pre-built candidates array
router.post('/', matchCandidates);

// Phase 6 — fetch + score all eligible providers from DB
router.post('/providers', matchProviders);

export default router;
