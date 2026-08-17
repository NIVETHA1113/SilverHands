import { analyzeProviderSkillGaps } from '../services/skillGapService.js';

// @desc    Get Provider Skill Gap & Opportunity Unlock Analysis
// @route   GET /api/providers/skill-gaps
// @access  Private (Provider Only)
export const getProviderSkillGaps = async (req, res) => {
  try {
    const providerId = req.user._id || req.user.id;

    if (!req.user || req.user.role !== 'provider') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Skill gap analysis is only accessible to providers.'
      });
    }

    const analysis = await analyzeProviderSkillGaps(providerId);

    return res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('[Skill Gap Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error analyzing skill gaps.'
    });
  }
};
