// AI Service Module
// Keeps LLM API key strictly on Express backend

export const extractSkillsFromText = async (text) => {
  if (!text || typeof text !== 'string') {
    return { skills: [] };
  }

  // Fallback intelligent skill extractor
  const lower = text.toLowerCase();
  const extractedSkills = [];

  const skillKeywords = [
    { keywords: ['tailor', 'stitch', 'blouse', 'churidar', 'sew'], name: 'Tailoring & Stitching', category: 'Fashion & Craft' },
    { keywords: ['cook', 'baking', 'recipe', 'meal', 'south indian', 'pickle', 'snack'], name: 'Traditional Cooking', category: 'Food & Cooking' },
    { keywords: ['teach', 'tutor', 'math', 'english', 'tamil', 'language', 'student'], name: 'Home Tuition', category: 'Teaching & Tutoring' },
    { keywords: ['garden', 'plant', 'organic', 'flower'], name: 'Gardening Assistance', category: 'Home & Nature' },
    { keywords: ['knit', 'crochet', 'craft', 'art', 'embroidery', 'painting'], name: 'Handicrafts & Art', category: 'Arts & Crafts' },
    { keywords: ['childcare', 'babysitt', 'nanny'], name: 'Childcare Assistance', category: 'Care & Service' }
  ];

  // Extract years if present (e.g. "25 years", "10 yrs")
  const yearsMatch = lower.match(/(\d+)\s*(years|yrs|year)/);
  const years = yearsMatch ? parseInt(yearsMatch[1], 10) : 5;

  let proficiency = 'Experienced';
  if (years >= 15) proficiency = 'Expert';
  else if (years >= 5) proficiency = 'Experienced';
  else proficiency = 'Intermediate';

  for (const sk of skillKeywords) {
    if (sk.keywords.some(k => lower.includes(k))) {
      extractedSkills.push({
        name: sk.name,
        category: sk.category,
        experienceYears: years,
        proficiency
      });
    }
  }

  if (extractedSkills.length === 0) {
    extractedSkills.push({
      name: 'General Consulting',
      category: 'Consulting',
      experienceYears: years,
      proficiency: 'Experienced'
    });
  }

  return {
    skills: extractedSkills
  };
};

export const generateProfileDescription = async (userData) => {
  const name = userData.name || 'Provider';
  const mainSkill = userData.skills?.[0]?.name || 'traditional skills';
  const years = userData.skills?.[0]?.experienceYears || 10;
  return `Experienced home-based provider specializing in ${mainSkill} with over ${years} years of dedicated experience.`;
};
