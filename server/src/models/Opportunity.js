import mongoose from 'mongoose';

const opportunitySchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  requiredSkills: [{
    type: String
  }],
  budget: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  latitude: Number,
  longitude: Number,
  availability: {
    type: String,
    default: 'Flexible'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'completed', 'closed'],
    default: 'open'
  }
}, {
  timestamps: true
});

const Opportunity = mongoose.model('Opportunity', opportunitySchema);
export default Opportunity;
