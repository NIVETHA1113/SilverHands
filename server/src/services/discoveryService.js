// Discovery Service Module
// Handles advanced filtering, sorting, and searching for services, products, and providers

/**
 * Build MongoDB query filter for services/products
 * @param {Object} params - Query parameters
 * @returns {Object} MongoDB query object
 */
export const buildListingQuery = (params) => {
  const {
    status = 'published',
    category,
    city,
    minPrice,
    maxPrice,
    search,
    providerId,
    skills,
    deliveryMode,
    availabilityDays
  } = params;

  const query = {};

  // Status filter (always applied for discovery)
  if (status) {
    if (Array.isArray(status)) {
      query.status = { $in: status };
    } else {
      query.status = status;
    }
  }

  // Category filter
  if (category && category !== 'all' && category !== 'All') {
    query.category = category;
  }

  // City filter (case-insensitive)
  if (city && city !== 'All Cities') {
    query['location.city'] = new RegExp(city, 'i');
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Text search (title, description, category, skills)
  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    query.$or = [
      { title: regex },
      { name: regex },
      { description: regex },
      { category: regex },
      { skills: regex }
    ];
  }

  // Provider filter
  if (providerId) {
    query.providerId = providerId;
  }

  // Skills filter (for services)
  if (skills && Array.isArray(skills) && skills.length > 0) {
    query.skills = { $in: skills.map(s => new RegExp(s, 'i')) };
  }

  // Delivery mode filter (for services)
  if (deliveryMode) {
    if (Array.isArray(deliveryMode)) {
      query.deliveryMode = { $in: deliveryMode };
    } else {
      query.deliveryMode = deliveryMode;
    }
  }

  // Availability filter (for services)
  if (availabilityDays && Array.isArray(availabilityDays) && availabilityDays.length > 0) {
    query['availability.days'] = { $in: availabilityDays };
  }

  return query;
};

/**
 * Build MongoDB sort options
 * @param {string} sort - Sort option
 * @param {boolean} hasRelevanceScore - Whether relevance score is available
 * @returns {Object} MongoDB sort object
 */
export const buildSortOption = (sort, hasRelevanceScore = false) => {
  switch (sort) {
    case 'price_asc':
      return { price: 1 };
    case 'price_desc':
      return { price: -1 };
    case 'newest':
      return { createdAt: -1 };
    case 'experience':
      return { 'skills.experienceYears': -1, createdAt: -1 };
    case 'rating':
      return { rating: -1, createdAt: -1 };
    case 'relevance':
    default:
      // Relevance: by rating first, then newest
      if (hasRelevanceScore) {
        return { score: { $meta: 'textScore' } };
      }
      return { rating: -1, createdAt: -1 };
  }
};

/**
 * Build provider discovery query
 * @param {Object} params - Query parameters
 * @returns {Object} MongoDB query object
 */
export const buildProviderQuery = (params) => {
  const { search, city, skill, language, hasPublishedContent } = params;

  const query = {
    role: 'provider'
  };

  // Filter for providers with completed onboarding or skills
  if (hasPublishedContent) {
    query.$or = [
      { 'onboarding.completed': true },
      { skills: { $exists: true, $not: { $size: 0 } } }
    ];
  }

  // City filter
  if (city && city !== 'All Cities') {
    query['location.city'] = new RegExp(city, 'i');
  }

  // Skill filter
  if (skill && skill.trim()) {
    query['skills.name'] = new RegExp(skill, 'i');
  }

  // Language filter
  if (language && language.trim()) {
    query.languages = new RegExp(language, 'i');
  }

  // Text search (name, bio, skills, city)
  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    query.$and = [
      {
        $or: [
          { name: regex },
          { bio: regex },
          { 'skills.name': regex },
          { 'location.city': regex }
        ]
      }
    ];
  }

  return query;
};

/**
 * Filter in-memory listings (fallback when MongoDB is offline)
 * @param {Array} list - Array of listings
 * @param {Object} params - Filter parameters
 * @returns {Array} Filtered listings
 */
export const filterInMemoryListings = (list, params) => {
  const {
    status,
    category,
    city,
    minPrice,
    maxPrice,
    search,
    skills,
    deliveryMode,
    availabilityDays
  } = params;

  let filtered = list;

  // Status filter
  if (status) {
    const statuses = Array.isArray(status) ? status : [status];
    filtered = filtered.filter(item => statuses.includes(item.status));
  }

  // Category filter
  if (category && category !== 'all' && category !== 'All') {
    filtered = filtered.filter(item => item.category === category);
  }

  // City filter
  if (city && city !== 'All Cities') {
    filtered = filtered.filter(item =>
      item.location?.city?.toLowerCase().includes(city.toLowerCase())
    );
  }

  // Price filter
  if (minPrice) {
    filtered = filtered.filter(item => item.price >= Number(minPrice));
  }
  if (maxPrice) {
    filtered = filtered.filter(item => item.price <= Number(maxPrice));
  }

  // Search filter
  if (search && search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(item =>
      item.title?.toLowerCase().includes(q) ||
      item.name?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      (item.skills && item.skills.some(s => s.toLowerCase?.().includes(q)))
    );
  }

  // Skills filter
  if (skills && Array.isArray(skills) && skills.length > 0) {
    filtered = filtered.filter(item =>
      item.skills &&
      skills.some(s =>
        item.skills.some(itemSkill =>
          (typeof itemSkill === 'string' ? itemSkill : itemSkill.name)
            .toLowerCase()
            .includes(s.toLowerCase())
        )
      )
    );
  }

  // Delivery mode filter
  if (deliveryMode) {
    const modes = Array.isArray(deliveryMode) ? deliveryMode : [deliveryMode];
    filtered = filtered.filter(item =>
      item.deliveryMode && item.deliveryMode.some(m => modes.includes(m))
    );
  }

  // Availability filter
  if (availabilityDays && Array.isArray(availabilityDays) && availabilityDays.length > 0) {
    filtered = filtered.filter(item =>
      item.availability?.days &&
      availabilityDays.some(day => item.availability.days.includes(day))
    );
  }

  return filtered;
};

/**
 * Filter providers in-memory (fallback when MongoDB is offline)
 * @param {Array} providers - Array of provider objects
 * @param {Object} params - Filter parameters
 * @returns {Array} Filtered providers
 */
export const filterInMemoryProviders = (providers, params) => {
  const { search, city, skill, language } = params;

  let filtered = providers.filter(p => p.role === 'provider');

  // City filter
  if (city && city !== 'All Cities') {
    filtered = filtered.filter(p =>
      p.location?.city?.toLowerCase().includes(city.toLowerCase())
    );
  }

  // Skill filter
  if (skill && skill.trim()) {
    const q = skill.toLowerCase();
    filtered = filtered.filter(p =>
      p.skills && p.skills.some(s => s.name?.toLowerCase().includes(q))
    );
  }

  // Language filter
  if (language && language.trim()) {
    const q = language.toLowerCase();
    filtered = filtered.filter(p =>
      p.languages && p.languages.some(l => l.toLowerCase().includes(q))
    );
  }

  // Search filter
  if (search && search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.bio?.toLowerCase().includes(q) ||
      p.location?.city?.toLowerCase().includes(q) ||
      (p.skills && p.skills.some(s => s.name?.toLowerCase().includes(q)))
    );
  }

  return filtered;
};

/**
 * Format pagination response
 * @param {Object} options - Options
 * @returns {Object} Formatted response object
 */
export const formatResponse = ({
  success,
  data,
  count,
  total,
  page,
  limit,
  query = null
}) => {
  const pages = Math.ceil(total / limit) || 1;
  const response = {
    success,
    count,
    total,
    page: parseInt(page, 10),
    pages
  };

  if (query !== null) {
    response.query = query;
  }

  // Add the appropriate data key based on context
  if (Array.isArray(data)) {
    if (data[0]?.skills && data[0]?.experienceYears !== undefined) {
      response.providers = data;
    } else if (data[0]?.price !== undefined && data[0]?.name) {
      response.products = data;
    } else if (data[0]?.price !== undefined) {
      response.services = data;
    } else {
      response.results = data;
    }
  }

  return response;
};

/**
 * Validate and normalize pagination parameters
 * @param {string|number} page - Page number
 * @param {string|number} limit - Items per page
 * @returns {Object} Normalized pagination params
 */
export const normalizePagination = (page, limit) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  return { pageNum, limitNum, skip };
};
