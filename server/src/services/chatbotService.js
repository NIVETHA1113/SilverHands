import Service from '../models/Service.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';
import { rankProviders } from './matchingService.js';
import { buildProviderQuery, buildListingQuery } from './discoveryService.js';
import { aiExtractRequirement } from './aiProvider.js';

// Pre-defined Platform Navigation Map (Only real existing routes)
const NAV_MAP = [
  { keywords: ['applications', 'my applications'], route: '/applications/my', label: 'My Applications' },
  { keywords: ['explore', 'marketplace', 'search services', 'browse'], route: '/explore', label: 'Explore Marketplace' },
  { keywords: ['my services', 'provider services', 'service listings', 'add service'], route: '/provider/services', label: 'My Services' },
  { keywords: ['my products', 'provider products', 'product listings', 'add product'], route: '/provider/products', label: 'My Products' },
  { keywords: ['dashboard', 'home', 'overview'], route: '/dashboard', label: 'Dashboard' },
  { keywords: ['onboard', 'onboarding', 'complete profile', 'profile setup'], route: '/onboarding', label: 'Provider Onboarding' },
  { keywords: ['opportunities', 'customer opportunities', 'find work', 'jobs'], route: '/opportunities', label: 'View Opportunities' }
];

// Platform Guidance Knowledge Base
const HELP_KNOWLEDGE_BASE = [
  {
    patterns: ['become provider', 'register provider', 'offer skills', 'start earning', 'join as provider'],
    answer: 'To become a Skill Provider on SilverHands: Register as a Skill Provider, complete the 6-step onboarding wizard to add your skills and location, then click "Add Service" or "Add Product" on your dashboard to publish your offerings!'
  },
  {
    patterns: ['how matching works', 'match score', 'intelligent matching', 'why recommended'],
    answer: 'SilverHands uses an intelligent deterministic matching engine. Matches are scored based on 4 criteria: Skill compatibility (50%), Location proximity (25%), Availability fit (15%), and Verified provider rating (10%).'
  },
  {
    patterns: ['add service', 'stitch blouse', 'tuition', 'cooking class', 'offer service'],
    answer: 'You can offer a service by navigating to "My Services" on your dashboard and clicking "+ Offer a New Service". Fill in the title, category, price structure, and click Publish!'
  },
  {
    patterns: ['sell product', 'pickle', 'handmade bag', 'add product'],
    answer: 'You can sell handmade products by navigating to "My Products" on your dashboard and clicking "+ Add a Product". Enter product details, inventory stock, and price to start selling!'
  },
  {
    patterns: ['edit profile', 'change location', 'update skills', 'change phone'],
    answer: 'To edit your profile details or add new skills, go to your Dashboard or re-visit Onboarding to update your skills, availability, and location anytime.'
  }
];

/**
 * Classify Intent from user query
 */
export const classifyIntent = (text) => {
  if (!text || typeof text !== 'string') return 'GENERAL_CONVERSATION';
  const lower = text.toLowerCase().trim();

  // Check Navigation
  if (
    lower.includes('show my') ||
    lower.includes('see my') ||
    lower.includes('view my') ||
    lower.includes('go to') ||
    lower.includes('take me to') ||
    lower.includes('open my') ||
    lower.includes('my applications') ||
    lower.includes('my opportunities')
  ) {
    return 'NAVIGATION';
  }

  // Check Platform Help
  if (lower.includes('how do i') || lower.includes('how can i') || lower.includes('how does') || lower.includes('what is silverhands')) {
    return 'PLATFORM_HELP';
  }

  // Check Product Intent
  if (lower.includes('pickle') || lower.includes('product') || lower.includes('buy') || lower.includes('snack') || lower.includes('bag') || lower.includes('craft') || lower.includes('decor') || lower.includes('item')) {
    return 'PRODUCT_SEARCH';
  }

  // Check Matching Request Intent (has budget, city, or detailed requirement)
  if (lower.includes('under') || lower.includes('budget') || lower.includes('per session') || lower.includes('per hour') || lower.includes('tutor in') || lower.includes('cook in') || lower.includes('tailor in') || lower.includes('nearby')) {
    return 'MATCHING_REQUEST';
  }

  // Check Service Intent
  if (lower.includes('service') || lower.includes('stitch') || lower.includes('tailor') || lower.includes('cook') || lower.includes('tuition') || lower.includes('tutor') || lower.includes('teach') || lower.includes('garden') || lower.includes('music')) {
    return 'SERVICE_SEARCH';
  }

  // Check Provider Intent
  if (lower.includes('provider') || lower.includes('who can') || lower.includes('person') || lower.includes('senior') || lower.includes('homemaker')) {
    return 'PROVIDER_SEARCH';
  }

  return 'GENERAL_CONVERSATION';
};

/**
 * Extract structured requirements (budget, city, skill, category)
 */
export const extractRequirements = async (text) => {
  const lower = text.toLowerCase();
  
  // Extract budget
  let budget = null;
  const budgetMatch = lower.match(/(?:under|below|max|within|budget of|₹|\$)?\s*(\d{3,5})\s*(?:rs|rupees|inr|\/|\s*per)?/i);
  if (budgetMatch) {
    budget = parseInt(budgetMatch[1], 10);
  }

  // Extract city
  let city = null;
  const cities = ['chennai', 'bangalore', 'coimbatore', 'madurai', 'hyderabad', 'mumbai', 'delhi'];
  for (const c of cities) {
    if (lower.includes(c)) {
      city = c.charAt(0).toUpperCase() + c.slice(1);
      break;
    }
  }

  // AI Extraction for category & skill
  const aiReq = await aiExtractRequirement(text);

  return {
    category: aiReq.category || 'General',
    skills: aiReq.skills || [],
    location: { city },
    city,
    budget,
    availability: aiReq.availability || ['Flexible'],
    locationPreference: aiReq.locationPreference || 'Nearby'
  };
};

/**
 * Main Chatbot Process Message Handler
 */
export const processChatbotMessage = async ({ message, userContext = null }) => {
  if (!message || !message.trim()) {
    return {
      success: false,
      message: 'Please type a message to chat with SilverHands Assistant.',
      intent: 'GENERAL_CONVERSATION',
      results: [],
      suggestions: ['Find a service', 'Find a product', 'How does SilverHands work?']
    };
  }

  const cleanMessage = message.trim();
  const intent = classifyIntent(cleanMessage);
  const reqs = await extractRequirements(cleanMessage);

  // 1. NAVIGATION INTENT
  if (intent === 'NAVIGATION') {
    const lower = cleanMessage.toLowerCase();
    const matchedNav = NAV_MAP.find(n => n.keywords.some(k => lower.includes(k))) || NAV_MAP[0];

    return {
      success: true,
      intent: 'NAVIGATION',
      text: `I can take you directly to ${matchedNav.label}. Click the button below to navigate.`,
      resultType: 'NONE',
      results: [],
      action: { type: 'NAVIGATE', route: matchedNav.route, label: matchedNav.label },
      suggestions: ['Explore Marketplace', 'My Services', 'How does matching work?']
    };
  }

  // 2. PLATFORM HELP INTENT
  if (intent === 'PLATFORM_HELP') {
    const lower = cleanMessage.toLowerCase();
    const matchedHelp = HELP_KNOWLEDGE_BASE.find(h => h.patterns.some(p => lower.includes(p)));
    const answerText = matchedHelp
      ? matchedHelp.answer
      : 'SilverHands connects senior citizens and homemakers in India with local customers seeking trusted traditional skills, tutoring, tailoring, cooking, and handmade crafts. You can explore services or register as a provider to publish offerings!';

    return {
      success: true,
      intent: 'PLATFORM_HELP',
      text: answerText,
      resultType: 'NONE',
      results: [],
      action: lower.includes('provider') ? { type: 'NAVIGATE', route: '/onboarding', label: 'Start Provider Onboarding' } : null,
      suggestions: ['How does matching work?', 'Find a service for me', 'Sell a product']
    };
  }

  // 3. SERVICE SEARCH INTENT
  if (intent === 'SERVICE_SEARCH') {
    if (isDbConnected) {
      const query = { status: 'published' };
      if (reqs.category && reqs.category !== 'General') query.category = new RegExp(reqs.category, 'i');
      if (reqs.city) query['location.city'] = new RegExp(reqs.city, 'i');
      if (reqs.budget) query.price = { $lte: reqs.budget };

      const regex = new RegExp(cleanMessage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { title: regex },
        { description: regex },
        { category: regex },
        { skills: regex }
      ];

      let services = await Service.find(query).populate('providerId', 'name profileImage location rating').limit(4);

      // If strict filter yielded empty, broaden search to title/category
      if (services.length === 0) {
        delete query.$or;
        delete query.price;
        services = await Service.find(query).populate('providerId', 'name profileImage location rating').limit(4);
      }

      if (services.length === 0) {
        return {
          success: true,
          intent: 'SERVICE_SEARCH',
          text: `I couldn't find any published services matching "${cleanMessage}". Would you like to check all available services in Explore?`,
          resultType: 'NONE',
          results: [],
          action: { type: 'NAVIGATE', route: '/explore?tab=services', label: 'Explore All Services' },
          suggestions: ['Explore Services', 'Find a Product', 'How to offer a service?']
        };
      }

      return {
        success: true,
        intent: 'SERVICE_SEARCH',
        text: `I found ${services.length} published service${services.length > 1 ? 's' : ''} matching your search:`,
        resultType: 'SERVICE_RESULTS',
        results: services.map(s => ({
          id: s._id,
          title: s.title,
          category: s.category,
          price: s.price,
          priceType: s.priceType,
          description: s.description,
          city: s.location?.city || s.providerId?.location?.city || 'Chennai',
          providerName: s.providerId?.name || 'Skill Provider',
          providerImage: s.providerId?.profileImage || '',
          rating: s.providerId?.rating || 4.8
        })),
        suggestions: ['Filter by city', 'Find products instead', 'How does matching work?']
      };
    }
  }

  // 4. PRODUCT SEARCH INTENT
  if (intent === 'PRODUCT_SEARCH') {
    if (isDbConnected) {
      const query = { status: { $in: ['published', 'out_of_stock'] } };
      if (reqs.city) query['location.city'] = new RegExp(reqs.city, 'i');
      if (reqs.budget) query.price = { $lte: reqs.budget };

      const regex = new RegExp(cleanMessage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { name: regex },
        { description: regex },
        { category: regex }
      ];

      let products = await Product.find(query).populate('providerId', 'name profileImage location rating').limit(4);

      if (products.length === 0) {
        delete query.$or;
        products = await Product.find({ status: 'published' }).populate('providerId', 'name profileImage location rating').limit(4);
      }

      if (products.length === 0) {
        return {
          success: true,
          intent: 'PRODUCT_SEARCH',
          text: `I couldn't find any handmade products matching "${cleanMessage}". Check out all products on Explore!`,
          resultType: 'NONE',
          results: [],
          action: { type: 'NAVIGATE', route: '/explore?tab=products', label: 'Explore Products' },
          suggestions: ['Explore Products', 'Find a Service']
        };
      }

      return {
        success: true,
        intent: 'PRODUCT_SEARCH',
        text: `Here are ${products.length} handmade product${products.length > 1 ? 's' : ''} available on SilverHands:`,
        resultType: 'PRODUCT_RESULTS',
        results: products.map(p => ({
          id: p._id,
          name: p.name,
          category: p.category,
          price: p.price,
          unit: p.unit,
          quantity: p.quantity,
          isOutOfStock: p.quantity === 0 || p.status === 'out_of_stock',
          city: p.location?.city || p.providerId?.location?.city || 'Chennai',
          providerName: p.providerId?.name || 'Craft Artisan',
          image: p.images?.[0] || ''
        })),
        suggestions: ['Explore Products', 'Find a Service']
      };
    }
  }

  // 5. MATCHING_REQUEST & PROVIDER_SEARCH INTENTS (REAL MATCHING ENGINE INTEGRATION)
  if (intent === 'MATCHING_REQUEST' || intent === 'PROVIDER_SEARCH') {
    if (isDbConnected) {
      const providerQuery = buildProviderQuery({ hasPublishedContent: true });
      if (reqs.city) providerQuery['location.city'] = new RegExp(reqs.city, 'i');

      const providers = await User.find(providerQuery).select('-password -email -phone').lean();

      if (providers.length > 0) {
        const requirement = {
          skills: reqs.skills.length > 0 ? reqs.skills : [reqs.category],
          location: { city: reqs.city },
          availability: reqs.availability
        };

        const rankedMatches = rankProviders(providers, requirement).slice(0, 3);

        return {
          success: true,
          intent: 'MATCHING_REQUEST',
          text: `I analyzed your requirement using our intelligent matching engine. Here are the top matched providers:`,
          resultType: 'MATCH_RESULTS',
          results: rankedMatches.map(m => ({
            id: m.provider._id,
            name: m.provider.name,
            matchScore: m.matchScore,
            rating: m.provider.rating || 4.8,
            city: m.provider.location?.city || 'Chennai',
            skills: m.provider.skills?.map(s => s.name) || [],
            reasons: m.reasons || [],
            breakdown: m.breakdown,
            profileImage: m.provider.profileImage || ''
          })),
          suggestions: ['Why is this provider recommended?', 'Explore all providers', 'Find a product']
        };
      }
    }
  }

  // 6. GENERAL CONVERSATION FALLBACK
  return {
    success: true,
    intent: 'GENERAL_CONVERSATION',
    text: `👋 Hi! I'm your SilverHands Assistant. I can help you find trusted local services (tailoring, tutoring, traditional cooking), handmade products, or connect with verified senior skill providers. What are you looking for today?`,
    resultType: 'NONE',
    results: [],
    suggestions: [
      'Find a math tutor in Chennai',
      'I need traditional blouse stitching',
      'Show me homemade pickles',
      'How does matching work?'
    ]
  };
};
