import mongoose from 'mongoose';

const opportunitySchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    index: true
  },
  skills: {
    type: [String],
    default: []
  },
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: 0
  },
  budgetType: {
    type: String,
    enum: ['fixed', 'per_hour', 'per_day'],
    default: 'fixed'
  },
  location: {
    city: { type: String, default: '' },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null }
  },
  availability: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['open', 'paused', 'closed', 'completed'],
    default: 'open',
    index: true
  }
}, {
  timestamps: true
});

const Opportunity = mongoose.model('Opportunity', opportunitySchema);
export default Opportunity;
