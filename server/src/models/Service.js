import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Service description is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    index: true
  },
  skills: [{
    type: String
  }],
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  priceType: {
    type: String,
    enum: ['Per Hour', 'Per Session', 'Per Item', 'Starting From', 'Custom'],
    default: 'Per Item'
  },
  location: {
    city: { type: String, default: 'Chennai', index: true },
    state: { type: String, default: 'Tamil Nadu' },
    country: { type: String, default: 'India' },
    address: { type: String, default: '' },
    latitude: { type: Number, default: 13.0827 },
    longitude: { type: Number, default: 80.2707 }
  },
  availability: {
    days: [{ type: String }],
    timePreferences: [{ type: String }]
  },
  deliveryMode: [{
    type: String,
    enum: ['Online', 'In Person', 'Home Based', 'Customer Location']
  }],
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'paused'],
    default: 'published',
    index: true
  }
}, {
  timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);
export default Service;
