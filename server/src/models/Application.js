import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true,
    index: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  message: {
    type: String,
    default: ''
  },
  proposedPrice: {
    type: Number,
    min: 0,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn', 'completed'],
    default: 'pending',
    index: true
  }
}, {
  timestamps: true
});

// Prevent a provider from applying twice to the same opportunity
applicationSchema.index({ opportunityId: 1, providerId: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
