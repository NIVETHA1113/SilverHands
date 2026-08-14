import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'General' },
  experienceYears: { type: Number, default: 0 },
  proficiency: { type: String, default: 'Intermediate' } // Beginner, Intermediate, Expert
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['provider', 'customer'],
    required: [true, 'Role is required']
  },
  age: {
    type: Number
  },
  phone: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250'
  },
  languages: {
    type: [String],
    default: ['English', 'Hindi', 'Tamil']
  },
  skills: [skillSchema],
  location: {
    city: { type: String, default: 'Chennai' },
    state: { type: String, default: 'Tamil Nadu' },
    country: { type: String, default: 'India' },
    latitude: { type: Number, default: 13.0827 },
    longitude: { type: Number, default: 80.2707 },
    address: { type: String, default: 'T. Nagar, Chennai' }
  },
  availability: {
    days: { type: [String], default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
    preferredTime: { type: String, default: 'Flexible' },
    workPreference: { type: String, default: 'Home-based' }
  },
  verification: {
    phoneVerified: { type: Boolean, default: true },
    profileVerified: { type: Boolean, default: true }
  },
  rating: {
    type: Number,
    default: 4.8
  }
}, {
  timestamps: true
});

// Password Hash Pre-save middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password helper
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
