import { processChatbotMessage } from '../services/chatbotService.js';

// @desc    Handle chatbot natural language prompt
// @route   POST /api/chatbot/message
// @access  Public (supports optional JWT userContext)
export const handleChatbotMessage = async (req, res) => {
  try {
    const { message, userContext } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid message string.',
        intent: 'GENERAL_CONVERSATION',
        results: [],
        suggestions: ['Find a service', 'Find a product', 'How does SilverHands work?']
      });
    }

    const response = await processChatbotMessage({
      message: message.trim(),
      userContext: userContext || (req.user ? { userId: req.user._id, role: req.user.role } : null)
    });

    return res.json(response);
  } catch (error) {
    console.error('[Chatbot Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: "I'm having trouble processing that right now. Please try again.",
      intent: 'GENERAL_CONVERSATION',
      results: [],
      suggestions: ['Explore Marketplace', 'How does SilverHands work?']
    });
  }
};
