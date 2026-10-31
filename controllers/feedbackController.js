const Activity = require('../models/Activity');
const Client = require('../models/Client');
const Company = require('../models/Company');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const mongoose = require('mongoose');
const { canAccessCompany } = require('../middleware/companyAccess');

const getSubmissionForm = async (req, res, next) => {
  try {
    const client = await Client.findOne({ feedback_token: req.params.token }).select('name company_id');
    if (!client) return res.status(404).json({ message: 'Feedback link not found' });

    const existingFeedback = await Feedback.findOne({ client_id: client._id }).select('_id');
    if (existingFeedback) {
      return res.status(409).json({ message: 'Feedback has already been submitted for this client' });
    }

    res.json({ client_name: client.name });
  } catch (error) {
    next(error);
  }
};

const submitFeedback = async (req, res, next) => {
  try {
    const rating = Number(req.body.rating);
    const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Select a rating from 1 to 5 stars' });
    }
    if (text.length > 2000) {
      return res.status(400).json({ message: 'Feedback must be 2000 characters or fewer' });
    }

    const client = await Client.findOne({ feedback_token: req.params.token });
    if (!client) return res.status(404).json({ message: 'Feedback link not found' });

    const feedback = await Feedback.create({
      company_id: client.company_id,
      client_id: client._id,
      client_name: client.name,
      rating,
      text,
      status: 'pending',
    });

    await Activity.create({
      company_id: client.company_id,
      action: 'New client feedback received',
      entity_type: 'feedback',
      entity_id: feedback._id.toString(),
      details: `${client.name} submitted feedback. The platform team is reviewing it before publication.`,
      user_name: 'Platform notification',
      user_email: client.created_by || '',
    });

    res.status(201).json({ message: 'Thanks! Your feedback is being reviewed by the platform team.' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Feedback has already been submitted for this client' });
    }
    next(error);
  }
};

const getPublicCompanyFeedback = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.companyId)) {
      return res.status(404).json({ message: 'Public feedback page not found' });
    }
    const company = await Company.findById(req.params.companyId).select('created_by');
    if (!company) return res.status(404).json({ message: 'Public feedback page not found' });

    const agent = company.created_by
      ? await User.findOne({ email: company.created_by.toLowerCase().trim() }).select('full_name')
      : null;
    const feedback = await Feedback.find({ company_id: company._id, status: 'approved' })
      .select('client_name rating text createdAt')
      .sort({ createdAt: -1 });
    res.json({ agent_name: agent?.full_name || 'Agent', feedback });
  } catch (error) {
    next(error);
  }
};

const getCompanyFeedbackStatus = async (req, res, next) => {
  try {
    const { company_id } = req.query;
    if (!mongoose.isValidObjectId(company_id) || !(await canAccessCompany(req.user.email, company_id))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const feedback = await Feedback.find({ company_id }).select('client_id status');
    res.json(feedback);
  } catch (error) {
    next(error);
  }
};

const getMyFeedback = async (req, res, next) => {
  try {
    const email = req.user.email.toLowerCase().trim();
    const companies = await Company.find({ created_by: email }).select('_id');
    const companyIds = companies.map((company) => company._id);
    if (companyIds.length === 0) return res.json([]);

    const feedback = await Feedback.find({ company_id: { $in: companyIds } })
      .select('client_name rating text status createdAt company_id')
      .populate('company_id', 'name')
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    next(error);
  }
};

const getPendingFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ status: 'pending' })
      .populate('company_id', 'name')
      .sort({ createdAt: 1 });
    res.json(feedback);
  } catch (error) {
    next(error);
  }
};

const updateFeedbackStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json(feedback);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubmissionForm,
  submitFeedback,
  getPublicCompanyFeedback,
  getCompanyFeedbackStatus,
  getMyFeedback,
  getPendingFeedback,
  updateFeedbackStatus,
};
