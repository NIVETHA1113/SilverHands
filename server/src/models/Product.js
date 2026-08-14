import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    index: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 1
  },
  unit: {
    type: String,
    enum: ['piece', 'pack', 'kg', 'box', 'set', 'gm', 'bottle', 'jar'],
    default: 'piece'
  },
  images: [{
    type: String
  }],
  location: {
    city: { type: String, default: 'Chennai', index: true },
    state: { type: String, default: 'Tamil Nadu' },
    country: { type: String, default: 'India' },
    address: { type: String, default: '' },
    latitude: { type: Number, default: 13.0827 },
    longitude: { type: Number, default: 80.2707 }
  },
  deliveryOptions: [{
    type: String,
    enum: ['Pickup', 'Local Delivery', 'Shipping']
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'out_of_stock', 'paused'],
    default: 'published',
    index: true
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;
