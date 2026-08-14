import express from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  updateServiceStatus,
  deleteService
} from '../controllers/serviceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getServices);
router.get('/:id', getServiceById);
router.post('/', protect, createService);
router.put('/:id', protect, updateService);
router.patch('/:id/status', protect, updateServiceStatus);
router.delete('/:id', protect, deleteService);

export default router;
