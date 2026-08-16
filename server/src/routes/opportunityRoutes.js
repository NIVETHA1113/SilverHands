import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
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

// Customer ONLY: View own created opportunities
router.get('/my', protect, authorizeRoles('customer'), getMyOpportunities);

// Public browsing
router.get('/', getOpportunities);
router.get('/:id', getOpportunityById);

// Customer ONLY: Create & manage opportunities
router.post('/', protect, authorizeRoles('customer'), createOpportunity);
router.put('/:id', protect, authorizeRoles('customer'), updateOpportunity);
router.patch('/:id/status', protect, authorizeRoles('customer'), updateOpportunityStatus);
router.delete('/:id', protect, authorizeRoles('customer'), deleteOpportunity);

// Provider ONLY: Apply to an opportunity
router.post('/:id/apply', protect, authorizeRoles('provider'), applyToOpportunity);

// Customer ONLY: View applications submitted for their opportunity
router.get('/:id/applications', protect, authorizeRoles('customer'), getApplicationsForOpportunity);

export default router;
