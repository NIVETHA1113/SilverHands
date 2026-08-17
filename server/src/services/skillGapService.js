import Opportunity from '../models/Opportunity.js';
import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';
import { normaliseSkills, buildMatchResult } from './matchingService.js';
import { aiExplainMatch } from './aiProvider.js';

/**
 * Analyze Provider Skills against Open Opportunities
 */
export const analyzeProviderSkillGaps = async (providerId) => {
  let providerDoc;
  let openOpportunities = [];

  if (isDbConnected) {
    providerDoc = await User.findById(providerId).select('-password').lean();
    if (!providerDoc) {
      throw new Error('Provider profile not found');
    }
    openOpportunities = await Opportunity.find({ status: 'open' })
      .populate('customerId', 'name profileImage location rating')
      .sort({ createdAt: -1 })
      .lean();
  } else {
    // Demo fallback
    providerDoc = { _id: providerId, skills: [{ name: 'Tailoring' }, { name: 'Embroidery' }] };
  }

  const rawProviderSkills = providerDoc.skills || [];
  const normalizedProviderTokens = normaliseSkills(rawProviderSkills);

  const readyNow = [];
  const almostThere = [];
  const missingSkillFrequency = {};

  openOpportunities.forEach(opp => {
    // Required skills array or category fallback
    const rawOppSkills = opp.skills && opp.skills.length > 0 ? opp.skills : [opp.category];
    const normalizedOppTokens = normaliseSkills(rawOppSkills);

    // Identify matched & missing tokens
    const matchedTokens = [];
    const missingTokens = [];

    normalizedOppTokens.forEach(reqToken => {
      const isMatched = normalizedProviderTokens.some(
        provToken => provToken === reqToken || provToken.includes(reqToken) || reqToken.includes(provToken)
      );

      if (isMatched) {
        matchedTokens.push(reqToken);
      } else {
        missingTokens.push(reqToken);
      }
    });

    // Compute deterministic match score using existing matching engine
    const matchResult = buildMatchResult(providerDoc, {
      skills: rawOppSkills,
      location: opp.location || {},
      availability: opp.availability || []
    });

    const oppFormatted = {
      id: opp._id,
      title: opp.title,
      category: opp.category,
      budget: opp.budget,
      budgetType: opp.budgetType,
      city: opp.location?.city || 'Chennai',
      customerName: opp.customerId?.name || 'Local Customer',
      customerImage: opp.customerId?.profileImage || '',
      matchScore: matchResult.matchScore,
      matchedSkills: rawOppSkills.filter(s => matchedTokens.includes(normaliseSkills([s])[0])),
      missingSkills: rawOppSkills.filter(s => !matchedTokens.includes(normaliseSkills([s])[0])),
      reasons: matchResult.reasons,
      breakdown: matchResult.breakdown
    };

    // Ensure missingSkills list is clean if normalized token matched
    if (missingTokens.length === 0 || matchResult.matchScore >= 85) {
      readyNow.push(oppFormatted);
    } else if (missingTokens.length > 0 && (matchResult.matchScore >= 40 || matchedTokens.length > 0)) {
      almostThere.push(oppFormatted);

      // Track missing skill impact count
      oppFormatted.missingSkills.forEach(rawSkill => {
        const canonical = rawSkill.trim();
        if (!missingSkillFrequency[canonical]) {
          missingSkillFrequency[canonical] = {
            skillName: canonical,
            count: 0,
            opportunities: []
          };
        }
        missingSkillFrequency[canonical].count += 1;
        missingSkillFrequency[canonical].opportunities.push({
          id: opp._id,
          title: opp.title,
          matchScore: matchResult.matchScore
        });
      });
    }
  });

  // Rank missing skills by unlockable opportunity count DESC
  const topSkillGaps = Object.values(missingSkillFrequency)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Generate grounded AI explanation if skill gaps exist
  let aiExplanation = '';
  if (topSkillGaps.length > 0) {
    const topGap = topSkillGaps[0];
    const promptContext = {
      providerSkills: rawProviderSkills.map(s => s.name || s),
      topMissingSkill: topGap.skillName,
      unlockableCount: topGap.count,
      opportunityTitles: topGap.opportunities.map(o => o.title)
    };

    try {
      const generatedExplanation = await aiExplainMatch(promptContext);
      if (generatedExplanation && typeof generatedExplanation === 'string') {
        aiExplanation = generatedExplanation.trim();
      }
    } catch (err) {
      console.warn('[Skill Gap AI Explanation Warning]:', err.message);
    }

    if (!aiExplanation) {
      aiExplanation = `Developing "${topGap.skillName}" is your highest-impact growth area. It will strengthen your eligibility for ${topGap.count} near-match opportunity${topGap.count > 1 ? 'ies' : ''} on SilverHands.`;
    }
  } else {
    aiExplanation = 'Your current skill profile matches well with open opportunities. Add more specialized skills to unlock new categories!';
  }

  return {
    providerSkills: rawProviderSkills,
    summary: {
      readyCount: readyNow.length,
      almostThereCount: almostThere.length,
      topSkillGapCount: topSkillGaps.length
    },
    readyNow: readyNow.slice(0, 6),
    almostThere: almostThere.slice(0, 6),
    topSkillGaps,
    aiExplanation
  };
};
