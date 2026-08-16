// AI Service Module
// Orchestrates AI requests through the AI Provider Adapter

import {
  aiExtractSkills,
  aiGenerateProfile,
  aiGenerateServiceDescription,
  aiExtractRequirement,
  aiExplainMatch
} from './aiProvider.js';

/**
 * 1. Extract structured skills from natural language text
 * @param {string} text
 * @returns {Promise<{ skills: Array<{ name: string, experienceYears: number|null, proficiency: string }>, source: string }>}
 */
export const extractSkillsFromText = async (text) => {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return { skills: [], source: 'validation_empty' };
  }
  return await aiExtractSkills(text.trim());
};

/**
 * 2. Generate warm, professional provider profile bio
 * @param {object} userData { name, skills, experienceYears, location, languages }
 * @returns {Promise<{ description: string, source: string }>}
 */
export const generateProfileDescription = async (userData = {}) => {
  return await aiGenerateProfile(userData);
};

/**
 * 3. Generate polished, customer-friendly service listing description
 * @param {object} serviceData { title, category, skills, details, basicNotes }
 * @returns {Promise<{ description: string, source: string }>}
 */
export const generateServiceDescription = async (serviceData = {}) => {
  return await aiGenerateServiceDescription(serviceData);
};

/**
 * 4. Extract structured requirement from customer natural language inquiry
 * @param {string} text
 * @returns {Promise<{ category: string, skills: string[], availability: string[], locationPreference: string, source: string }>}
 */
export const extractRequirementFromText = async (text) => {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return {
      category: 'General',
      skills: [],
      availability: ['Flexible'],
      locationPreference: 'Nearby',
      source: 'validation_empty'
    };
  }
  return await aiExtractRequirement(text.trim());
};

/**
 * 5. Generate natural-language match explanation for matchScore & reasons
 * @param {object} params { matchScore: number, reasons: string[] }
 * @returns {Promise<{ explanation: string, source: string }>}
 */
export const explainMatchReasons = async ({ matchScore = 0, reasons = [] }) => {
  return await aiExplainMatch({ matchScore, reasons });
};
