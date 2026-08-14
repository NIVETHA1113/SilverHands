import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';

// In-memory fallback user store for local demo if MongoDB is offline
const inMemoryUsers = new Map();

// Helper to generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'silverhands_super_secret_jwt_key_2026_hackathon',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user (Provider or Customer)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role, age, phone, location, bio } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and select a role.'
      });
    }

    if (!['provider', 'customer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either provider or customer.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isDbConnected) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists.'
        });
      }

      const user = await User.create({
        name,
        email: normalizedEmail,
        password,
        role,
        age: age ? Number(age) : undefined,
        phone: phone || '',
        bio: bio || '',
        location: location || { city: 'Chennai', state: 'Tamil Nadu', country: 'India' }
      });

      const token = generateToken(user._id.toString(), user.role);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          age: user.age,
          phone: user.phone,
          bio: user.bio,
          skills: user.skills,
          location: user.location,
          availability: user.availability,
          rating: user.rating
        }
      });
    } else {
      // Fallback in-memory registration
      if (inMemoryUsers.has(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists.'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const fakeId = 'user_' + Date.now();
      const newUser = {
        _id: fakeId,
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role,
        age: age ? Number(age) : undefined,
        phone: phone || '',
        bio: bio || '',
        skills: [],
        location: location || { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
        availability: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], preferredTime: 'Flexible', workPreference: 'Home-based' },
        rating: 4.8,
        createdAt: new Date().toISOString()
      };

      inMemoryUsers.set(normalizedEmail, newUser);

      const token = generateToken(fakeId, role);
      const { password: _, ...userWithoutPassword } = newUser;

      return res.status(201).json({
        success: true,
        message: 'Account created successfully (Demo Mode)!',
        token,
        user: userWithoutPassword
      });
    }
  } catch (error) {
    console.error('[Register Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.'
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both email and password.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isDbConnected) {
      const user = await User.findOne({ email: normalizedEmail }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      const token = generateToken(user._id.toString(), user.role);

      return res.json({
        success: true,
        message: 'Logged in successfully!',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          age: user.age,
          phone: user.phone,
          bio: user.bio,
          skills: user.skills,
          location: user.location,
          availability: user.availability,
          rating: user.rating
        }
      });
    } else {
      // Fallback in-memory login
      const user = inMemoryUsers.get(normalizedEmail);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      const token = generateToken(user._id, user.role);
      const { password: _, ...userWithoutPassword } = user;

      return res.json({
        success: true,
        message: 'Logged in successfully (Demo Mode)!',
        token,
        user: userWithoutPassword
      });
    }
  } catch (error) {
    console.error('[Login Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login.'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    if (isDbConnected) {
      const user = await User.findById(req.user._id);
      return res.json({
        success: true,
        user
      });
    } else {
      // Find in-memory
      for (const user of inMemoryUsers.values()) {
        if (user._id === req.user.id) {
          const { password: _, ...userWithoutPassword } = user;
          return res.json({
            success: true,
            user: userWithoutPassword
          });
        }
      }
      return res.json({
        success: true,
        user: req.user
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching user profile.'
    });
  }
};
