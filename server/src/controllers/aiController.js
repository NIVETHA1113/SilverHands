import { extractSkillsFromText, generateProfileDescription } from '../services/aiService.js';

export const handleExtractSkills = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a description of your experience.'
      });
    }

    const result = await extractSkillsFromText(text.trim());
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('[AI Controller Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extract skills. Please try adding skills manually.'
    });
  }
};

export const handleGenerateServiceDescription = async (req, res) => {
  try {
    const { title, basicNotes, category } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a service title first.'
      });
    }

    const lower = title.toLowerCase();
    let generated = `Custom ${title.trim()} provided with careful attention to detail, traditional expertise, and flexible fitting for your needs. Suitable for everyday and special occasion requirements.`;

    if (lower.includes('stitch') || lower.includes('blouse')) {
      generated = 'Custom blouse stitching with careful fitting and traditional design options. Suitable for everyday wear and special occasions.';
    } else if (lower.includes('cook') || lower.includes('food')) {
      generated = 'Authentic traditional South Indian cooking prepared with fresh ingredients, hygenic home kitchen standards, and family recipes.';
    } else if (lower.includes('tuition') || fontIncludes(lower, 'teach')) {
      generated = 'Personalized home tuition and patient mentoring tailored to student learning pace, focusing on fundamentals and clear concepts.';
    }

    res.json({
      success: true,
      description: generated
    });
  } catch (error) {
    console.error('[AI Service Description Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Could not generate description.'
    });
  }
};

function fontIncludes(text, keyword) {
  return text.includes(keyword);
}
