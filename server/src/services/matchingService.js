/**
 * matchingService.js  —  SilverHands Phase 6
 *
 * Deterministic, rule-based provider matching.
 * NO AI, NO randomness, NO external APIs.
 *
 * ─── Scoring weights ──────────────────────────────────────────────────────
 *   Skill compatibility   50 %   (most important — customer needs the skill)
 *   Location proximity    25 %   (physical accessibility)
 *   Availability          15 %   (scheduling fit)
 *   Rating                10 %   (quality signal)
 *
 * ─── Rating fallback ─────────────────────────────────────────────────────
 *   The User model stores `rating` with a Mongoose default of 4.8, so a
 *   stored value of 4.8 is treated as a real rating.
 *   If the raw value is null / undefined / NaN (provider has never been
 *   rated and the default was not applied), the rating component is set to
 *   null and the other three components are re-normalised to sum to 100 %
 *   using their relative weights (50/90, 25/90, 15/90).
 *   This keeps the final score meaningful rather than artificially penalising
 *   an un-rated provider.
 *
 * ─── Skill normalisation rules ───────────────────────────────────────────
 *   1. Lower-case and strip non-alpha characters.
 *   2. Collapse whitespace.
 *   3. Apply the SKILL_ALIASES map (common synonyms / abbreviations).
 *   "tailoring", "tailor", "stitching", "sewing" → "tailoring"
 *   Case variations ("TAILORING", "Tailoring") resolve to the same token.
 *
 * ─── Location scoring rule ───────────────────────────────────────────────
 *   When both coordinate pairs are valid:
 *     score = clamp(100 − (distanceKm / MAX_DISTANCE_KM) × 100, 0, 100)
 *     MAX_DISTANCE_KM default = 25 km; customisable per request.
 *     Provider at 0 km  → 100.  Provider at 25 km → 0.  Linear decay.
 *   When coordinates are unavailable, text fallback:
 *     Same city    → 100   Same state → 70   Same country → 40   None → 0
 *
 * ─── Availability scoring rule ───────────────────────────────────────────
 *   matchedDays / requestedDays × 100  (0–100, integer)
 *   Days compared case-insensitively.
 *   If no availability is requested → 100 (not a constraint).
 *   If provider has no days on record → 0.
 *
 * ─── Determinism guarantee ───────────────────────────────────────────────
 *   Same inputs → same output, always.
 *   Tie-breaking: matchScore DESC → rating DESC (where available) → name ASC.
 */

import { getDistance, textLocationScore, isValidCoordPair } from './locationService.js';

// ─── Constants ─────────────────────────────────────────────────────────────

/** Default maximum distance in km for location scoring (linear decay). */
const DEFAULT_MAX_DISTANCE_KM = 25;

/**
 * Scoring weights.  Must sum to 1.0.
 * Adjusted weights when rating is unavailable (skill + location + availability
 * split across 0.90 of the original scale).
 */
const WEIGHTS = {
  skill:        0.50,
  location:     0.25,
  availability: 0.15,
  rating:       0.10,
};

// Weights when rating is unknown — re-normalised to 1.0
const WEIGHTS_NO_RATING = {
  skill:        WEIGHTS.skill        / (1 - WEIGHTS.rating),   // ~0.5556
  location:     WEIGHTS.location     / (1 - WEIGHTS.rating),   // ~0.2778
  availability: WEIGHTS.availability / (1 - WEIGHTS.rating),   // ~0.1667
};

// ─── Skill synonym map ─────────────────────────────────────────────────────

/**
 * Maps raw token → canonical token.
 * Keys and values must already be lower-case, trimmed, non-special.
 */
const SKILL_ALIASES = {
  // Tailoring cluster
  tailor:                  'tailoring',
  tailoring:               'tailoring',
  stitching:               'tailoring',
  stitch:                  'tailoring',
  sewing:                  'tailoring',
  sew:                     'tailoring',
  dressmaking:             'tailoring',
  'custom tailoring':      'tailoring',
  alteration:              'tailoring',
  alterations:             'tailoring',
  'blouse stitching':      'tailoring',
  'blouse making':         'tailoring',

  // Cooking cluster
  cook:                    'cooking',
  cooking:                 'cooking',
  'traditional cooking':   'cooking',
  'home cooking':          'cooking',
  'south indian cooking':  'cooking',
  baking:                  'baking',
  baker:                   'baking',

  // Teaching cluster
  teach:             'teaching',
  teaching:          'teaching',
  tutor:             'tutoring',
  tutoring:          'tutoring',
  tuition:           'tutoring',

  // Design cluster
  design:            'design',
  designing:         'design',
  designer:          'design',

  // Embroidery
  embroidery:        'embroidery',

  // Gardening
  garden:            'gardening',
  gardening:         'gardening',

  // Handicrafts
  craft:             'handicrafts',
  crafts:            'handicrafts',
  handicraft:        'handicrafts',
  handicrafts:       'handicrafts',
};

// ─── Internal helpers ──────────────────────────────────────────────────────

const clamp = (v, min = 0, max = 100) => Math.min(Math.max(v, min), max);

/**
 * Normalise a single skill string to its canonical form.
 * Returns '' when the input produces no meaningful token.
 */
const normaliseSkillToken = (raw) => {
  if (raw == null) return '';
  const s = String(raw).trim().toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!s) return '';
  // Apply alias map word-by-word, then rejoin
  const canonical = s.split(' ').map(w => SKILL_ALIASES[w] || w).join(' ').replace(/\s+/g, ' ').trim();
  // Also check the full phrase as an alias key
  return SKILL_ALIASES[canonical] || canonical;
};

/**
 * Normalise an array of skill values.
 * Deduplicates after normalisation.
 *
 * @param {Array<string|{name:string}>} skills
 * @returns {string[]}
 */
export const normaliseSkills = (skills = []) => {
  if (!skills) return [];
  const list = Array.isArray(skills) ? skills : [skills];
  const tokens = list.map(s => {
    // Accept both plain strings and { name } objects (User.skills format)
    const raw = typeof s === 'object' && s !== null ? (s.name || '') : s;
    return normaliseSkillToken(raw);
  }).filter(Boolean);
  return [...new Set(tokens)];
};

// ─── Scoring functions ─────────────────────────────────────────────────────

/**
 * Skill compatibility score  (0 – 100).
 *
 * Scoring per requested skill:
 *   Exact normalised match            → 1.0 point  (e.g. "cooking" == "cooking")
 *   Provider skill CONTAINS request   → 0.6 point  (e.g. provider has "traditional cooking", user wants "cooking")
 *   No match                          → 0 points
 *
 * NOTE: We intentionally do NOT award partial credit when the requested skill
 * contains the provider skill (req.includes(a)).  Example: searching "cooking"
 * should NOT partially match a provider whose only skill is "craft" just
 * because some substring relationship exists.  Aliases handle true synonyms
 * (cook → cooking, tailor → tailoring, etc.) so those always become exact matches.
 *
 * Final = (totalPoints / requestedCount) × 100, rounded to integer.
 *
 * @param {Array} requestedSkills  Customer's requested skills
 * @param {Array} candidateSkills  Provider's skills (strings or {name} objects)
 * @returns {number}
 */
export const computeSkillScore = (requestedSkills = [], candidateSkills = []) => {
  const required  = normaliseSkills(requestedSkills);
  const available = normaliseSkills(candidateSkills);

  // If no skills were requested, this factor is not a constraint → 100
  if (!required.length) return 100;
  // Provider has no skills on record → 0
  if (!available.length) return 0;

  let points = 0;
  for (const req of required) {
    // 1. Exact match after normalisation (aliases already applied)
    if (available.includes(req)) {
      points += 1;
      continue;
    }
    // 2. Provider skill CONTAINS the requested skill as a substring
    //    e.g. provider has "traditional cooking", user wants "cooking"
    //    Only award partial if the provider token is strictly longer (genuinely broader skill)
    const partial = available.some(a => a !== req && a.includes(req));
    if (partial) {
      points += 0.6;
    }
    // No match → 0 points for this requested skill
  }

  return Math.round((points / required.length) * 100);
};

/**
 * Location compatibility score  (0 – 100).
 *
 * Scoring:
 *   Coordinate distance available:
 *     score = clamp(100 − (distKm / maxDistKm) × 100, 0, 100)
 *   Coordinate distance unavailable → text fallback (city/state/country).
 *
 * @param {object} customerLocation  { latitude, longitude, city?, state?, country? }
 * @param {object} providerLocation  { latitude, longitude, city?, state?, country? }
 * @param {number} maxDistKm
 * @returns {number}
 */
export const computeLocationScore = (customerLocation, providerLocation, maxDistKm = DEFAULT_MAX_DISTANCE_KM) => {
  if (isValidCoordPair(customerLocation) && isValidCoordPair(providerLocation)) {
    const dist = getDistance(
      customerLocation.latitude ?? customerLocation.lat,
      customerLocation.longitude ?? customerLocation.lon,
      providerLocation.latitude ?? providerLocation.lat,
      providerLocation.longitude ?? providerLocation.lon,
    );
    if (dist !== null) {
      const safeMax = Number.isFinite(maxDistKm) && maxDistKm > 0 ? maxDistKm : DEFAULT_MAX_DISTANCE_KM;
      return clamp(Math.round(100 - (dist / safeMax) * 100));
    }
  }
  // Coordinate fallback → text comparison
  return textLocationScore(customerLocation, providerLocation);
};

/**
 * Availability compatibility score  (0 – 100).
 *
 * matchedDays / requestedDays × 100, integer.
 *
 * @param {string[]} requestedDays  Customer's required days
 * @param {string[]} providerDays   Provider's available days
 * @returns {number}
 */
export const computeAvailabilityScore = (requestedDays = [], providerDays = []) => {
  const normDay = (d) => String(d || '').trim().toLowerCase();

  const required = (Array.isArray(requestedDays) ? requestedDays : [requestedDays])
    .map(normDay).filter(Boolean);
  const available = (Array.isArray(providerDays) ? providerDays : [providerDays])
    .map(normDay).filter(Boolean);

  if (!required.length)  return 100;  // no constraint
  if (!available.length) return 0;    // provider has no listed availability

  const matched = required.filter(d => available.includes(d));
  return Math.round((matched.length / required.length) * 100);
};

/**
 * Rating score  (0 – 100 when rating exists, null when unavailable).
 *
 * Converts a 0–5 star rating to a 0–100 score: (rating / 5) × 100.
 * Returns null (not zero) if the rating value is null/undefined/NaN.
 *
 * @param {*} rating  Raw rating value from DB
 * @returns {number|null}
 */
export const computeRatingScore = (rating) => {
  if (rating == null || rating === '') return null;
  const n = Number(rating);
  if (!Number.isFinite(n) || n < 0) return null;
  return clamp(Math.round((n / 5) * 100));
};

// ─── Match reason builders ─────────────────────────────────────────────────

/**
 * Build deterministic human-readable reasons from component scores.
 *
 * @param {object} scores   { skill, location, availability, rating }
 * @param {object} context  { hasCoords, distanceKm, city, requestedDays }
 * @returns {string[]}
 */
const buildReasons = (scores, context) => {
  const reasons = [];

  // ── Skill reasons ──
  if (scores.skill >= 90) {
    reasons.push('Strong skill compatibility — matches all requested skills');
  } else if (scores.skill >= 60) {
    reasons.push('Good skill match for most requested skills');
  } else if (scores.skill > 0) {
    reasons.push('Limited skill overlap with requested skills');
  } else {
    reasons.push('No direct match for the requested skills');
  }

  // ── Location reasons ──
  if (context.hasCoords && context.distanceKm != null) {
    if (context.distanceKm === 0) {
      reasons.push('Same location as you');
    } else if (scores.location >= 80) {
      reasons.push(`Located nearby — ${context.distanceKm} km away`);
    } else if (scores.location >= 40) {
      reasons.push(`Located ${context.distanceKm} km away`);
    } else {
      reasons.push(`Located ${context.distanceKm} km away — outside preferred range`);
    }
  } else if (scores.location >= 100) {
    reasons.push(`Located in ${context.city || 'the requested city'}`);
  } else if (scores.location >= 70) {
    reasons.push('Located in the same state');
  } else if (scores.location >= 40) {
    reasons.push('Located in the same country');
  } else {
    reasons.push('Location information unavailable or outside requested area');
  }

  // ── Availability reasons ──
  if (!context.requestedDays || context.requestedDays.length === 0) {
    // No availability constraint requested — no negative reason needed
  } else if (scores.availability >= 100) {
    reasons.push('Fully available on all requested days');
  } else if (scores.availability >= 50) {
    reasons.push('Available on some of the requested days');
  } else if (scores.availability > 0) {
    reasons.push('Availability only partially matches requested schedule');
  } else {
    reasons.push('Not available on the requested days');
  }

  // ── Rating reasons ──
  if (scores.rating === null) {
    reasons.push('Rating information unavailable');
  } else if (scores.rating >= 90) {
    reasons.push(`Highly rated provider — ${Math.round((scores.rating / 100) * 5 * 10) / 10}/5 stars`);
  } else if (scores.rating >= 60) {
    reasons.push(`Good provider rating`);
  } else {
    reasons.push(`Provider has a rating on record`);
  }

  return reasons;
};

// ─── Main match builder ────────────────────────────────────────────────────

/**
 * Calculate the full match result for a single provider against a requirement.
 *
 * @param {object} provider     Provider document (from DB, select -password)
 * @param {object} requirement  { skills[], location: {latitude,longitude,city?},
 *                                availability: [], maxDistanceKm? }
 * @returns {object}  Match result shaped per the Phase 6 API spec
 */
export const buildMatchResult = (provider, requirement = {}) => {
  const reqSkills       = requirement.skills        || [];
  const reqLocation     = requirement.location      || {};
  const reqDays         = requirement.availability  || [];
  const maxDistKm       = Number(requirement.maxDistanceKm) > 0
    ? Number(requirement.maxDistanceKm)
    : DEFAULT_MAX_DISTANCE_KM;

  // Provider's fields (User model shape)
  const providerSkills   = provider.skills        || [];           // [{name, ...}]
  const providerLocation = provider.location      || {};           // {city,state,country,latitude,longitude}
  const providerDays     = provider.availability?.days || [];     // string[]
  const rawRating        = provider.rating;                        // number|null|undefined

  // ── Component scores ──
  const skillScore        = computeSkillScore(reqSkills, providerSkills);
  const locationScore     = computeLocationScore(reqLocation, providerLocation, maxDistKm);
  const availabilityScore = computeAvailabilityScore(reqDays, providerDays);
  const ratingScore       = computeRatingScore(rawRating);

  // ── Weighted total ──
  // If rating is unavailable (null) use the re-normalised weights.
  let matchScore;
  if (ratingScore === null) {
    matchScore =
      skillScore        * WEIGHTS_NO_RATING.skill        +
      locationScore     * WEIGHTS_NO_RATING.location     +
      availabilityScore * WEIGHTS_NO_RATING.availability;
  } else {
    matchScore =
      skillScore        * WEIGHTS.skill        +
      locationScore     * WEIGHTS.location     +
      availabilityScore * WEIGHTS.availability +
      ratingScore       * WEIGHTS.rating;
  }

  // Round to nearest integer for display
  const finalScore = Math.round(matchScore);

  // ── Reason context ──
  let distanceKm = null;
  let hasCoords  = false;
  if (isValidCoordPair(reqLocation) && isValidCoordPair(providerLocation)) {
    hasCoords  = true;
    distanceKm = getDistance(
      reqLocation.latitude  ?? reqLocation.lat,
      reqLocation.longitude ?? reqLocation.lon,
      providerLocation.latitude,
      providerLocation.longitude,
    );
  }

  const reasons = buildReasons(
    { skill: skillScore, location: locationScore, availability: availabilityScore, rating: ratingScore },
    {
      hasCoords,
      distanceKm,
      city:          providerLocation.city || null,
      requestedDays: reqDays,
    },
  );

  return {
    providerId: String(provider._id),
    matchScore:  finalScore,
    breakdown: {
      skill:        skillScore,
      location:     locationScore,
      availability: availabilityScore,
      rating:       ratingScore,        // null when unavailable — never fabricated
    },
    reasons,
    // Attach safe public provider fields for the client
    provider: {
      _id:          provider._id,
      name:         provider.name,
      bio:          provider.bio         || '',
      profileImage: provider.profileImage || '',
      skills:       provider.skills      || [],
      languages:    provider.languages   || [],
      location: {
        city:      providerLocation.city      || '',
        state:     providerLocation.state     || '',
        country:   providerLocation.country   || '',
        // Coordinates intentionally omitted from response — not needed by UI
      },
      availability: {
        days:            providerDays,
        timePreferences: provider.availability?.timePreferences || [],
      },
      rating:       rawRating != null && Number.isFinite(Number(rawRating)) && Number(rawRating) >= 0
        ? Number(rawRating)
        : null,
      age:          provider.age || null,
      distanceKm,   // null when coords unavailable — never fabricated
    },
  };
};

// ─── Ranking ───────────────────────────────────────────────────────────────

/**
 * Score and rank an array of provider documents against a requirement.
 *
 * Sort order (deterministic):
 *   1. matchScore DESC
 *   2. rating DESC (providers with rating beat un-rated at equal score)
 *   3. name ASC (alphabetical tie-breaker)
 *
 * @param {object[]} providers
 * @param {object}   requirement
 * @returns {object[]}  Sorted array of match results
 */
export const rankProviders = (providers = [], requirement = {}) => {
  const reqSkills = Array.isArray(requirement.skills) ? requirement.skills : [];
  const skillsRequested = reqSkills.length > 0;

  return providers
    .map(p => buildMatchResult(p, requirement))
    // ── Eligibility filter ──────────────────────────────────────────────
    // When the customer specifies skills, only return providers who have at
    // least some skill match (skillScore > 0).  A provider with 0% skill
    // compatibility is not a relevant result regardless of how well they
    // match on location or availability.
    // When no skills were requested, all providers pass through (skill score
    // defaults to 100 = "unconstrained").
    .filter(result => !skillsRequested || result.breakdown.skill > 0)
    .sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      // Secondary: higher rating first (null rating sorts lower)
      const ra = a.provider.rating ?? -1;
      const rb = b.provider.rating ?? -1;
      if (rb !== ra) return rb - ra;
      // Tertiary: name ascending
      return String(a.provider.name || '').localeCompare(String(b.provider.name || ''));
    });
};

// ─── Legacy compatibility export ───────────────────────────────────────────
// The existing matchingController.js imports { rankMatches } from this file.
// Keep that export alive so the existing POST /api/matching/ endpoint is not broken.

export { normaliseSkills as normalizeSkills };

/**
 * @deprecated  Use rankProviders() for the Phase 6 provider-matching API.
 *              This export preserves backwards compatibility with the existing
 *              generic POST /api/matching endpoint.
 */
export const rankMatches = (candidates = [], requirement = {}) => {
  // The old API passed arbitrary candidate objects (not User documents).
  // Re-use buildMatchResult but read skills as either string[] or {name}[].
  return candidates
    .map(candidate => {
      // Adapt old candidate shape to the User model shape expected by buildMatchResult
      const adapted = {
        _id:          candidate._id || candidate.id || candidate.providerId || 'unknown',
        name:         candidate.name   || candidate.title || 'Candidate',
        skills:       candidate.skills || [],
        location:     candidate.location || candidate.serviceLocation || {},
        availability: candidate.availability || { days: candidate.availableDays || [] },
        rating:       candidate.rating ?? null,
      };
      const result = buildMatchResult(adapted, requirement);
      // Return in the old shape for backwards compat
      return {
        id:           result.providerId,
        name:         result.provider.name,
        matchScore:   result.matchScore,
        skill:        result.breakdown.skill,
        location:     result.breakdown.location,
        availability: result.breakdown.availability,
        rating:       result.breakdown.rating,
        reasons:      result.reasons,
      };
    })
    .sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return String(a.id || '').localeCompare(String(b.id || ''));
    });
};

export const calculateMatchScore = (candidate, requirement = {}) =>
  rankMatches([candidate], requirement)[0] || null;
