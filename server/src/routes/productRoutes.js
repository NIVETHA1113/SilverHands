import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.patch('/:id/status', protect, updateProductStatus);
router.delete('/:id', protect, deleteProduct);

export default router;
