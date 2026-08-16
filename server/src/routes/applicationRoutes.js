import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/authMiddleware.js';
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

// Provider: see all their applications
router.get('/my', protect, getMyApplications);

// Get single application details
router.get('/:id', protect, getApplicationById);

// Customer: accept / reject
router.patch('/:id/accept', protect, acceptApplication);
router.patch('/:id/reject', protect, rejectApplication);

// Provider: withdraw
router.patch('/:id/withdraw', protect, withdrawApplication);

// Customer: mark completed
router.patch('/:id/complete', protect, completeApplication);

// Customer: leave a review after completion
router.post('/:id/review', protect, upload.single('completionImage'), createReview);


export default router;
