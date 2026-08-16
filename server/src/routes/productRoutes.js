import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct
} from '../controllers/productController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);

// Provider ONLY routes
router.post('/', protect, authorizeRoles('provider'), createProduct);
router.put('/:id', protect, authorizeRoles('provider'), updateProduct);
router.patch('/:id/status', protect, authorizeRoles('provider'), updateProductStatus);
router.delete('/:id', protect, authorizeRoles('provider'), deleteProduct);

export default router;
