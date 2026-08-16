import User from '../models/User.js';
import Service from '../models/Service.js';
import Product from '../models/Product.js';
import Opportunity from '../models/Opportunity.js';
import Application from '../models/Application.js';
import Review from '../models/Review.js';
import { isDbConnected } from '../config/db.js';
import { buildMatchResult } from '../services/matchingService.js';
import { aiGenerateProfile } from '../services/aiProvider.js';

// @desc    Get Provider Livelihood Dashboard Aggregated Data
// @route   GET /api/providers/dashboard
// @access  Private (Provider Only)
export const getProviderDashboard = async (req, res) => {
  try {
    const providerId = req.user._id || req.user.id;

    let userDoc;
    let services = [];
    let products = [];
    let applications = [];
    let reviews = [];
    let openOpportunities = [];

    if (isDbConnected) {
      userDoc = await User.findById(providerId).select('-password').lean();
      if (!userDoc) {
        return res.status(404).json({ success: false, message: 'Provider profile not found.' });
      }

      services = await Service.find({ providerId }).lean();
      products = await Product.find({ providerId }).lean();
      applications = await Application.find({ providerId })
        .populate('opportunityId', 'title category budget budgetType status location')
        .populate('customerId', 'name profileImage location')
        .lean();
      reviews = await Review.find({ providerId })
        .populate('customerId', 'name profileImage')
        .sort({ createdAt: -1 })
        .lean();

      openOpportunities = await Opportunity.find({ status: 'open' })
        .populate('customerId', 'name profileImage location rating')
        .lean();
    } else {
      userDoc = req.user;
    }

    // ── 1. Profile Completeness Calculation ──────────────────────────
    const missingProfileFields = [];
    let profilePoints = 0;

    const hasPhoto = userDoc.profileImage && !userDoc.profileImage.includes('unsplash.com/photo-1544005313');
    if (hasPhoto) profilePoints += 20;
    else missingProfileFields.push('Add a custom profile photo');

    const hasBio = userDoc.bio && userDoc.bio.trim().length > 10;
    if (hasBio) profilePoints += 20;
    else missingProfileFields.push('Write a professional bio');

    const hasCity = userDoc.location && userDoc.location.city;
    if (hasCity) profilePoints += 20;
    else missingProfileFields.push('Set your location city');

    const hasPhoneVer = userDoc.verification?.phoneVerified;
    if (hasPhoneVer) profilePoints += 20;
    else missingProfileFields.push('Verify your phone number');

    const hasLanguages = userDoc.languages && userDoc.languages.length > 0;
    if (hasLanguages) profilePoints += 20;
    else missingProfileFields.push('Add your spoken languages');

    const profileCompletenessScore = profilePoints;

    // ── 2. Skills Score Calculation ──────────────────────────────────
    const skillsList = userDoc.skills || [];
    let skillsScore = 0;
    if (skillsList.length === 0) skillsScore = 0;
    else if (skillsList.length === 1) skillsScore = 40;
    else if (skillsList.length === 2) skillsScore = 75;
    else skillsScore = 100;

    // ── 3. Platform Offerings Score Calculation ─────────────────────
    const activeServices = services.filter(s => s.status === 'published');
    const activeProducts = products.filter(p => ['published', 'out_of_stock'].includes(p.status));
    const totalListings = activeServices.length + activeProducts.length;

    let offeringsScore = 0;
    if (totalListings === 0) offeringsScore = 0;
    else if (totalListings === 1) offeringsScore = 50;
    else if (totalListings === 2) offeringsScore = 75;
    else offeringsScore = 100;

    // ── 4. Trust & Reputation Score Calculation ─────────────────────
    const ratingValue = userDoc.rating != null ? Number(userDoc.rating) : 4.8;
    const trustScore = Math.min(100, Math.round((ratingValue / 5) * 100));

    // ── 5. Work Activity Score Calculation ──────────────────────────
    const appliedApps = applications;
    const pendingApps = applications.filter(a => a.status === 'pending');
    const acceptedApps = applications.filter(a => a.status === 'accepted');
    const rejectedApps = applications.filter(a => a.status === 'rejected');
    const completedApps = applications.filter(a => a.status === 'completed');

    const totalCompletedOrAccepted = completedApps.length + acceptedApps.length;
    let workScore = 20;
    if (totalCompletedOrAccepted === 0) workScore = 20;
    else if (totalCompletedOrAccepted <= 2) workScore = 60;
    else if (totalCompletedOrAccepted <= 5) workScore = 85;
    else workScore = 100;

    // ── 6. Opportunity Matching Calculation ─────────────────────────
    const matchedOpportunities = openOpportunities.map(opp => {
      const matchResult = buildMatchResult(userDoc, {
        skills: opp.skills?.length > 0 ? opp.skills : [opp.category],
        location: opp.location || {},
        availability: opp.availability || []
      });

      return {
        id: opp._id,
        title: opp.title,
        category: opp.category,
        budget: opp.budget,
        budgetType: opp.budgetType,
        city: opp.location?.city || 'Chennai',
        matchScore: matchResult.matchScore,
        reasons: matchResult.reasons,
        breakdown: matchResult.breakdown,
        customerName: opp.customerId?.name || 'Local Customer',
        createdAt: opp.createdAt
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    const topMatchingOpps = matchedOpportunities.slice(0, 3);
    const totalMatchingCount = matchedOpportunities.filter(m => m.matchScore >= 50).length;

    let matchReadinessScore = 40;
    if (totalMatchingCount === 0) matchReadinessScore = 40;
    else if (totalMatchingCount <= 2) matchReadinessScore = 75;
    else matchReadinessScore = 100;

    // ── 7. Overall Livelihood Score ─────────────────────────────────
    const overallLivelihoodScore = Math.round(
      profileCompletenessScore * 0.20 +
      skillsScore * 0.20 +
      offeringsScore * 0.15 +
      trustScore * 0.15 +
      workScore * 0.15 +
      matchReadinessScore * 0.15
    );

    // ── 8. Estimated Service Value Calculation ──────────────────────
    const acceptedOrCompletedApps = applications.filter(a => ['accepted', 'completed'].includes(a.status));
    const totalEstimatedServiceValue = acceptedOrCompletedApps.reduce((acc, app) => {
      const val = app.proposedPrice != null ? app.proposedPrice : (app.opportunityId?.budget || 0);
      return acc + val;
    }, 0);

    const averageJobValue = acceptedOrCompletedApps.length > 0
      ? Math.round(totalEstimatedServiceValue / acceptedOrCompletedApps.length)
      : 0;

    // ── 9. Growth Suggestions Engine (Data-Backed) ──────────────────
    const growthSuggestions = [];
    if (profileCompletenessScore < 100) {
      growthSuggestions.push({
        id: 'complete_profile',
        title: 'Complete Profile Details',
        description: `Your profile is at ${profileCompletenessScore}%. ${missingProfileFields[0] || 'Add missing details'} to increase customer trust.`,
        actionLabel: 'Complete Profile',
        actionRoute: '/onboarding'
      });
    }

    if (activeServices.length === 0) {
      growthSuggestions.push({
        id: 'add_service',
        title: 'List Your First Service',
        description: 'You have no published services. Turn your skills into offerings to start receiving work requests.',
        actionLabel: 'Add Service',
        actionRoute: '/provider/services/new'
      });
    }

    if (activeProducts.length === 0) {
      growthSuggestions.push({
        id: 'add_product',
        title: 'Add Handmade Products',
        description: 'Publish handmade goods or products to create flexible passive income streams.',
        actionLabel: 'Add Product',
        actionRoute: '/provider/products/new'
      });
    }

    if (totalMatchingCount > 0) {
      growthSuggestions.push({
        id: 'explore_opportunities',
        title: `Apply to ${totalMatchingCount} Matching Opportunities`,
        description: `There are ${totalMatchingCount} open customer opportunities matching your skills and location.`,
        actionLabel: 'Explore Opportunities',
        actionRoute: '/opportunities'
      });
    }

    // ── 10. AI-Powered Growth Insights ──────────────────────────────
    let aiSummaryText = `Your professional profile is active on SilverHands with a Livelihood Score of ${overallLivelihoodScore}/100. You have ${activeServices.length} services published, ${skillsList.length} skills listed, and ${totalMatchingCount} opportunities matching your profile.`;

    try {
      const aiPromptStats = {
        name: userDoc.name,
        livelihoodScore: overallLivelihoodScore,
        profileCompleteness: profileCompletenessScore,
        skillsCount: skillsList.length,
        skills: skillsList.map(s => s.name),
        activeServicesCount: activeServices.length,
        activeProductsCount: activeProducts.length,
        rating: ratingValue,
        completedWorkCount: completedApps.length,
        matchingOpportunitiesCount: totalMatchingCount
      };

      const generatedAI = await aiGenerateProfile(aiPromptStats);
      if (generatedAI && typeof generatedAI === 'string' && generatedAI.trim()) {
        aiSummaryText = generatedAI.trim();
      }
    } catch (e) {
      console.warn('[AI Growth Insight Warning]:', e.message);
    }

    // ── 11. Recent Activity Timeline (Derived from DB) ──────────────
    const recentActivity = [];

    services.slice(0, 2).forEach(s => {
      recentActivity.push({
        type: 'SERVICE_CREATED',
        title: `Published service: "${s.title}"`,
        timestamp: s.createdAt
      });
    });

    products.slice(0, 2).forEach(p => {
      recentActivity.push({
        type: 'PRODUCT_CREATED',
        title: `Added product: "${p.name}"`,
        timestamp: p.createdAt
      });
    });

    applications.slice(0, 3).forEach(a => {
      recentActivity.push({
        type: 'APPLICATION_SUBMITTED',
        title: `Applied to: "${a.opportunityId?.title || 'Customer Opportunity'}" (${a.status})`,
        timestamp: a.createdAt
      });
    });

    reviews.slice(0, 2).forEach(r => {
      recentActivity.push({
        type: 'REVIEW_RECEIVED',
        title: `Received ${r.rating}★ review from ${r.customerId?.name || 'Customer'}`,
        timestamp: r.createdAt
      });
    });

    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // ── 12. Return Aggregated Payload ───────────────────────────────
    return res.json({
      success: true,
      provider: {
        id: userDoc._id,
        name: userDoc.name,
        email: userDoc.email,
        bio: userDoc.bio || '',
        profileImage: userDoc.profileImage || '',
        location: userDoc.location || {},
        verification: userDoc.verification || { phoneVerified: true, profileVerified: true },
        rating: ratingValue
      },
      livelihoodScore: {
        overall: overallLivelihoodScore,
        breakdown: {
          profile: profileCompletenessScore,
          skills: skillsScore,
          offerings: offeringsScore,
          trust: trustScore,
          activity: workScore,
          matching: matchReadinessScore
        }
      },
      profileCompleteness: {
        score: profileCompletenessScore,
        missingFields: missingProfileFields
      },
      skills: skillsList,
      services: {
        total: services.length,
        active: activeServices.length,
        items: services.slice(0, 4)
      },
      products: {
        total: products.length,
        active: activeProducts.length,
        items: products.slice(0, 4)
      },
      opportunities: {
        matchingCount: totalMatchingCount,
        topMatches: topMatchingOpps
      },
      applications: {
        total: appliedApps.length,
        pending: pendingApps.length,
        accepted: acceptedApps.length,
        rejected: rejectedApps.length,
        completed: completedApps.length
      },
      work: {
        acceptedCount: acceptedApps.length,
        completedCount: completedApps.length,
        totalWorkCount: totalCompletedOrAccepted
      },
      reputation: {
        rating: ratingValue,
        reviewCount: reviews.length,
        recentReviews: reviews.slice(0, 3)
      },
      livelihoodActivity: {
        totalEstimatedValue: totalEstimatedServiceValue,
        averageJobValue,
        completedOrAcceptedCount: acceptedOrCompletedApps.length
      },
      growthSuggestions,
      aiSummary: aiSummaryText,
      recentActivity: recentActivity.slice(0, 5)
    });

  } catch (error) {
    console.error('[Provider Dashboard Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error loading provider dashboard.'
    });
  }
};
