import api from './api';

/**
 * AI Service Client Module
 * Provides helper functions for AI features via backend /api/ai endpoints
 */

/**
 * Extract structured skills from natural language text
 * @param {string} text
 * @returns {Promise<{ success: boolean, data: { skills: Array<{ name: string, experienceYears: number|null, proficiency: string }> }, meta?: { source: string } }>}
 */
export const extractSkills = async (text) => {
  const response = await api.post('/ai/extract-skills', { text });
  return response.data;
};

/**
 * Generate a warm, professional public profile description
 * @param {object} userData { name, skills, experienceYears, location, languages }
 * @returns {Promise<{ success: boolean, data: { description: string }, meta?: { source: string } }>}
 */
export const generateProfile = async (userData) => {
  const response = await api.post('/ai/generate-profile', userData);
  return response.data;
};

/**
 * Generate a polished customer-friendly service listing description
 * @param {object} serviceData { title, category, skills, details, basicNotes }
 * @returns {Promise<{ success: boolean, data: { description: string }, meta?: { source: string } }>}
 */
export const generateServiceDescription = async (serviceData) => {
  const response = await api.post('/ai/generate-service-description', serviceData);
  return response.data;
};

/**
 * Extract structured requirements from customer inquiry
 * @param {string} text
 * @returns {Promise<{ success: boolean, data: { category: string, skills: string[], availability: string[], locationPreference: string }, meta?: { source: string } }>}
 */
export const extractRequirement = async (text) => {
  const response = await api.post('/ai/extract-requirement', { text });
  return response.data;
};

/**
 * Generate natural language explanation for match reasons
 * @param {object} matchData { matchScore: number, reasons: string[] }
 * @returns {Promise<{ success: boolean, data: { explanation: string }, meta?: { source: string } }>}
 */
export const explainMatch = async (matchData) => {
  const response = await api.post('/ai/explain-match', matchData);
  return response.data;
};

const aiServiceClient = {
  extractSkills,
  generateProfile,
  generateServiceDescription,
  extractRequirement,
  explainMatch
};

export default aiServiceClient;
