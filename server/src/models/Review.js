import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Legacy: service-request-based review
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request'
  },
  // New: opportunity-based review
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity'
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Prevent duplicate reviews per application
reviewSchema.index({ applicationId: 1, customerId: 1 }, {
  unique: true,
  partialFilterExpression: { applicationId: { $exists: true } }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
