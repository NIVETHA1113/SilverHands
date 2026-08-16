import { rankMatches } from '../services/matchingService.js';

export const matchCandidates = async (req, res) => {
  try {
    const body = req.body || {};
    const candidates = Array.isArray(body.candidates) ? body.candidates : [];
    const requirement = body.requirement || body;

    if (!candidates.length) {
      return res.status(400).json({
        success: false,
        message: 'Matching requires a candidates array.'
      });
    }

    const matches = rankMatches(candidates, requirement);

    return res.json({
      success: true,
      count: matches.length,
      matches
    });
  } catch (error) {
    console.error('[MatchCandidates Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Matching error' });
  }
};
