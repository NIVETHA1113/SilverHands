import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createOpportunity,
  getOpportunities,
  getOpportunityById,
  updateOpportunity,
  updateOpportunityStatus,
  deleteOpportunity,
  getMyOpportunities
} from '../controllers/opportunityController.js';
import {
  applyToOpportunity,
  getApplicationsForOpportunity
} from '../controllers/applicationController.js';

const router = express.Router();

// IMPORTANT: /my must come before /:id to avoid being caught as an id param
router.get('/my', protect, getMyOpportunities);

router.get('/', getOpportunities);
router.post('/', protect, createOpportunity);

router.get('/:id', getOpportunityById);
router.put('/:id', protect, updateOpportunity);
router.patch('/:id/status', protect, updateOpportunityStatus);
router.delete('/:id', protect, deleteOpportunity);

// Applications on an opportunity
router.post('/:id/apply', protect, applyToOpportunity);
router.get('/:id/applications', protect, getApplicationsForOpportunity);

export default router;
