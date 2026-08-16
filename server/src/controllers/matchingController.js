/**
 * matchingController.js  —  SilverHands Phase 6
 *
 * Exports TWO handlers:
 *
 *  matchCandidates  (existing)
 *    POST /api/matching/
 *    Legacy endpoint — accepts a pre-built candidates[] array.
 *    Kept intact so existing integrations are not broken.
 *
 *  matchProviders  (Phase 6 addition)
 *    POST /api/matching/providers
 *    Accepts a requirement { skills, location, availability, maxDistanceKm }.
 *    Fetches eligible public providers from the database, scores each one
 *    deterministically via matchingService, and returns ranked results.
 *    Private fields (password, email, phone) are NEVER returned.
 */

import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';
import { rankMatches, rankProviders } from '../services/matchingService.js';
import { buildProviderQuery } from '../services/discoveryService.js';
import { inMemoryUsers } from './userController.js';

// ─── Existing handler (kept unchanged) ────────────────────────────────────

/**
 * @desc  Match arbitrary candidate objects (legacy generic endpoint)
 * @route POST /api/matching/
 * @access Public
 */
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

// ─── Phase 6 provider-matching handler ────────────────────────────────────

/**
 * @desc  Score and rank all discoverable providers against a customer requirement
 * @route POST /api/matching/providers
 * @access Public
 *
 * Request body:
 * {
 *   "skills":       ["Tailoring", "Sewing"],          // optional
 *   "location":     { "latitude": 13.08, "longitude": 80.27, "city": "Chennai" }, // optional
 *   "availability": ["Saturday", "Sunday"],           // optional
 *   "maxDistanceKm": 25                               // optional, default 25
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "count": N,
 *   "providers": [ { providerId, matchScore, breakdown, reasons, provider } ]
 * }
 */
export const matchProviders = async (req, res) => {
  try {
    const body = req.body || {};

    // ── Parse + lightly validate request ──────────────────────────────
    const skills = Array.isArray(body.skills) ? body.skills : [];
    const location = (body.location && typeof body.location === 'object')
      ? body.location
      : {};
    const availability = Array.isArray(body.availability) ? body.availability : [];
    const maxDistanceKm = Number(body.maxDistanceKm) > 0 ? Number(body.maxDistanceKm) : 25;

    // Require at least one dimension of the requirement so the request is meaningful.
    // (All-empty request would just return all providers with 100% skill score since
    //  "no skills requested" = unconstrained. We allow it but document the behaviour.)

    const requirement = { skills, location, availability, maxDistanceKm };

    if (isDbConnected) {
      // ── Fetch eligible providers from MongoDB ──────────────────────
      // Re-use the existing discoveryService query builder with
      // hasPublishedContent:true so only providers visible in normal
      // discovery are eligible for matching.
      const query = buildProviderQuery({ hasPublishedContent: true });

      // Optionally pre-filter by city when coordinates are absent but city given
      if (!location.latitude && !location.longitude && location.city) {
        query['location.city'] = new RegExp(location.city, 'i');
      }

      const providers = await User.find(query)
        .select('-password -email -phone')   // ← private fields NEVER returned
        .lean();

      if (!providers.length) {
        return res.json({ success: true, count: 0, providers: [] });
      }

      // ── Score + rank ───────────────────────────────────────────────
      const ranked = rankProviders(providers, requirement);

      return res.json({
        success: true,
        count: ranked.length,
        providers: ranked
      });

    } else {
      // ── In-memory fallback (demo / offline mode) ───────────────────
      const list = Array.from(inMemoryUsers.values())
        .filter(u => u.role === 'provider')
        // Mirror the hasPublishedContent eligibility filter
        .filter(u => u.onboarding?.completed || (u.skills && u.skills.length > 0))
        .map(({ password, email, phone, ...rest }) => rest); // strip private fields

      if (!list.length) {
        return res.json({ success: true, count: 0, providers: [] });
      }

      const ranked = rankProviders(list, requirement);

      return res.json({
        success: true,
        count: ranked.length,
        providers: ranked
      });
    }
  } catch (error) {
    console.error('[MatchProviders Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Matching error' });
  }
};
