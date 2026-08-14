import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
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
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  images: [{
    type: String
  }],
  location: {
    city: String,
    latitude: Number,
    longitude: Number,
    address: String
  },
  status: {
    type: String,
    enum: ['available', 'out_of_stock'],
    default: 'available'
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;
