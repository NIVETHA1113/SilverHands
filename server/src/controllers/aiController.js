import {
  extractSkillsFromText,
  generateProfileDescription,
  generateServiceDescription,
  extractRequirementFromText,
  explainMatchReasons
} from '../services/aiService.js';

/**
 * @desc    Extract structured skills from natural language text
 * @route   POST /api/ai/extract-skills
 * @access  Protected
 */
export const handleExtractSkills = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a description of your experience.'
      });
    }

    const result = await extractSkillsFromText(text.trim());
    return res.json({
      success: true,
      data: {
        skills: result.skills
      },
      // Backward compatibility alias for StepSkills.jsx
      skills: result.skills,
      meta: {
        source: result.source
      }
    });
  } catch (error) {
    console.error('[AI Controller - Extract Skills Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to extract skills. Please try adding skills manually.'
    });
  }
};

/**
 * @desc    Generate a warm, professional provider profile description/bio
 * @route   POST /api/ai/generate-profile
 * @access  Protected
 */
export const handleGenerateProfile = async (req, res) => {
  try {
    const { name, skills, experienceYears, location, languages } = req.body;

    const result = await generateProfileDescription({
      name,
      skills,
      experienceYears: Number(experienceYears) || null,
      location,
      languages
    });

    return res.json({
      success: true,
      data: {
        description: result.description
      },
      description: result.description,
      meta: {
        source: result.source
      }
    });
  } catch (error) {
    console.error('[AI Controller - Generate Profile Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate profile bio. Please enter bio manually.'
    });
  }
};

/**
 * @desc    Generate a polished customer-friendly service listing description
 * @route   POST /api/ai/generate-service-description
 * @access  Protected
 */
export const handleGenerateServiceDescription = async (req, res) => {
  try {
    const { title, category, skills, details, basicNotes } = req.body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a service title first.'
      });
    }

    const result = await generateServiceDescription({
      title: title.trim(),
      category: category?.trim() || 'General',
      skills: Array.isArray(skills) ? skills : [],
      details: (details || basicNotes || '').trim()
    });

    return res.json({
      success: true,
      data: {
        description: result.description
      },
      // Backward compatibility alias for ServiceForm.jsx
      description: result.description,
      meta: {
        source: result.source
      }
    });
  } catch (error) {
    console.error('[AI Controller - Generate Service Description Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Could not generate description. Please enter description manually.'
    });
  }
};

/**
 * @desc    Extract structured requirement details from customer inquiry
 * @route   POST /api/ai/extract-requirement
 * @access  Protected
 */
export const handleExtractRequirement = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a requirement description.'
      });
    }

    const result = await extractRequirementFromText(text.trim());
    return res.json({
      success: true,
      data: {
        category: result.category,
        skills: result.skills,
        availability: result.availability,
        locationPreference: result.locationPreference
      },
      meta: {
        source: result.source
      }
    });
  } catch (error) {
    console.error('[AI Controller - Extract Requirement Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to extract requirement. Please specify requirements manually.'
    });
  }
};

/**
 * @desc    Generate natural language explanation for match reasons
 * @route   POST /api/ai/explain-match
 * @access  Protected
 */
export const handleExplainMatch = async (req, res) => {
  try {
    const { matchScore, reasons } = req.body;

    const parsedScore = typeof matchScore === 'number' ? matchScore : parseInt(matchScore, 10) || 0;
    const reasonsArray = Array.isArray(reasons) ? reasons : [];

    const result = await explainMatchReasons({
      matchScore: parsedScore,
      reasons: reasonsArray
    });

    return res.json({
      success: true,
      data: {
        explanation: result.explanation
      },
      explanation: result.explanation,
      meta: {
        source: result.source
      }
    });
  } catch (error) {
    console.error('[AI Controller - Explain Match Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate match explanation.'
    });
  }
};
