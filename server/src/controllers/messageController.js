import Message from '../models/Message.js';
import User from '../models/User.js';

/**
 * @desc    Send a direct persistent message to a provider or customer
 * @route   POST /api/messages
 * @access  Private
 */
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id || req.user.id;
    const { receiverId, message } = req.body;

    if (!receiverId || !message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a recipient and message text.'
      });
    }

    if (String(senderId) === String(receiverId)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a message to yourself.'
      });
    }

    const recipientExists = await User.findById(receiverId);
    if (!recipientExists) {
      return res.status(404).json({
        success: false,
        message: 'Recipient profile not found.'
      });
    }

    const newMsg = await Message.create({
      senderId,
      receiverId,
      message: message.trim()
    });

    const populatedMsg = await Message.findById(newMsg._id)
      .populate('senderId', 'name profileImage role location')
      .populate('receiverId', 'name profileImage role location')
      .lean();

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
      data: populatedMsg
    });
  } catch (error) {
    console.error('[Send Message Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message.'
    });
  }
};

/**
 * @desc    Get all messages sent or received by the current logged-in user
 * @route   GET /api/messages/my
 * @access  Private
 */
export const getMyMessages = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    })
      .populate('senderId', 'name profileImage role location')
      .populate('receiverId', 'name profileImage role location')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('[Get My Messages Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch messages.'
    });
  }
};

/**
 * @desc    Mark a message as read
 * @route   PATCH /api/messages/:id/read
 * @access  Private
 */
export const markMessageRead = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const msg = await Message.findById(id);
    if (!msg) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    if (String(msg.receiverId) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to mark this message as read.' });
    }

    msg.isRead = true;
    await msg.save();

    return res.json({ success: true, message: 'Message marked as read.' });
  } catch (error) {
    console.error('[Mark Read Error]:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to update message status.' });
  }
};
