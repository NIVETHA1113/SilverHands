import Application from '../models/Application.js';
import Opportunity from '../models/Opportunity.js';
import Review from '../models/Review.js';

const getUserId = (req) => (req.user._id ? req.user._id.toString() : req.user.id);

// ─────────────────────────────────────────────
// @desc   Apply to an opportunity (provider only)
// @route  POST /api/opportunities/:id/apply
// @access Protected
// ─────────────────────────────────────────────
export const applyToOpportunity = async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ success: false, message: 'Only providers can apply to opportunities.' });
    }

    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    if (opportunity.status !== 'open') {
      return res.status(400).json({ success: false, message: 'This opportunity is not open for applications.' });
    }

    const providerId = getUserId(req);

    // Provider cannot apply to their own opportunity (edge case: customer & provider same person)
    if (opportunity.customerId.toString() === providerId) {
      return res.status(400).json({ success: false, message: 'You cannot apply to your own opportunity.' });
    }

    const { message, proposedPrice } = req.body;

    // Prevent duplicate application
    const existing = await Application.findOne({ opportunityId: opportunity._id, providerId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already applied to this opportunity.' });
    }

    const application = await Application.create({
      opportunityId: opportunity._id,
      providerId,
      customerId: opportunity.customerId,
      message: message || '',
      proposedPrice: proposedPrice != null ? Number(proposedPrice) : null
    });

    const populated = await application.populate('providerId', 'name profileImage location rating skills');
    return res.status(201).json({ success: true, application: populated });
  } catch (err) {
    // MongoDB duplicate key error (race-condition safety)
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already applied to this opportunity.' });
    }
    console.error('[applyToOpportunity Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// @desc   View all applications for an opportunity (customer/owner only)
// @route  GET /api/opportunities/:id/applications
// @access Protected
// ─────────────────────────────────────────────
export const getApplicationsForOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    const userId = getUserId(req);
    if (opportunity.customerId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorised to view these applications.' });
    }

    const applications = await Application.find({ opportunityId: opportunity._id })
      .populate('providerId', 'name profileImage location rating skills bio languages')
      .sort({ createdAt: -1 });

    // Enrich completed applications with their review data
    const completedApps = applications.filter(a => a.status === 'completed');
    let reviewMap = {};
    if (completedApps.length > 0) {
      const reviewDocs = await Review.find({
        applicationId: { $in: completedApps.map(a => a._id) }
      }).populate('customerId', 'name').lean();

      reviewDocs.forEach(review => {
        reviewMap[review.applicationId.toString()] = {
          _id: review._id,
          rating: review.rating,
          comment: review.comment,
          imageUrl: review.imageUrl || '',
          createdAt: review.createdAt,
          customerId: review.customerId || null
        };
      });
    }

    const enriched = applications.map(app => {
      const appObj = app.toObject();
      const review = reviewMap[app._id.toString()] || null;
      return {
        ...appObj,
        review,
        reviewImage: review?.imageUrl || ''
      };
    });

    return res.json({ success: true, applications: enriched });
  } catch (err) {
    console.error('[getApplicationsForOpportunity Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// @desc   Get all applications submitted by the logged-in provider
// @route  GET /api/applications/my
// @access Protected
// ─────────────────────────────────────────────
export const getMyApplications = async (req, res) => {
  try {
    const providerId = getUserId(req);
    const applications = await Application.find({ providerId })
      .populate('opportunityId', 'title category budget budgetType status location customerId')
      .populate('customerId', 'name profileImage location')
      .sort({ createdAt: -1 });

    if (!applications.length) {
      return res.json({ success: true, applications: [] });
    }

    const reviewDocs = await Review.find({
      applicationId: { $in: applications.map(app => app._id) }
    }).populate('customerId', 'name').lean();

    const reviewMap = {};
    reviewDocs.forEach(review => {
      reviewMap[review.applicationId.toString()] = {
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        imageUrl: review.imageUrl || '',
        createdAt: review.createdAt,
        customerId: review.customerId || null
      };
    });

    const enriched = applications.map(app => ({
      ...app.toObject(),
      reviewImage: reviewMap[app._id.toString()]?.imageUrl || '',
      review: reviewMap[app._id.toString()] || null
    }));

    return res.json({ success: true, applications: enriched });
  } catch (err) {
    console.error('[getMyApplications Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// @desc   Accept an application (customer/owner only)
//         → application → accepted, opportunity → paused
// @route  PATCH /api/applications/:id/accept
// @access Protected
// ─────────────────────────────────────────────
export const acceptApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('opportunityId');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const userId = getUserId(req);
    if (application.customerId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Only the opportunity owner can accept applications.' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot accept an application with status: ${application.status}` });
    }

    const oppId = application.opportunityId._id || application.opportunityId;

    // Prevent accepting another application for the same opportunity
    const alreadyAccepted = await Application.findOne({
      opportunityId: oppId,
      status: 'accepted'
    });
    if (alreadyAccepted) {
      return res.status(400).json({
        success: false,
        message: 'An application has already been accepted for this opportunity.'
      });
    }

    application.status = 'accepted';
    await application.save();

    // Pause the opportunity so no new applications flow in
    await Opportunity.findByIdAndUpdate(oppId, { status: 'paused' });

    const populated = await application.populate('providerId', 'name profileImage location rating');
    return res.json({ success: true, application: populated });
  } catch (err) {
    console.error('[acceptApplication Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// @desc   Reject an application (customer/owner only)
// @route  PATCH /api/applications/:id/reject
// @access Protected
// ─────────────────────────────────────────────
export const rejectApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const userId = getUserId(req);
    if (application.customerId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Only the opportunity owner can reject applications.' });
    }

    if (!['pending', 'accepted'].includes(application.status)) {
      return res.status(400).json({ success: false, message: `Cannot reject application with status: ${application.status}` });
    }

    const wasAccepted = application.status === 'accepted';
    application.status = 'rejected';
    await application.save();

    // If this was the accepted application, re-open the opportunity if no other accepted apps
    if (wasAccepted) {
      const otherAccepted = await Application.findOne({
        opportunityId: application.opportunityId,
        status: 'accepted'
      });
      if (!otherAccepted) {
        await Opportunity.findByIdAndUpdate(application.opportunityId, { status: 'open' });
      }
    }

    const populated = await application.populate('providerId', 'name profileImage location rating');
    return res.json({ success: true, application: populated });
  } catch (err) {
    console.error('[rejectApplication Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// @desc   Withdraw an application (provider only, only if pending)
// @route  PATCH /api/applications/:id/withdraw
// @access Protected
// ─────────────────────────────────────────────
export const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const userId = getUserId(req);
    if (application.providerId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Only the applicant can withdraw their application.' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot withdraw application with status: ${application.status}` });
    }

    application.status = 'withdrawn';
    await application.save();

    return res.json({ success: true, application });
  } catch (err) {
    console.error('[withdrawApplication Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// @desc   Mark an accepted application as completed (customer only)
//         → application → completed, opportunity → completed
// @route  PATCH /api/applications/:id/complete
// @access Protected
// ─────────────────────────────────────────────
export const completeApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const userId = getUserId(req);
    if (application.customerId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Only the customer can mark work as completed.' });
    }

    if (application.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Only accepted applications can be marked as completed.' });
    }

    application.status = 'completed';
    await application.save();

    // Mark opportunity as completed too
    await Opportunity.findByIdAndUpdate(application.opportunityId, { status: 'completed' });

    return res.json({ success: true, application });
  } catch (err) {
    console.error('[completeApplication Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// @desc   Get application by ID (protected, customer/provider only)
// @route  GET /api/applications/:id
// @access Protected
// ─────────────────────────────────────────────
export const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('providerId', 'name profileImage rating skills')
      .populate('customerId', 'name profileImage')
      .populate('opportunityId', 'title category budget budgetType status location');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const userId = getUserId(req);
    const isCustomer = application.customerId._id.toString() === userId;
    const isProvider = application.providerId._id.toString() === userId;

    if (!isCustomer && !isProvider) {
      return res.status(403).json({ success: false, message: 'Not authorised to view this application.' });
    }

    const review = await Review.findOne({ applicationId: application._id })
      .populate('customerId', 'name')
      .lean();

    return res.json({
      success: true,
      application: {
        ...application.toObject(),
        reviewImage: review?.imageUrl || '',
        review: review ? {
          _id: review._id,
          rating: review.rating,
          comment: review.comment,
          imageUrl: review.imageUrl || '',
          createdAt: review.createdAt,
          customerId: review.customerId || null
        } : null
      }
    });
  } catch (err) {
    console.error('[getApplicationById Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

