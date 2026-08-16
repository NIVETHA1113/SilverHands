import Opportunity from '../models/Opportunity.js';
import Application from '../models/Application.js';

// Helper: get authenticated user id regardless of DB mode
const getUserId = (req) => (req.user._id ? req.user._id.toString() : req.user.id);

// ─────────────────────────────────────────────
// @desc   Create a new opportunity (customer only)
// @route  POST /api/opportunities
// @access Protected
// ─────────────────────────────────────────────
export const createOpportunity = async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Only customers can post opportunities.' });
    }

    const {
      title,
      description,
      category,
      skills,
      budget,
      budgetType,
      location,
      availability
    } = req.body;

    if (!title || !description || !category || budget === undefined || budget === null) {
      return res.status(400).json({
        success: false,
        message: 'title, description, category, and budget are required.'
      });
    }

    const customerId = getUserId(req);

    const opportunity = await Opportunity.create({
      customerId,
      title: title.trim(),
      description,
      category,
      skills: Array.isArray(skills) ? skills : [],
      budget: Number(budget),
      budgetType: budgetType || 'fixed',
      location: location || {},
      availability: Array.isArray(availability) ? availability : []
    });

    return res.status(201).json({ success: true, opportunity });
  } catch (err) {
    console.error('[createOpportunity Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// @desc   List opportunities (public browse with filters)
// @route  GET /api/opportunities
// @access Public
// ─────────────────────────────────────────────
export const getOpportunities = async (req, res) => {
  try {
    const {
      status = 'open',
      category,
      city,
      search,
      minBudget,
      maxBudget,
      sort = 'newest',
      page = 1,
      limit = 20
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'All') query.category = new RegExp(category, 'i');
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = Number(minBudget);
      if (maxBudget) query.budget.$lte = Number(maxBudget);
    }
    if (search) {
      const re = new RegExp(search.trim(), 'i');
      query.$or = [{ title: re }, { description: re }, { category: re }, { 'location.city': re }];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'budget_asc') sortOption = { budget: 1 };
    if (sort === 'budget_desc') sortOption = { budget: -1 };

    const total = await Opportunity.countDocuments(query);
    const opportunities = await Opportunity.find(query)
      .populate('customerId', 'name profileImage location rating')
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    // Fetch real MongoDB application counts
    const oppIds = opportunities.map(o => o._id);
    const appCounts = await Application.aggregate([
      { $match: { opportunityId: { $in: oppIds } } },
      { $group: { _id: '$opportunityId', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    appCounts.forEach(c => {
      countMap[c._id.toString()] = c.count;
    });

    const oppsWithCounts = opportunities.map(o => ({
      ...o,
      applicationCount: countMap[o._id.toString()] || 0
    }));

    return res.json({
      success: true,
      count: oppsWithCounts.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      opportunities: oppsWithCounts
    });
  } catch (err) {
    console.error('[getOpportunities Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// @desc   Get single opportunity
// @route  GET /api/opportunities/:id
// @access Public
// ─────────────────────────────────────────────
export const getOpportunityById = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('customerId', 'name profileImage location rating')
      .lean();

    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    const applicationCount = await Application.countDocuments({ opportunityId: opportunity._id });

    return res.json({
      success: true,
      opportunity: {
        ...opportunity,
        applicationCount
      }
    });
  } catch (err) {
    console.error('[getOpportunityById Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// @desc   Update opportunity (owner customer only)
// @route  PUT /api/opportunities/:id
// @access Protected
// ─────────────────────────────────────────────
export const updateOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    const userId = getUserId(req);
    if (opportunity.customerId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorised to edit this opportunity.' });
    }

    const allowed = ['title', 'description', 'category', 'skills', 'budget', 'budgetType', 'location', 'availability'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) opportunity[field] = req.body[field];
    });

    await opportunity.save();
    return res.json({ success: true, opportunity });
  } catch (err) {
    console.error('[updateOpportunity Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// @desc   Update opportunity status (owner only): open|paused|closed|completed
// @route  PATCH /api/opportunities/:id/status
// @access Protected
// ─────────────────────────────────────────────
export const updateOpportunityStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['open', 'paused', 'closed', 'completed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` });
    }

    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    const userId = getUserId(req);
    if (opportunity.customerId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorised.' });
    }

    opportunity.status = status;
    await opportunity.save();
    return res.json({ success: true, opportunity });
  } catch (err) {
    console.error('[updateOpportunityStatus Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// @desc   Delete opportunity (owner only, only if open/paused)
// @route  DELETE /api/opportunities/:id
// @access Protected
// ─────────────────────────────────────────────
export const deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    const userId = getUserId(req);
    if (opportunity.customerId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorised.' });
    }

    await opportunity.deleteOne();
    return res.json({ success: true, message: 'Opportunity deleted.' });
  } catch (err) {
    console.error('[deleteOpportunity Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// @desc   Get opportunities posted by the logged-in customer (with real application count)
// @route  GET /api/opportunities/my
// @access Protected
// ─────────────────────────────────────────────
export const getMyOpportunities = async (req, res) => {
  try {
    const customerId = getUserId(req);
    const opportunities = await Opportunity.find({ customerId }).sort({ createdAt: -1 }).lean();

    // Fetch real MongoDB application counts
    const oppIds = opportunities.map(o => o._id);
    const appCounts = await Application.aggregate([
      { $match: { opportunityId: { $in: oppIds } } },
      { $group: { _id: '$opportunityId', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    appCounts.forEach(c => {
      countMap[c._id.toString()] = c.count;
    });

    const oppsWithCounts = opportunities.map(o => ({
      ...o,
      applicationCount: countMap[o._id.toString()] || 0
    }));

    return res.json({ success: true, opportunities: oppsWithCounts });
  } catch (err) {
    console.error('[getMyOpportunities Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

