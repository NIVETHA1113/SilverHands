/**
 * locationService.js
 *
 * Centralised location utilities for SilverHands Phase 6.
 * Re-exports the Haversine implementation from server/src/utils/haversine.js
 * so that all backend code imports from one place.
 *
 * Rules enforced here:
 *   - Both coordinate pairs must be finite numbers to calculate distance.
 *   - If either pair is missing/invalid, returns null — never a fabricated value.
 *   - City/state/country text comparisons are available as a fallback for
 *     providers whose coordinates are absent.
 */

import { calculateDistance as haversineCalc } from '../utils/haversine.js';

// ─── Coordinate validation ─────────────────────────────────────────────────

/**
 * Returns true only when the value is a finite number inside valid lat/lon
 * ranges. Strings that coerce to valid numbers are accepted.
 *
 * @param {*} value
 * @param {'lat'|'lon'} type
 * @returns {boolean}
 */
export const isValidCoordinate = (value, type = 'lat') => {
  const n = Number(value);
  if (!Number.isFinite(n)) return false;
  if (type === 'lat') return n >= -90  && n <= 90;
  if (type === 'lon') return n >= -180 && n <= 180;
  return false;
};

/**
 * Validate a full { latitude, longitude } pair.
 * Accepts objects with either latitude/longitude OR lat/lon keys.
 *
 * @param {object} coords
 * @returns {boolean}
 */
export const isValidCoordPair = (coords) => {
  if (!coords || typeof coords !== 'object') return false;
  const lat = coords.latitude ?? coords.lat;
  const lon = coords.longitude ?? coords.lon;
  return isValidCoordinate(lat, 'lat') && isValidCoordinate(lon, 'lon');
};

// ─── Distance calculation ──────────────────────────────────────────────────

/**
 * Calculate the great-circle distance between two coordinate pairs.
 * Delegates to the shared Haversine utility.
 *
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number|null}  Distance in kilometres (1 dp), or null if impossible.
 */
export const getDistance = (lat1, lon1, lat2, lon2) => {
  // Validate all four values before passing to haversine
  if (
    !isValidCoordinate(lat1, 'lat') ||
    !isValidCoordinate(lon1, 'lon') ||
    !isValidCoordinate(lat2, 'lat') ||
    !isValidCoordinate(lon2, 'lon')
  ) {
    return null;
  }
  return haversineCalc(lat1, lon1, lat2, lon2);
};

/**
 * Convenience wrapper that accepts location objects directly.
 * Handles both { latitude, longitude } and { lat, lon } shapes.
 *
 * @param {{ latitude?: number, lat?: number, longitude?: number, lon?: number }} fromCoords
 * @param {{ latitude?: number, lat?: number, longitude?: number, lon?: number }} toCoords
 * @returns {number|null}
 */
export const getDistanceBetween = (fromCoords, toCoords) => {
  if (!fromCoords || !toCoords) return null;
  const lat1 = fromCoords.latitude ?? fromCoords.lat;
  const lon1 = fromCoords.longitude ?? fromCoords.lon;
  const lat2 = toCoords.latitude   ?? toCoords.lat;
  const lon2 = toCoords.longitude  ?? toCoords.lon;
  return getDistance(lat1, lon1, lat2, lon2);
};

// ─── Location label helper (for UI/reasons) ───────────────────────────────

/**
 * Build a human-readable location label from a provider location object.
 * Prefers distance when it can be calculated; falls back to city name.
 * Never fabricates a distance.
 *
 * @param {object} customerCoords  { latitude, longitude } of the customer
 * @param {object} providerLocation  Provider's location object from the DB
 * @returns {{ label: string, distanceKm: number|null }}
 */
export const buildLocationLabel = (customerCoords, providerLocation) => {
  if (isValidCoordPair(customerCoords) && isValidCoordPair(providerLocation)) {
    const dist = getDistanceBetween(customerCoords, providerLocation);
    if (dist !== null) {
      return { label: `${dist} km away`, distanceKm: dist };
    }
  }

  const city = String(providerLocation?.city || '').trim();
  if (city) return { label: city, distanceKm: null };

  return { label: 'Location unavailable', distanceKm: null };
};

// ─── Text-based location comparison ───────────────────────────────────────

/**
 * Compare two location objects using city/state/country text when coordinates
 * are unavailable. Returns a numeric proximity score: 100 city, 70 state,
 * 40 country, 0 no match.
 *
 * @param {object} requested  { city?, state?, country? }
 * @param {object} provider   { city?, state?, country? }
 * @returns {number}  0–100
 */
export const textLocationScore = (requested, provider) => {
  const norm = (s) => String(s || '').trim().toLowerCase();

  const rCity    = norm(requested?.city);
  const rState   = norm(requested?.state);
  const rCountry = norm(requested?.country);

  const pCity    = norm(provider?.city);
  const pState   = norm(provider?.state);
  const pCountry = norm(provider?.country);

  if (rCity    && pCity    && rCity    === pCity)    return 100;
  if (rState   && pState   && rState   === pState)   return 70;
  if (rCountry && pCountry && rCountry === pCountry) return 40;
  return 0;
};
