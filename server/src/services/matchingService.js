import { calculateDistance } from '../utils/haversine.js';

const SKILL_ALIASES = {
  tailor: 'tailoring',
  tailoring: 'tailoring',
  stitching: 'tailoring',
  sewing: 'tailoring',
  sew: 'tailoring',
  'custom tailoring': 'tailoring',
  dressmaking: 'dressmaking',
  embroidery: 'embroidery',
  designer: 'design',
  designing: 'design'
};

const clamp = (value, min = 0, max = 100) => Math.min(Math.max(value, min), max);

const normalizeSkillValue = (value) => {
  if (value == null) return '';
  const raw = String(value).trim().toLowerCase();
  if (!raw) return '';

  const cleaned = raw
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return '';

  const words = cleaned.split(' ').map(token => SKILL_ALIASES[token] || token);
  return words.join(' ').replace(/\s+/g, ' ').trim();
};

export const normalizeSkills = (skills = []) => {
  if (!skills) return [];
  const list = Array.isArray(skills) ? skills : [skills];
  return [...new Set(list.map(normalizeSkillValue).filter(Boolean))];
};

export const computeSkillScore = (requestedSkills = [], candidateSkills = []) => {
  const required = normalizeSkills(requestedSkills);
  const available = normalizeSkills(candidateSkills);

  if (!required.length) return 100;
  if (!available.length) return 0;

  let total = 0;
  for (const requiredSkill of required) {
    const directMatch = available.some(skill => skill === requiredSkill);
    if (directMatch) {
      total += 1;
      continue;
    }

    const partialMatch = available.some(skill => skill.includes(requiredSkill) || requiredSkill.includes(skill));
    if (partialMatch) total += 0.5;
  }

  return Math.round((total / required.length) * 100);
};

const normalizeDayList = (days = []) => {
  if (!days) return [];
  const list = Array.isArray(days) ? days : [days];
  return [...new Set(list.map(day => String(day).trim()).filter(Boolean).map(day => day.toLowerCase()))];
};

export const computeLocationScore = (userLat, userLon, targetLocation = {}, maxDistance = 25) => {
  if (Number.isFinite(Number(userLat)) && Number.isFinite(Number(userLon))) {
    const targetLat = Number(targetLocation.latitude ?? targetLocation.lat);
    const targetLon = Number(targetLocation.longitude ?? targetLocation.lon);

    if (Number.isFinite(targetLat) && Number.isFinite(targetLon)) {
      const distance = calculateDistance(userLat, userLon, targetLat, targetLon);
      if (Number.isFinite(distance)) {
        const safeMaxDistance = Number.isFinite(Number(maxDistance)) ? Math.max(Math.abs(Number(maxDistance)), 1) : 25;
        return clamp(100 - (distance / safeMaxDistance) * 100, 0, 100);
      }
    }
  }

  const cityA = String(targetLocation.city || '').trim().toLowerCase();
  const stateA = String(targetLocation.state || '').trim().toLowerCase();
  const countryA = String(targetLocation.country || '').trim().toLowerCase();

  const requestedCity = String(targetLocation.requestedCity || '').trim().toLowerCase();
  const requestedState = String(targetLocation.requestedState || '').trim().toLowerCase();
  const requestedCountry = String(targetLocation.requestedCountry || '').trim().toLowerCase();

  if (requestedCity && cityA && requestedCity === cityA) return 100;
  if (requestedState && stateA && requestedState === stateA) return 70;
  if (requestedCountry && countryA && requestedCountry === countryA) return 40;

  return 0;
};

export const computeAvailabilityScore = (requestedAvailability = [], actualAvailability = []) => {
  const requestedDays = normalizeDayList(requestedAvailability);
  const actualDays = normalizeDayList(actualAvailability);

  if (!requestedDays.length) return 100;
  if (!actualDays.length) return 0;

  const matched = requestedDays.filter(day => actualDays.includes(day));
  return Math.round((matched.length / requestedDays.length) * 100);
};

export const computeRatingScore = (rating) => {
  const numericRating = Number(rating);
  if (!Number.isFinite(numericRating)) return 0;
  return clamp((numericRating / 5) * 100, 0, 100);
};

const reasonText = (type, detail) => {
  const map = {
    skillMatch: 'Matches requested tailoring skills',
    skillPartial: 'Partial match for requested skills',
    skillMiss: 'No direct match for requested skills',
    locationNear: `Located ${detail} km away`,
    locationCity: 'Located in the requested city',
    locationState: 'Located in the same state',
    locationCountry: 'Located in the same country',
    locationMiss: 'Location does not match requested city',
    availabilityMatch: 'Available on requested days',
    availabilityPartial: 'Partially available on requested days',
    availabilityMissing: 'Availability details unavailable',
    rating: `Rating ${detail}/5`,
    ratingMissing: 'Rating unavailable'
  };

  return map[type] || detail;
};

export const buildMatchResult = (candidate = {}, requirement = {}) => {
  const requestedSkills = requirement.skills || requirement.requestedSkills || [];
  const requestedDays = requirement.availability?.days || requirement.requestedDays || [];
  const userLat = Number(requirement.userLat ?? requirement.latitude ?? requirement.location?.latitude);
  const userLon = Number(requirement.userLon ?? requirement.longitude ?? requirement.location?.longitude);
  const maxDistance = Number(requirement.maxDistance ?? 25);

  const candidateSkills = candidate.skills || candidate.serviceSkills || [];
  const candidateDays = candidate.availability?.days || candidate.availableDays || [];

  const skill = computeSkillScore(requestedSkills, candidateSkills);
  const targetLocation = candidate.location || candidate.serviceLocation || {};
  const location = Number.isFinite(userLat) && Number.isFinite(userLon)
    ? computeLocationScore(userLat, userLon, {
        ...targetLocation,
        requestedCity: requirement.city || requirement.location?.city,
        requestedState: requirement.state || requirement.location?.state,
        requestedCountry: requirement.country || requirement.location?.country
      }, maxDistance)
    : computeLocationScore(null, null, {
        ...targetLocation,
        requestedCity: requirement.city || requirement.location?.city,
        requestedState: requirement.state || requirement.location?.state,
        requestedCountry: requirement.country || requirement.location?.country
      }, maxDistance);

  const availability = computeAvailabilityScore(requestedDays, candidateDays);
  const ratingValue = Number(candidate.rating ?? 0);
  const rating = Number.isFinite(ratingValue) && ratingValue > 0 ? computeRatingScore(ratingValue) : 0;

  const overall = (skill * 0.5) + (location * 0.25) + (availability * 0.15) + (rating * 0.1);

  const reasons = [];
  if (skill >= 80) reasons.push(reasonText('skillMatch'));
  else if (skill > 0) reasons.push(reasonText('skillPartial'));
  else reasons.push(reasonText('skillMiss'));

  if (Number.isFinite(userLat) && Number.isFinite(userLon)) {
    const targetLat = Number(targetLocation.latitude ?? targetLocation.lat);
    const targetLon = Number(targetLocation.longitude ?? targetLocation.lon);
    if (Number.isFinite(targetLat) && Number.isFinite(targetLon)) {
      const distance = calculateDistance(userLat, userLon, targetLat, targetLon);
      reasons.push(distance == null ? reasonText('locationMiss') : reasonText('locationNear', String(distance)));
    } else {
      reasons.push(reasonText('locationMiss'));
    }
  } else {
    const requestedCity = requirement.city || requirement.location?.city;
    if (requestedCity && String(targetLocation.city || '').trim().toLowerCase() === String(requestedCity).trim().toLowerCase()) {
      reasons.push(reasonText('locationCity'));
    } else {
      reasons.push(reasonText('locationMiss'));
    }
  }

  if (requestedDays.length) {
    if (availability >= 80) reasons.push(reasonText('availabilityMatch'));
    else if (availability > 0) reasons.push(reasonText('availabilityPartial'));
    else reasons.push(reasonText('availabilityMissing'));
  } else {
    reasons.push(reasonText('availabilityMatch'));
  }

  if (Number.isFinite(ratingValue) && ratingValue > 0) {
    reasons.push(reasonText('rating', String(Number(ratingValue).toFixed(1))));
  } else {
    reasons.push(reasonText('ratingMissing'));
  }

  return {
    id: candidate._id || candidate.id || candidate.providerId || candidate.serviceId,
    name: candidate.name || candidate.title || 'Candidate',
    matchScore: Number(overall.toFixed(2)),
    skill,
    location,
    availability,
    rating,
    reasons
  };
};

export const rankMatches = (candidates = [], requirement = {}) => {
  return candidates
    .map(candidate => buildMatchResult(candidate, requirement))
    .sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return String(a.id || '').localeCompare(String(b.id || ''));
    });
};

export const calculateMatchScore = (candidate, requirement = {}) => {
  return rankMatches([candidate], requirement)[0] || null;
};
