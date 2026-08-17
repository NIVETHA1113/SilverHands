import Service from '../models/Service.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Opportunity from '../models/Opportunity.js';
import Application from '../models/Application.js';
import Review from '../models/Review.js';
import { isDbConnected } from '../config/db.js';
import { rankProviders, buildMatchResult } from './matchingService.js';
import { buildProviderQuery, buildListingQuery } from './discoveryService.js';
import { aiExtractRequirement, aiExplainMatch, aiGenerateCopilotGuidance } from './aiProvider.js';
import { analyzeProviderSkillGaps } from './skillGapService.js';

// Pre-defined Platform Navigation Map
const NAV_MAP = [
  { keywords: ['applications', 'my applications'], route: '/applications/my', label: 'My Applications' },
  { keywords: ['explore', 'marketplace', 'search services', 'browse'], route: '/explore', label: 'Explore Marketplace' },
  { keywords: ['my services', 'provider services', 'service listings', 'add service'], route: '/provider/services', label: 'My Services' },
  { keywords: ['my products', 'provider products', 'product listings', 'add product'], route: '/provider/products', label: 'My Products' },
  { keywords: ['dashboard', 'home', 'overview'], route: '/provider/dashboard', label: 'Livelihood Dashboard' },
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

// Server-side calculation of profile completeness
const computeProfileScore = (user = {}) => {
  let score = 0;
  if (!user) return score;
  if (user.profileImage) score += 20;
  if (user.bio && typeof user.bio === 'string' && user.bio.trim().length > 10) score += 20;
  if (user.location?.city) score += 20;
  if (user.verification?.phoneVerified || user.phone) score += 20;
  if (user.languages && Array.isArray(user.languages) && user.languages.length > 0) score += 20;
  return score;
};

/**
 * Classify Intent from user query with Robust Provider Conversational Pattern Matching
 */
export const classifyIntent = (text, isProvider = false) => {
  if (!text || typeof text !== 'string') return 'GENERAL_CONVERSATION';
  const lower = text.toLowerCase().trim();

  if (isProvider) {
    // 1. Skill Gap / Learn Skill Intent
    if (
      lower.includes('skill should i learn') ||
      lower.includes('which skill') ||
      lower.includes('what skill') ||
      lower.includes('what am i missing') ||
      lower.includes('skills am i missing') ||
      lower.includes('close my skill gaps') ||
      lower.includes('skill gap') ||
      lower.includes('what should i learn') ||
      lower.includes('skill would help') ||
      lower.includes('skill will improve') ||
      lower.includes('eligible for more opportunities') ||
      lower.includes('skills do i need') ||
      lower.includes('improve to qualify')
    ) {
      return 'COPILOT_SKILL_GAPS';
    }

    // 2. Next Best Action Intent
    if (
      lower.includes('next best action') ||
      lower.includes('what should i do next') ||
      lower.includes('what to focus on') ||
      lower.includes("what's my next best action") ||
      lower.includes('what should i focus on')
    ) {
      return 'COPILOT_NEXT_BEST_ACTION';
    }

    // 3. Provider Conversational Livelihood & Business Growth Intent
    if (
      lower.includes('will my business improve') ||
      lower.includes('will i get more customers') ||
      lower.includes('how can i get more customers') ||
      lower.includes('can i get more work') ||
      lower.includes('how can i grow my business') ||
      lower.includes('what can i do to improve') ||
      lower.includes('am i doing well') ||
      lower.includes('am i doing okay') ||
      lower.includes('can i do better') ||
      lower.includes('become more successful') ||
      lower.includes('will adding another skill help') ||
      lower.includes('what should i do to get more clients') ||
      lower.includes('can i get more opportunities') ||
      lower.includes('how do i improve my chances') ||
      lower.includes('what can i do better') ||
      lower.includes('what should i do with my skills') ||
      lower.includes('will publishing a service help') ||
      lower.includes('business improve') ||
      lower.includes('get more clients') ||
      lower.includes('will this help me') ||
      lower.includes('what about my business') ||
      lower.includes('what should i do') ||
      lower.includes('improve then') ||
      lower.includes('will it improve') ||
      lower.includes('why am i not getting work') ||
      lower.includes('why am i not getting opportunities') ||
      lower.includes('more opportunities') ||
      lower.includes('more work') ||
      lower.includes('get more jobs') ||
      lower.includes('improve my business') ||
      lower.includes('how to get more work')
    ) {
      return 'COPILOT_CONVERSATIONAL_LIVELIHOOD';
    }

    // 4. Best Opportunities Intent
    if (
      lower.includes('best opportunities') ||
      lower.includes('my best opportunities') ||
      lower.includes('opportunities for me') ||
      lower.includes('jobs for me') ||
      lower.includes('show me my opportunities')
    ) {
      return 'COPILOT_BEST_OPPORTUNITIES';
    }

    // 5. Improve Profile Intent
    if (
      lower.includes('improve my profile') ||
      lower.includes('strengthen profile') ||
      lower.includes('profile score') ||
      lower.includes('complete profile')
    ) {
      return 'COPILOT_IMPROVE_PROFILE';
    }

    // 6. Snapshot & Status Intent
    if (
      lower.includes('how am i doing') ||
      lower.includes('my status') ||
      lower.includes('my snapshot') ||
      lower.includes('my dashboard')
    ) {
      return 'COPILOT_HOW_AM_I_DOING';
    }

    // 7. Strongest Skills Intent
    if (
      lower.includes('strongest skills') ||
      lower.includes('my skills') ||
      lower.includes('what are my skills')
    ) {
      return 'COPILOT_STRONGEST_SKILLS';
    }
  }

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

  // Check Matching Request Intent
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
  
  let budget = null;
  const budgetMatch = lower.match(/(?:under|below|max|within|budget of|₹|\$)?\s*(\d{3,5})\s*(?:rs|rupees|inr|\/|\s*per)?/i);
  if (budgetMatch) {
    budget = parseInt(budgetMatch[1], 10);
  }

  let city = null;
  const cities = ['chennai', 'bangalore', 'coimbatore', 'madurai', 'hyderabad', 'mumbai', 'delhi'];
  for (const c of cities) {
    if (lower.includes(c)) {
      city = c.charAt(0).toUpperCase() + c.slice(1);
      break;
    }
  }

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
 * Assemble Grounded Provider Context from Real Database Records
 */
const getGroundedProviderContext = async (providerId) => {
  let providerDoc = null;
  let activeServicesCount = 0;
  let activeProductsCount = 0;
  let applicationsStats = { total: 0, pending: 0, accepted: 0, completed: 0 };
  let trustStats = { avgRating: 4.8, totalReviews: 0 };
  let skillGapAnalysis = null;

  if (isDbConnected) {
    providerDoc = await User.findById(providerId).select('-password').lean();
    if (providerDoc) {
      const [servicesCount, productsCount, appList, reviewList] = await Promise.all([
        Service.countDocuments({ providerId, status: 'published' }),
        Product.countDocuments({ providerId, status: { $in: ['published', 'out_of_stock'] } }),
        Application.find({ providerId }).lean(),
        Review.find({ providerId }).lean()
      ]);

      activeServicesCount = servicesCount;
      activeProductsCount = productsCount;

      appList.forEach(a => {
        applicationsStats.total += 1;
        if (a.status === 'pending') applicationsStats.pending += 1;
        if (a.status === 'accepted') applicationsStats.accepted += 1;
        if (a.status === 'completed') applicationsStats.completed += 1;
      });

      if (reviewList.length > 0) {
        const sum = reviewList.reduce((acc, r) => acc + (r.rating || 5), 0);
        trustStats.avgRating = parseFloat((sum / reviewList.length).toFixed(1));
        trustStats.totalReviews = reviewList.length;
      }
    }
  }

  if (!providerDoc) {
    providerDoc = {
      _id: providerId,
      name: 'Skill Provider',
      skills: [{ name: 'Tailoring' }, { name: 'Embroidery' }],
      location: { city: 'Chennai' }
    };
  }

  try {
    skillGapAnalysis = await analyzeProviderSkillGaps(providerId);
  } catch (err) {
    console.warn('[Copilot Context Warning]: Skill gap analysis skipped -', err.message);
  }

  const profileScore = computeProfileScore(providerDoc);

  // Deterministic Next Best Action Priority Calculation
  let nextBestAction = null;

  if (profileScore < 75) {
    nextBestAction = {
      id: 'COMPLETE_PROFILE',
      title: 'Complete Your Provider Profile',
      why: `Your profile is currently ${profileScore}% complete. Adding missing details like bio, photo, or location will increase customer trust.`,
      recommendation: 'Complete your profile details to improve visibility.',
      action: { type: 'NAVIGATE', route: '/onboarding', label: 'Complete Profile' }
    };
  } else if (skillGapAnalysis?.topSkillGaps && skillGapAnalysis.topSkillGaps.length > 0) {
    const topGap = skillGapAnalysis.topSkillGaps[0];
    nextBestAction = {
      id: 'EXPLORE_SKILL_GAP',
      title: `Explore ${topGap.skillName}`,
      why: `"${topGap.skillName}" is a recurring missing requirement across ${topGap.count} near-match opportunities on SilverHands.`,
      recommendation: `Developing "${topGap.skillName}" will strengthen your eligibility for ${topGap.count} additional opportunities.`,
      action: { type: 'NAVIGATE', route: '/provider/dashboard', label: 'View Skill Gap Analysis' }
    };
  } else if (skillGapAnalysis?.readyNow && skillGapAnalysis.readyNow.length > 0 && applicationsStats.total < skillGapAnalysis.readyNow.length) {
    nextBestAction = {
      id: 'APPLY_TO_MATCHES',
      title: 'Apply to Your Strongest Opportunity Matches',
      why: `You currently qualify for ${skillGapAnalysis.readyNow.length} open opportunities on SilverHands.`,
      recommendation: 'Submit applications to your top matches to secure work.',
      action: { type: 'NAVIGATE', route: '/opportunities', label: 'View Opportunities' }
    };
  } else if (activeServicesCount === 0) {
    nextBestAction = {
      id: 'CREATE_SERVICE',
      title: 'Offer Your First Service Listing',
      why: 'You have registered skills, but haven\'t published an active service listing yet.',
      recommendation: 'Create a service around your primary skill so customers can discover you.',
      action: { type: 'NAVIGATE', route: '/provider/services/new', label: '+ Create Service' }
    };
  } else {
    nextBestAction = {
      id: 'MAINTAIN_LIVELIHOOD',
      title: 'Maintain Platform Activity',
      why: 'Your profile, skills, and offerings are active and well-aligned.',
      recommendation: 'Keep checking for new opportunities and maintain high rating response times.',
      action: { type: 'NAVIGATE', route: '/provider/dashboard', label: 'View Dashboard' }
    };
  }

  return {
    provider: {
      id: providerDoc._id,
      name: providerDoc.name,
      skills: providerDoc.skills || [],
      location: providerDoc.location,
      profileScore
    },
    servicesCount: activeServicesCount,
    productsCount: activeProductsCount,
    applications: applicationsStats,
    trust: trustStats,
    skillGapAnalysis,
    nextBestAction
  };
};

/**
 * Main Chatbot & Copilot Process Message Handler
 */
export const processChatbotMessage = async ({ message, userContext = null }) => {
  if (!message || !message.trim()) {
    return {
      success: false,
      message: 'Please type a message to chat with SilverHands Copilot.',
      intent: 'GENERAL_CONVERSATION',
      results: [],
      suggestions: ['Find a service', 'How does SilverHands work?']
    };
  }

  const cleanMessage = message.trim();
  const isProvider = userContext && userContext.role === 'provider';
  const providerId = userContext?.userId || userContext?._id;

  const intent = classifyIntent(cleanMessage, isProvider);

  // 🤖 PROVIDER COPILOT INTENTS
  if (isProvider && providerId) {
    // If the provider's intent is NOT an explicit customer search query (buying/searching product/service)
    const isCustomerSearchIntent = ['SERVICE_SEARCH', 'PRODUCT_SEARCH', 'MATCHING_REQUEST'].includes(intent);

    if (!isCustomerSearchIntent) {
      const context = await getGroundedProviderContext(providerId);
      const primarySkill = context.provider.skills?.[0]?.name || 'your primary skill';

      // 1. NEXT BEST ACTION
      if (intent === 'COPILOT_NEXT_BEST_ACTION') {
        const nba = context.nextBestAction;
        return {
          success: true,
          intent: 'COPILOT_NEXT_BEST_ACTION',
          text: `🤖 **Your Next Best Action:** ${nba.title}\n\n**Why?** ${nba.why}\n\n**Recommendation:** ${nba.recommendation}`,
          resultType: 'NONE',
          results: [],
          action: nba.action,
          suggestions: ['🎯 Find my best opportunities', '🧠 What skill should I learn?', '✨ Improve my profile']
        };
      }

      // 2. SKILL GAPS / REASONED SKILL RECOMMENDATION
      if (intent === 'COPILOT_SKILL_GAPS') {
        const gaps = context.skillGapAnalysis?.topSkillGaps || [];

        if (gaps.length > 0) {
          const topGap = gaps[0];
          const adviceText = `Based on your current near-match opportunities, **${topGap.skillName}** is the most relevant skill to develop.\n\n**Why:** Several opportunities already align with your ${primarySkill} experience, but require **${topGap.skillName}** as an additional skill.\n\nDeveloping **${topGap.skillName}** could make you eligible for **${topGap.count}** additional relevant opportunity(ies) on SilverHands.`;

          return {
            success: true,
            intent: 'COPILOT_SKILL_GAPS',
            text: adviceText,
            resultType: 'NONE',
            results: [],
            action: { type: 'NAVIGATE', route: '/provider/dashboard', label: 'Explore Skill Gap' },
            suggestions: ['🚀 What\'s my next best action?', '🎯 Find my best opportunities']
          };
        }

        const zeroGapText = `I don't currently have enough relevant opportunity data in your area to identify a specific skill for you to learn. Your strongest current skill is **${primarySkill}**.\n\nCreating an active service listing around your experience will help local customers discover and invite you directly on SilverHands.`;

        return {
          success: true,
          intent: 'COPILOT_SKILL_GAPS',
          text: zeroGapText,
          resultType: 'NONE',
          results: [],
          action: { type: 'NAVIGATE', route: '/provider/services/new', label: '+ Create Service' },
          suggestions: ['🚀 What\'s my next best action?', '🎯 Find my best opportunities']
        };
      }

      // 3. BEST OPPORTUNITIES
      if (intent === 'COPILOT_BEST_OPPORTUNITIES') {
        const readyNow = context.skillGapAnalysis?.readyNow || [];
        const almostThere = context.skillGapAnalysis?.almostThere || [];

        if (readyNow.length > 0) {
          return {
            success: true,
            intent: 'COPILOT_BEST_OPPORTUNITIES',
            text: `You have **${readyNow.length} strong match(es)** ready for you:`,
            resultType: 'MATCH_RESULTS',
            results: readyNow.slice(0, 3).map(o => ({
              id: o.id,
              name: o.title,
              matchScore: o.matchScore,
              rating: 5.0,
              city: o.city,
              skills: o.matchedSkills || [],
              reasons: o.reasons || [`Matches required skills in ${o.category}`],
              profileImage: o.customerImage || ''
            })),
            action: { type: 'NAVIGATE', route: '/opportunities', label: 'View All Opportunities' },
            suggestions: ['🚀 What\'s my next best action?', '🧠 What skill should I learn?']
          };
        }

        if (almostThere.length > 0) {
          return {
            success: true,
            intent: 'COPILOT_BEST_OPPORTUNITIES',
            text: `You currently have **0 strong matches**, but you have **${almostThere.length} near-match opportunity(ies)**. Check out what skills can unlock them!`,
            resultType: 'NONE',
            results: [],
            action: { type: 'NAVIGATE', route: '/provider/dashboard', label: 'View Skill Gap Analysis' },
            suggestions: ['🔓 Show my skill gaps', '🚀 What\'s my next best action?']
          };
        }

        return {
          success: true,
          intent: 'COPILOT_BEST_OPPORTUNITIES',
          text: 'No matching opportunities found right now in your area. Publish an active service listing to become discoverable to customers!',
          resultType: 'NONE',
          results: [],
          action: { type: 'NAVIGATE', route: '/provider/services/new', label: '+ Create Service' },
          suggestions: ['🚀 What\'s my next best action?', '✨ Improve my profile']
        };
      }

      // 4. IMPROVE PROFILE
      if (intent === 'COPILOT_IMPROVE_PROFILE') {
        const score = context.provider.profileScore;
        return {
          success: true,
          intent: 'COPILOT_IMPROVE_PROFILE',
          text: `Your profile score is currently **${score}%**. To improve your profile:\n\n• Add a professional profile photo\n• Write a detailed bio (>10 words)\n• Ensure your city and phone verification are set\n• List all your spoken languages`,
          resultType: 'NONE',
          results: [],
          action: { type: 'NAVIGATE', route: '/onboarding', label: 'Edit Profile & Onboarding' },
          suggestions: ['🚀 What\'s my next best action?', '🎯 Find my best opportunities']
        };
      }

      // 5. HOW AM I DOING / SNAPSHOT
      if (intent === 'COPILOT_HOW_AM_I_DOING') {
        const readyCount = context.skillGapAnalysis?.summary?.readyCount || 0;
        const almostCount = context.skillGapAnalysis?.summary?.almostThereCount || 0;

        const textSnapshot = `🌱 **YOUR SILVERHANDS SNAPSHOT**\n\n• **Profile Completion:** ${context.provider.profileScore}%\n• **Community Rating:** ${context.trust.avgRating}★ (${context.trust.totalReviews} reviews)\n• **Active Services:** ${context.servicesCount}\n• **Active Products:** ${context.productsCount}\n• **Completed Jobs:** ${context.applications.completed}\n• **Strong Matches:** ${readyCount}\n• **Near Matches:** ${almostCount}\n\n**Next Best Action:** ${context.nextBestAction.title}`;

        return {
          success: true,
          intent: 'COPILOT_HOW_AM_I_DOING',
          text: textSnapshot,
          resultType: 'NONE',
          results: [],
          action: context.nextBestAction.action,
          suggestions: ['🚀 What\'s my next best action?', '🧠 What skill should I learn?', '🎯 Find my best opportunities']
        };
      }

      // 6. STRONGEST SKILLS
      if (intent === 'COPILOT_STRONGEST_SKILLS') {
        const skills = context.provider.skills || [];
        const skillStr = skills.map(s => `• **${s.name}** (${s.proficiency || 'Experienced'}, ${s.experienceYears || 5}+ yrs exp)`).join('\n');

        return {
          success: true,
          intent: 'COPILOT_STRONGEST_SKILLS',
          text: `Here are your registered skills on SilverHands:\n\n${skillStr || 'No skills registered yet.'}`,
          resultType: 'NONE',
          results: [],
          action: { type: 'NAVIGATE', route: '/onboarding', label: 'Manage Skills' },
          suggestions: ['🚀 What\'s my next best action?', '🧠 What skill should I learn?']
        };
      }

      // 7. PROVIDER CONVERSATIONAL LIVELIHOOD & GENERAL PROVIDER FALLBACK CATCH-ALL
      // (Guarantees authenticated providers NEVER hit the public "Hi! I'm your SilverHands Assistant" fallback)
      const guidance = await aiGenerateCopilotGuidance({ userMessage: cleanMessage, context });

      return {
        success: true,
        intent: 'COPILOT_CONVERSATIONAL_LIVELIHOOD',
        text: guidance.explanation,
        resultType: 'NONE',
        results: [],
        action: context.nextBestAction.action,
        suggestions: ['🚀 What\'s my next best action?', '🎯 Find my best opportunities', '🧠 What skill should I learn?']
      };
    }
  }

  // 🌐 GENERAL CHATBOT INTENTS (CUSTOMERS & PUBLIC USERS)

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
    const reqs = await extractRequirements(cleanMessage);
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
    const reqs = await extractRequirements(cleanMessage);
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

  // 5. MATCHING_REQUEST & PROVIDER_SEARCH INTENTS
  if (intent === 'MATCHING_REQUEST' || intent === 'PROVIDER_SEARCH') {
    const reqs = await extractRequirements(cleanMessage);
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

  // 6. GENERAL CONVERSATION FALLBACK (For Unauthenticated & Customer Users)
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
