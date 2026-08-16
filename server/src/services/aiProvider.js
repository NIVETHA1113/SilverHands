import { GoogleGenAI } from '@google/genai';

// Timeout wrapper for async operations (8 seconds)
const withTimeout = (promise, ms = 8000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('AI request timed out')), ms))
  ]);
};

// Check if a real, valid API key is configured
const isKeyConfigured = () => {
  const key = process.env.AI_API_KEY;
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  return trimmed !== '' && trimmed !== 'your_gemini_or_llm_api_key_here';
};

// Lazy initialization of Gemini client
let geminiClient = null;
const getGeminiClient = () => {
  if (!geminiClient && isKeyConfigured()) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.AI_API_KEY.trim() });
  }
  return geminiClient;
};

/* =========================================================================
   DETERMINISTIC HEURISTIC FALLBACK ENGINES
   ========================================================================= */

export const heuristicExtractSkills = (text) => {
  if (!text || typeof text !== 'string') {
    return { skills: [], source: 'heuristic_fallback' };
  }

  const lower = text.toLowerCase();
  const skillsMap = new Map();

  // Extract years if present
  const yearsMatch = lower.match(/(\d+)\s*(?:years?|yrs?|yr)/i);
  const detectedYears = yearsMatch ? parseInt(yearsMatch[1], 10) : null;

  const skillDictionary = [
    { patterns: ['tailor', 'stitch', 'blouse', 'churidar', 'dressmaking', 'sewing', 'garment'], name: 'Tailoring', defaultProficiency: 'Expert' },
    { patterns: ['sew', 'stitching', 'alteration'], name: 'Sewing', defaultProficiency: 'Experienced' },
    { patterns: ['cook', 'cooking', 'south indian', 'recipe', 'meal', 'sambar', 'rasam', 'pickle', 'snack', 'baking', 'baker'], name: 'Traditional Cooking', defaultProficiency: 'Expert' },
    { patterns: ['pickle', 'homemade pickle', 'achar'], name: 'Pickle Making', defaultProficiency: 'Experienced' },
    { patterns: ['teach', 'teaching', 'tutor', 'tutoring', 'tuition', 'math', 'english', 'tamil', 'science', 'mentor'], name: 'Teaching', defaultProficiency: 'Experienced' },
    { patterns: ['home tuition', 'tutor', 'tuitions'], name: 'Home Tuition', defaultProficiency: 'Experienced' },
    { patterns: ['garden', 'gardening', 'plant', 'organic', 'flower', 'horticulture'], name: 'Gardening', defaultProficiency: 'Experienced' },
    { patterns: ['handicraft', 'craft', 'embroidery', 'crochet', 'knit', 'knitting', 'painting', 'art'], name: 'Handicrafts', defaultProficiency: 'Experienced' },
    { patterns: ['embroidery', 'aari', 'zardozi'], name: 'Embroidery', defaultProficiency: 'Experienced' },
    { patterns: ['childcare', 'babysitt', 'nanny', 'storytell'], name: 'Childcare', defaultProficiency: 'Experienced' },
    { patterns: ['music', 'singing', 'carnatic', 'vocal', 'harmonium', 'veena'], name: 'Music & Singing', defaultProficiency: 'Expert' },
    { patterns: ['dance', 'bharatanatyam', 'classical dance'], name: 'Classical Dance', defaultProficiency: 'Expert' },
    { patterns: ['language', 'spoken english', 'spoken hindi', 'tamil class'], name: 'Language Training', defaultProficiency: 'Experienced' }
  ];

  for (const item of skillDictionary) {
    if (item.patterns.some(p => lower.includes(p))) {
      if (!skillsMap.has(item.name)) {
        let proficiency = item.defaultProficiency;
        if (detectedYears !== null) {
          if (detectedYears >= 15) proficiency = 'Expert';
          else if (detectedYears >= 5) proficiency = 'Experienced';
          else if (detectedYears >= 2) proficiency = 'Intermediate';
          else proficiency = 'Beginner';
        }
        skillsMap.set(item.name, {
          name: item.name,
          experienceYears: detectedYears,
          proficiency
        });
      }
    }
  }

  // If specific skills were not matched, extract any generic intent or fallback
  if (skillsMap.size === 0) {
    skillsMap.set('General Consulting', {
      name: 'General Consulting',
      experienceYears: detectedYears,
      proficiency: detectedYears && detectedYears >= 10 ? 'Expert' : 'Experienced'
    });
  }

  return {
    skills: Array.from(skillsMap.values()),
    source: 'heuristic_fallback'
  };
};

export const heuristicGenerateProfile = ({ name, skills = [], experienceYears, location, languages = [] }) => {
  const provName = name?.trim() || 'Skilled Provider';
  const skillList = Array.isArray(skills) && skills.length > 0
    ? skills.map(s => (typeof s === 'string' ? s : s.name)).filter(Boolean)
    : ['traditional crafts and home services'];
  const primarySkills = skillList.slice(0, 3).join(', ');
  const years = experienceYears ? `${experienceYears}+ years of` : 'extensive';
  const loc = location?.city || (typeof location === 'string' ? location : '') || 'the local area';
  const langList = Array.isArray(languages) && languages.length > 0 ? languages.join(', ') : 'English';

  const bio = `${provName} is an experienced home-based professional based in ${loc}, offering ${years} dedicated expertise in ${primarySkills}. Communicating comfortably in ${langList}, ${provName} takes pride in delivering trusted, high-quality, and personalized services with meticulous attention to detail and traditional care.`;

  return {
    description: bio,
    source: 'heuristic_fallback'
  };
};

export const heuristicGenerateServiceDescription = ({ title, category, skills = [], details = '' }) => {
  const cleanTitle = title?.trim() || 'Custom Service';
  const cleanCat = category?.trim() || 'Home Services';
  const skillStr = Array.isArray(skills) && skills.length > 0
    ? `focused on ${skills.slice(0, 3).join(' and ')}`
    : '';

  let generated = `Personalized ${cleanTitle} provided with patient craftsmanship, traditional expertise, and careful attention to your needs.`;

  if (details && details.trim()) {
    generated += ` ${details.trim()}`;
  } else {
    generated += ` Suitable for regular requirements and special occasions, ensuring authentic, reliable results in the ${cleanCat} category.`;
  }

  return {
    description: generated.trim(),
    source: 'heuristic_fallback'
  };
};

export const heuristicExtractRequirement = (text) => {
  if (!text || typeof text !== 'string') {
    return {
      category: 'General',
      skills: [],
      availability: ['Flexible'],
      locationPreference: 'Nearby',
      source: 'heuristic_fallback'
    };
  }

  const lower = text.toLowerCase();

  // Detect category
  let category = 'General';
  if (lower.includes('cook') || lower.includes('food') || lower.includes('meal') || lower.includes('baking') || lower.includes('pickle')) {
    category = 'Cooking';
  } else if (lower.includes('stitch') || lower.includes('tailor') || lower.includes('blouse') || lower.includes('sew') || lower.includes('cloth')) {
    category = 'Tailoring';
  } else if (lower.includes('teach') || lower.includes('tutor') || lower.includes('tuition') || lower.includes('math') || lower.includes('english')) {
    category = 'Teaching';
  } else if (lower.includes('garden') || lower.includes('plant')) {
    category = 'Gardening';
  } else if (lower.includes('craft') || lower.includes('embroidery') || lower.includes('art')) {
    category = 'Handicrafts';
  } else if (lower.includes('child') || lower.includes('baby') || lower.includes('nanny')) {
    category = 'Care & Service';
  } else if (lower.includes('music') || lower.includes('sing') || lower.includes('dance')) {
    category = 'Arts & Music';
  }

  // Detect specific skills
  const skills = [];
  if (lower.includes('tamil cooking')) skills.push('Tamil Cooking');
  else if (lower.includes('south indian cooking') || lower.includes('south indian')) skills.push('South Indian Cooking');
  else if (category === 'Cooking') skills.push('Traditional Cooking');

  if (lower.includes('teach') || lower.includes('tutor') || lower.includes('tuition')) skills.push('Teaching');
  if (lower.includes('tailor') || lower.includes('stitch') || lower.includes('blouse')) skills.push('Tailoring');
  if (lower.includes('embroidery')) skills.push('Embroidery');
  if (lower.includes('gardening')) skills.push('Gardening');

  if (skills.length === 0) {
    skills.push(category);
  }

  // Detect availability
  const availability = [];
  if (lower.includes('weekend') || lower.includes('saturday') || lower.includes('sunday')) {
    availability.push('Weekend');
  }
  if (lower.includes('weekday') || lower.includes('monday') || lower.includes('tuesday') || lower.includes('wednesday') || lower.includes('thursday') || lower.includes('friday')) {
    availability.push('Weekday');
  }
  if (lower.includes('morning')) availability.push('Morning');
  if (lower.includes('evening')) availability.push('Evening');
  if (lower.includes('afternoon')) availability.push('Afternoon');
  if (availability.length === 0) availability.push('Flexible');

  // Detect location preference
  let locationPreference = 'Nearby';
  if (lower.includes('online') || lower.includes('remote') || lower.includes('virtual')) {
    locationPreference = 'Online';
  } else if (lower.includes('home') || lower.includes('at my place') || lower.includes('in person')) {
    locationPreference = 'Home-based';
  } else if (lower.includes('nearby') || lower.includes('near me') || lower.includes('local')) {
    locationPreference = 'Nearby';
  }

  return {
    category,
    skills,
    availability,
    locationPreference,
    source: 'heuristic_fallback'
  };
};

export const heuristicExplainMatch = ({ matchScore = 0, reasons = [] }) => {
  const validReasons = Array.isArray(reasons) ? reasons.filter(r => typeof r === 'string' && r.trim().length > 0) : [];

  if (validReasons.length === 0) {
    return {
      explanation: `This provider is a strong match (${matchScore}%) based on their verified profile, relevant skills, and convenient service arrangement.`,
      source: 'heuristic_fallback'
    };
  }

  const reasonsText = validReasons.map(r => r.replace(/^\w/, c => c.toLowerCase())).join(', ');
  return {
    explanation: `This provider is a strong match (${matchScore}%) because they ${reasonsText}.`,
    source: 'heuristic_fallback'
  };
};

/* =========================================================================
   GEMINI API CALLERS WITH ROBUST ERROR HANDLING AND PROMPTING
   ========================================================================= */

// Helper to call Gemini and parse JSON safely
const callGeminiJson = async (prompt, systemInstruction) => {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('Gemini API key is not configured');
  }

  const response = await withTimeout(
    client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    })
  );

  const text = response?.text;
  if (!text) {
    throw new Error('Empty response received from Gemini');
  }

  // Parse JSON with sanitization of any markdown code blocks
  const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleanJson);
};

// 1. Skill Extraction
export const aiExtractSkills = async (text) => {
  if (!isKeyConfigured()) {
    return heuristicExtractSkills(text);
  }

  try {
    const prompt = `Extract all skills mentioned in the following user description. For each skill, determine its standard name, estimated years of experience (integer or null if not specified), and proficiency level ("Beginner", "Intermediate", "Experienced", "Expert"). Output valid JSON only.\n\nDescription: "${text}"`;
    const systemInstruction = 'You are an AI skill taxonomy extractor for SilverHands, a platform empowering senior citizens and homemakers in India. Return JSON strictly matching: {"skills": [{"name": string, "experienceYears": number|null, "proficiency": "Beginner"|"Intermediate"|"Experienced"|"Expert"}]}';

    const parsed = await callGeminiJson(prompt, systemInstruction);
    if (parsed && Array.isArray(parsed.skills) && parsed.skills.length > 0) {
      return {
        skills: parsed.skills.map(s => ({
          name: String(s.name || 'Skill'),
          experienceYears: typeof s.experienceYears === 'number' ? s.experienceYears : null,
          proficiency: ['Beginner', 'Intermediate', 'Experienced', 'Expert'].includes(s.proficiency) ? s.proficiency : 'Experienced'
        })),
        source: 'gemini'
      };
    }
    return heuristicExtractSkills(text);
  } catch (error) {
    console.warn('[AI Provider Warning - Skills Fallback Triggered]:', error.message);
    return heuristicExtractSkills(text);
  }
};

// 2. Profile Bio Generation
export const aiGenerateProfile = async (userData) => {
  if (!isKeyConfigured()) {
    return heuristicGenerateProfile(userData);
  }

  try {
    const prompt = `Generate a warm, respectful, concise (2-3 sentences), professional public profile description for a senior or homemaker provider on SilverHands.\n\nUser Data:\n- Name: ${userData.name || 'Provider'}\n- Skills: ${JSON.stringify(userData.skills || [])}\n- Experience: ${userData.experienceYears || 'Extensive'} years\n- Location: ${userData.location?.city || userData.location || 'Local'}\n- Languages: ${JSON.stringify(userData.languages || ['English'])}\n\nReturn JSON: {"description": string}`;
    const systemInstruction = 'You are a warm profile biographer for SilverHands. Return JSON only: {"description": string}';

    const parsed = await callGeminiJson(prompt, systemInstruction);
    if (parsed && typeof parsed.description === 'string' && parsed.description.trim()) {
      return {
        description: parsed.description.trim(),
        source: 'gemini'
      };
    }
    return heuristicGenerateProfile(userData);
  } catch (error) {
    console.warn('[AI Provider Warning - Profile Fallback Triggered]:', error.message);
    return heuristicGenerateProfile(userData);
  }
};

// 3. Service Description Generation
export const aiGenerateServiceDescription = async (serviceData) => {
  if (!isKeyConfigured()) {
    return heuristicGenerateServiceDescription(serviceData);
  }

  try {
    const prompt = `Generate an appealing, clear, customer-friendly service listing description for a home-based provider offering traditional services.\n\nService Details:\n- Title: ${serviceData.title}\n- Category: ${serviceData.category || 'General'}\n- Skills: ${JSON.stringify(serviceData.skills || [])}\n- User Notes: ${serviceData.details || serviceData.basicNotes || 'None'}\n\nReturn JSON: {"description": string}`;
    const systemInstruction = 'You write trustworthy, appealing service descriptions for SilverHands. Return JSON only: {"description": string}';

    const parsed = await callGeminiJson(prompt, systemInstruction);
    if (parsed && typeof parsed.description === 'string' && parsed.description.trim()) {
      return {
        description: parsed.description.trim(),
        source: 'gemini'
      };
    }
    return heuristicGenerateServiceDescription(serviceData);
  } catch (error) {
    console.warn('[AI Provider Warning - Service Description Fallback Triggered]:', error.message);
    return heuristicGenerateServiceDescription(serviceData);
  }
};

// 4. Requirement Extraction
export const aiExtractRequirement = async (text) => {
  if (!isKeyConfigured()) {
    return heuristicExtractRequirement(text);
  }

  try {
    const prompt = `Extract structured customer requirement details from this natural language request.\n\nRequest: "${text}"\n\nReturn JSON with exact keys: {"category": string, "skills": string[], "availability": string[], "locationPreference": string}`;
    const systemInstruction = 'You extract structured requirement needs for SilverHands matching engine. Return JSON only matching: {"category": string, "skills": string[], "availability": string[], "locationPreference": string}';

    const parsed = await callGeminiJson(prompt, systemInstruction);
    if (parsed && parsed.category && Array.isArray(parsed.skills)) {
      return {
        category: String(parsed.category || 'General'),
        skills: parsed.skills.map(String),
        availability: Array.isArray(parsed.availability) ? parsed.availability.map(String) : ['Flexible'],
        locationPreference: String(parsed.locationPreference || 'Nearby'),
        source: 'gemini'
      };
    }
    return heuristicExtractRequirement(text);
  } catch (error) {
    console.warn('[AI Provider Warning - Requirement Fallback Triggered]:', error.message);
    return heuristicExtractRequirement(text);
  }
};

// 5. Match Explanation
export const aiExplainMatch = async ({ matchScore = 0, reasons = [] }) => {
  if (!isKeyConfigured()) {
    return heuristicExplainMatch({ matchScore, reasons });
  }

  try {
    const prompt = `Generate a 1-2 sentence friendly, natural-language explanation of why this provider matched the customer requirement with a score of ${matchScore}%.\n\nReasons: ${JSON.stringify(reasons)}\n\nDo not recalculate or question the score. Simply explain the reasons clearly. Return JSON: {"explanation": string}`;
    const systemInstruction = 'You write friendly match explanations for SilverHands users. Return JSON only: {"explanation": string}';

    const parsed = await callGeminiJson(prompt, systemInstruction);
    if (parsed && typeof parsed.explanation === 'string' && parsed.explanation.trim()) {
      return {
        explanation: parsed.explanation.trim(),
        source: 'gemini'
      };
    }
    return heuristicExplainMatch({ matchScore, reasons });
  } catch (error) {
    console.warn('[AI Provider Warning - Match Explanation Fallback Triggered]:', error.message);
    return heuristicExplainMatch({ matchScore, reasons });
  }
};
