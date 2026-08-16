import Service from '../models/Service.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';
import {
  buildListingQuery,
  buildProviderQuery,
  normalizePagination
} from '../services/discoveryService.js';
import { inMemoryServices } from './serviceController.js';
import { inMemoryProducts } from './productController.js';
import { inMemoryUsers } from './userController.js';

// @desc    Unified search across Services, Products, and Providers
// @route   GET /api/search
// @access  Public
export const handleGlobalSearch = async (req, res) => {
  try {
    const {
      q,
      category,
      city,
      minPrice,
      maxPrice,
      sort = 'relevance',
      limit = 6,
      page = 1
    } = req.query;

    const { pageNum, limitNum: defaultLimit, skip } = normalizePagination(page, limit);
    const limitNum = Math.min(defaultLimit, parseInt(limit, 10) || 6);

    if (!q || !q.trim()) {
      return res.json({
        success: true,
        query: '',
        services: [],
        products: [],
        providers: []
      });
    }

    const regex = new RegExp(q.trim(), 'i');

    if (isDbConnected) {
      // Build query for published services
      const serviceQuery = buildListingQuery({
        status: 'published',
        category,
        city,
        minPrice,
        maxPrice,
        search: q
      });

      // Build query for published products
      const productQuery = buildListingQuery({
        status: ['published', 'out_of_stock'],
        category,
        city,
        minPrice,
        maxPrice,
        search: q
      });

      // Build query for providers
      const providerQuery = buildProviderQuery({
        search: q,
        city,
        hasPublishedContent: true
      });

      // Execute all queries in parallel
      const [services, products, providers] = await Promise.all([
        Service.find(serviceQuery)
          .populate('providerId', 'name profileImage location rating')
          .limit(limitNum),
        Product.find(productQuery)
          .populate('providerId', 'name profileImage location rating')
          .limit(limitNum),
        User.find(providerQuery)
          .select('-password -email -phone')
          .limit(limitNum)
      ]);

      return res.json({
        success: true,
        query: q,
        count: services.length + products.length + providers.length,
        services,
        products,
        providers
      });
    } else {
      // Fallback: in-memory search
      const services = Array.from(inMemoryServices.values())
        .filter(s => s.status === 'published')
        .filter(s => regex.test(s.title) || regex.test(s.description) || regex.test(s.category))
        .slice(0, limitNum);

      const products = Array.from(inMemoryProducts.values())
        .filter(p => ['published', 'out_of_stock'].includes(p.status))
        .filter(p => regex.test(p.name) || regex.test(p.description) || regex.test(p.category))
        .slice(0, limitNum);

      const providers = Array.from(inMemoryUsers.values())
        .filter(u => u.role === 'provider')
        .filter(u => regex.test(u.name) || regex.test(u.bio))
        .map(({ password, email, phone, ...rest }) => rest)
        .slice(0, limitNum);

      return res.json({
        success: true,
        query: q,
        count: services.length + products.length + providers.length,
        services,
        products,
        providers
      });
    }
  } catch (error) {
    console.error('[Global Search Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Search error' });
  }
};
