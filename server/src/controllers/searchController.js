import Service from '../models/Service.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';

// @desc    Unified search across Services, Products, and Providers
// @route   GET /api/search
// @access  Public
export const handleGlobalSearch = async (req, res) => {
  try {
    const { q, category, city, minPrice, maxPrice, limit = 6 } = req.query;
    const limitNum = parseInt(limit, 10) || 6;

    if (!q || !q.trim()) {
      return res.json({
        success: true,
        services: [],
        products: [],
        providers: []
      });
    }

    const regex = new RegExp(q.trim(), 'i');

    if (isDbConnected) {
      // Build query for published services
      const serviceQuery = {
        status: 'published',
        $or: [
          { title: regex },
          { description: regex },
          { category: regex },
          { skills: regex },
          { 'location.city': regex }
        ]
      };
      if (category) serviceQuery.category = category;
      if (city) serviceQuery['location.city'] = new RegExp(city, 'i');
      if (minPrice || maxPrice) {
        serviceQuery.price = {};
        if (minPrice) serviceQuery.price.$gte = Number(minPrice);
        if (maxPrice) serviceQuery.price.$lte = Number(maxPrice);
      }

      // Build query for published products
      const productQuery = {
        status: { $in: ['published', 'out_of_stock'] },
        $or: [
          { name: regex },
          { description: regex },
          { category: regex },
          { 'location.city': regex }
        ]
      };
      if (category) productQuery.category = category;
      if (city) productQuery['location.city'] = new RegExp(city, 'i');
      if (minPrice || maxPrice) {
        productQuery.price = {};
        if (minPrice) productQuery.price.$gte = Number(minPrice);
        if (maxPrice) productQuery.price.$lte = Number(maxPrice);
      }

      // Build query for completed providers
      const providerQuery = {
        role: 'provider',
        $and: [
          {
            $or: [
              { name: regex },
              { bio: regex },
              { 'skills.name': regex },
              { 'location.city': regex }
            ]
          }
        ]
      };
      if (city) providerQuery['location.city'] = new RegExp(city, 'i');

      const [services, products, providers] = await Promise.all([
        Service.find(serviceQuery).populate('providerId', 'name profileImage location rating').limit(limitNum),
        Product.find(productQuery).populate('providerId', 'name profileImage location rating').limit(limitNum),
        User.find(providerQuery).select('-password -email -phone').limit(limitNum)
      ]);

      return res.json({
        success: true,
        query: q,
        services,
        products,
        providers
      });
    } else {
      return res.json({
        success: true,
        query: q,
        services: [],
        products: [],
        providers: []
      });
    }
  } catch (error) {
    console.error('[Global Search Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Search error' });
  }
};
