/**
 * matchingService.js  —  SilverHands Phase 6  (frontend)
 *
 * Thin wrapper around the existing `api` Axios instance.
 * Does NOT create a second Axios instance.
 * Does NOT calculate match scores — all scoring is backend-driven.
 *
 * Exported functions:
 *
 *   fetchProviderMatches(requirement)
 *     POST /api/matching/providers
 *     Returns the ranked provider list with scores, breakdowns, and reasons.
 *
 * Requirement shape:
 * {
 *   skills:        string[]                              // e.g. ["Tailoring", "Sewing"]
 *   location:      { latitude?, longitude?, city? }     // either coords or city
 *   availability:  string[]                              // e.g. ["Saturday", "Sunday"]
 *   maxDistanceKm: number                               // optional, default 25
 * }
 */

import api from './api';

/**
 * Fetch matched + ranked providers from the backend.
 *
 * @param {{ skills?: string[], location?: object, availability?: string[], maxDistanceKm?: number }} requirement
 * @returns {Promise<{ success: boolean, count: number, providers: object[] }>}
 */
export const fetchProviderMatches = async (requirement = {}) => {
  const response = await api.post('/matching/providers', requirement);
  return response.data;
};
