import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Application from '../models/Application.js';
import User from '../models/User.js';

const getReviewImageUrl = (req) => {
  if (!req.file) return '';
  return `/uploads/reviews/${req.file.filename}`;
};

const getUserId = (req) => (req.user._id ? req.user._id.toString() : req.user.id);

// ─────────────────────────────────────────────
// @desc   Create a review for a completed application (customer only)
// @route  POST /api/applications/:id/review
// @access Protected
// ─────────────────────────────────────────────
export const createReview = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const userId = getUserId(req);

    // Only the customer who owns the opportunity can review
    if (application.customerId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Only the customer can leave a review.' });
    }

    // Only after completion
    if (application.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'You can only review after the application is completed.' });
    }

    const { rating, comment } = req.body;
    const parsedRating = Number(rating);

    if (!rating || !comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'rating and comment are required.' });
    }

    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    // Build update fields; only overwrite imageUrl when a new file was uploaded
    const newImageUrl = getReviewImageUrl(req);

    // Upsert: update existing review rather than returning 409 on re-submit
    const existing = await Review.findOne({
      applicationId: application._id,
      customerId: userId
    });

    let review;
    if (existing) {
      existing.rating = parsedRating;
      existing.comment = comment.trim();
      if (newImageUrl) existing.imageUrl = newImageUrl;
      review = await existing.save();
    } else {
      review = await Review.create({
        providerId: application.providerId,
        customerId: userId,
        opportunityId: application.opportunityId,
        applicationId: application._id,
        rating: parsedRating,
        comment: comment.trim(),
        imageUrl: newImageUrl
      });
    }

    // Recompute provider trust rating from ALL their reviews in MongoDB
    await _refreshProviderRating(application.providerId.toString());

    const populated = await review.populate('customerId', 'name profileImage');
    const statusCode = existing ? 200 : 201;
    return res.status(statusCode).json({ success: true, review: populated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this application.' });
    }
    console.error('[createReview Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// @desc   Get all reviews for a provider (public)
// @route  GET /api/users/:id/reviews
// @access Public
// ─────────────────────────────────────────────
export const getProviderReviews = async (req, res) => {
  try {
    const providerId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({ success: false, message: 'Invalid provider ID.' });
    }

    const reviews = await Review.find({ providerId })
      .populate('customerId', 'name profileImage')
      .sort({ createdAt: -1 });

    const count = reviews.length;
    const avgRating = count > 0
      ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
      : 0;

    return res.json({ success: true, reviews, count, avgRating });
  } catch (err) {
    console.error('[getProviderReviews Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// @desc   Get trust stats for a provider (real MongoDB aggregation)
// @route  GET /api/users/:id/trust
// @access Public
// ─────────────────────────────────────────────
export const getProviderTrust = async (req, res) => {
  try {
    const providerId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({ success: false, message: 'Invalid provider ID.' });
    }

    const [reviewStats, completedCount] = await Promise.all([
      Review.aggregate([
        { $match: { providerId: new mongoose.Types.ObjectId(providerId) } },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            avgRating: { $avg: '$rating' }
          }
        }
      ]),
      Application.countDocuments({ providerId, status: 'completed' })
    ]);

    let avgRating = 0;
    let totalReviews = 0;
    let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (reviewStats.length > 0) {
      avgRating = parseFloat(reviewStats[0].avgRating.toFixed(1));
      totalReviews = reviewStats[0].totalReviews;

      // Build distribution
      const allReviews = await Review.find({ providerId }, 'rating');
      allReviews.forEach((r) => {
        if (ratingDistribution[r.rating] !== undefined) ratingDistribution[r.rating]++;
      });
    }

    return res.json({
      success: true,
      trust: {
        avgRating,
        totalReviews,
        completedJobs: completedCount,
        ratingDistribution
      }
    });
  } catch (err) {
    console.error('[getProviderTrust Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// Internal helper: recompute + persist provider rating on User doc
// ─────────────────────────────────────────────
async function _refreshProviderRating(providerId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(providerId)) return;
    const result = await Review.aggregate([
      { $match: { providerId: new mongoose.Types.ObjectId(providerId) } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);

    if (result.length > 0) {
      const newRating = parseFloat(result[0].avg.toFixed(1));
      await User.findByIdAndUpdate(providerId, { rating: newRating });
    }
  } catch (err) {
    console.error('[_refreshProviderRating Error]:', err.message);
  }
}

