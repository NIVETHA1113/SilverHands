import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  providerId: {
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
  skills: [{
    type: String
  }],
  price: {
    type: Number,
    required: true
  },
  priceType: {
    type: String,
    enum: ['per hour', 'per item', 'fixed', 'per project'],
    default: 'fixed'
  },
  location: {
    city: String,
    latitude: Number,
    longitude: Number,
    address: String
  },
  availability: {
    type: String,
    default: 'Flexible'
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);
export default Service;
