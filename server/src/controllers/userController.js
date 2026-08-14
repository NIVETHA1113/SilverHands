import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';

// Fallback in-memory map for demo mode if MongoDB is offline
export const inMemoryUsers = new Map();

// @desc    Update provider/user profile
// @route   PUT /api/users/:id/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // Security check: Provider can only update their own profile
    if (req.user._id && req.user._id.toString() !== userId && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only update your own profile.'
      });
    }

    const {
      name,
      age,
      phone,
      bio,
      profileImage,
      skills,
      location,
      languages,
      workPreferences,
      interestedIn,
      availability
    } = req.body;

    if (isDbConnected) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (name !== undefined) user.name = name;
      if (age !== undefined) user.age = Number(age);
      if (phone !== undefined) user.phone = phone;
      if (bio !== undefined) user.bio = bio;
      if (profileImage !== undefined) user.profileImage = profileImage;
      if (skills !== undefined) user.skills = skills;
      if (location !== undefined) user.location = { ...user.location, ...location };
      if (languages !== undefined) user.languages = languages;
      if (workPreferences !== undefined) user.workPreferences = workPreferences;
      if (interestedIn !== undefined) user.interestedIn = interestedIn;
      if (availability !== undefined) user.availability = { ...user.availability, ...availability };

      await user.save();

      const updatedUser = await User.findById(userId).select('-password');
      return res.json({
        success: true,
        message: 'Profile updated successfully!',
        user: updatedUser
      });
    } else {
      // In-memory fallback
      let userObj = null;
      for (const [email, u] of inMemoryUsers.entries()) {
        if (u._id === userId) {
          if (name !== undefined) u.name = name;
          if (age !== undefined) u.age = Number(age);
          if (phone !== undefined) u.phone = phone;
          if (bio !== undefined) u.bio = bio;
          if (profileImage !== undefined) u.profileImage = profileImage;
          if (skills !== undefined) u.skills = skills;
          if (location !== undefined) u.location = { ...u.location, ...location };
          if (languages !== undefined) u.languages = languages;
          if (workPreferences !== undefined) u.workPreferences = workPreferences;
          if (interestedIn !== undefined) u.interestedIn = interestedIn;
          if (availability !== undefined) u.availability = { ...u.availability, ...availability };
          userObj = u;
          break;
        }
      }

      if (!userObj) {
        userObj = { ...req.user, ...req.body };
      }

      const { password, ...userWithoutPassword } = userObj;
      return res.json({
        success: true,
        message: 'Profile updated successfully (Demo Mode)!',
        user: userWithoutPassword
      });
    }
  } catch (error) {
    console.error('[Update Profile Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating profile.'
    });
  }
};

// @desc    Update provider onboarding status
// @route   PUT /api/users/:id/onboarding
// @access  Private
export const updateOnboarding = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user._id && req.user._id.toString() !== userId && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only update your own onboarding status.'
      });
    }

    const { completed, currentStep } = req.body;

    if (isDbConnected) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (!user.onboarding) {
        user.onboarding = { completed: false, currentStep: 1 };
      }

      if (completed !== undefined) user.onboarding.completed = Boolean(completed);
      if (currentStep !== undefined) user.onboarding.currentStep = Number(currentStep);

      await user.save();

      const updatedUser = await User.findById(userId).select('-password');
      return res.json({
        success: true,
        message: 'Onboarding status updated',
        user: updatedUser
      });
    } else {
      // In-memory fallback
      for (const [email, u] of inMemoryUsers.entries()) {
        if (u._id === userId) {
          if (!u.onboarding) u.onboarding = { completed: false, currentStep: 1 };
          if (completed !== undefined) u.onboarding.completed = Boolean(completed);
          if (currentStep !== undefined) u.onboarding.currentStep = Number(currentStep);
          const { password, ...userWithoutPassword } = u;
          return res.json({
            success: true,
            message: 'Onboarding status updated (Demo Mode)',
            user: userWithoutPassword
          });
        }
      }

      return res.json({
        success: true,
        user: { ...req.user, onboarding: { completed, currentStep } }
      });
    }
  } catch (error) {
    console.error('[Update Onboarding Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating onboarding status.'
    });
  }
};

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    if (isDbConnected) {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.json({ success: true, user });
    } else {
      for (const u of inMemoryUsers.values()) {
        if (u._id === userId) {
          const { password, ...userWithoutPassword } = u;
          return res.json({ success: true, user: userWithoutPassword });
        }
      }
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
