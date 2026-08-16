import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  getMyApplications,
  acceptApplication,
  rejectApplication,
  withdrawApplication,
  completeApplication,
  getApplicationById
} from '../controllers/applicationController.js';
import { createReview } from '../controllers/reviewController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reviewUploadDir = path.join(__dirname, '../uploads/reviews');
if (!fs.existsSync(reviewUploadDir)) {
  fs.mkdirSync(reviewUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, reviewUploadDir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname || '.jpg');
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, JPEG, and PNG images are allowed.'));
  }
});

const router = express.Router();

// Provider ONLY: view all their submitted applications
router.get('/my', protect, authorizeRoles('provider'), getMyApplications);

// Protected: Get single application details
router.get('/:id', protect, getApplicationById);

// Customer ONLY: accept / reject applications
router.patch('/:id/accept', protect, authorizeRoles('customer'), acceptApplication);
router.patch('/:id/reject', protect, authorizeRoles('customer'), rejectApplication);

// Provider ONLY: withdraw application
router.patch('/:id/withdraw', protect, authorizeRoles('provider'), withdrawApplication);

// Customer ONLY: mark application completed
router.patch('/:id/complete', protect, authorizeRoles('customer'), completeApplication);

// Customer ONLY: leave a review after completion
router.post('/:id/review', protect, authorizeRoles('customer'), upload.single('completionImage'), createReview);

export default router;
