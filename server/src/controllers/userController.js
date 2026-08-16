import User from '../models/User.js';
import Service from '../models/Service.js';
import Product from '../models/Product.js';
import { isDbConnected } from '../config/db.js';
import {
  buildProviderQuery,
  buildSortOption,
  filterInMemoryProviders,
  normalizePagination
} from '../services/discoveryService.js';

// Fallback in-memory map for demo mode if MongoDB is offline
export const inMemoryUsers = new Map();

// @desc    Get discoverable providers for public discovery
// @route   GET /api/users/providers/public
// @access  Public
export const getPublicProviders = async (req, res) => {
  try {
    const {
      search,
      city,
      skill,
      language,
      sort = 'relevance',
      page = 1,
      limit = 20
    } = req.query;

    const { pageNum, limitNum, skip } = normalizePagination(page, limit);

    if (isDbConnected) {
      // Build query using discovery service
      const query = buildProviderQuery({
        search,
        city,
        skill,
        language,
        hasPublishedContent: true
      });

      // Build sort option
      const sortOption = buildSortOption(sort);

      // Execute query
      const total = await User.countDocuments(query);
      const providers = await User.find(query)
        .select('-password -email -phone')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum);

      return res.json({
        success: true,
        count: providers.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        providers
      });
    } else {
      // Fallback: in-memory filtering
      let list = Array.from(inMemoryUsers.values());

      list = filterInMemoryProviders(list, {
        search,
        city,
        skill,
        language
      });

      // Sort
      if (sort === 'experience') {
        list.sort((a, b) => {
          const maxExperienceA = Math.max(...(a.skills?.map(s => s.experienceYears) || [0]));
          const maxExperienceB = Math.max(...(b.skills?.map(s => s.experienceYears) || [0]));
          return maxExperienceB - maxExperienceA;
        });
      } else {
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0) || new Date(b.createdAt) - new Date(a.createdAt));
      }

      const total = list.length;
      const paginated = list.slice(skip, skip + limitNum).map(({ password, email, phone, ...rest }) => rest);

      return res.json({
        success: true,
        count: paginated.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        providers: paginated
      });
    }
  } catch (error) {
    console.error('[getPublicProviders Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
// @access  Public
export const getPublicProviderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected) {
      const provider = await User.findById(id).select('-password -email -phone');
      if (!provider || provider.role !== 'provider') {
        return res.status(404).json({ success: false, message: 'Provider profile not found' });
      }

      const [publishedServices, publishedProducts] = await Promise.all([
        Service.find({ providerId: id, status: 'published' }).sort({ createdAt: -1 }),
        Product.find({ providerId: id, status: { $in: ['published', 'out_of_stock'] } }).sort({ createdAt: -1 })
      ]);

      return res.json({
        success: true,
        provider,
        services: publishedServices,
        products: publishedProducts
      });
    } else {
      let providerObj = null;
      for (const u of inMemoryUsers.values()) {
        if (u._id === id && u.role === 'provider') {
          const { password, email, phone, ...rest } = u;
          providerObj = rest;
          break;
        }
      }

      if (!providerObj) {
        return res.status(404).json({ success: false, message: 'Provider profile not found' });
      }

      return res.json({
        success: true,
        provider: providerObj,
        services: [],
        products: []
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update provider/user profile
// @route   PUT /api/users/:id/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;

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
      const user = await User.findById(userId).select('-password -email -phone');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.json({ success: true, user });
    } else {
      for (const u of inMemoryUsers.values()) {
        if (u._id === userId) {
          const { password, email, phone, ...userWithoutPassword } = u;
          return res.json({ success: true, user: userWithoutPassword });
        }
      }
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
