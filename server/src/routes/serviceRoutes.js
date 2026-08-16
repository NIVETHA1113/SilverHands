import express from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  updateServiceStatus,
  deleteService
} from '../controllers/serviceController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getServices);
router.get('/:id', getServiceById);

// Provider ONLY routes
router.post('/', protect, authorizeRoles('provider'), createService);
router.put('/:id', protect, authorizeRoles('provider'), updateService);
router.patch('/:id/status', protect, authorizeRoles('provider'), updateServiceStatus);
router.delete('/:id', protect, authorizeRoles('provider'), deleteService);

export default router;
