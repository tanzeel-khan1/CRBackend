const Company = require('../models/Company');
const Feedback = require('../models/Feedback');
const Invoice = require('../models/Invoice');
const mongoose = require('mongoose');
const User = require('../models/User');

const PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MANUAL_SUBSCRIPTION_DAYS = 30;
const FEEDBACK_STATUSES = ['pending', 'approved', 'rejected'];
const INVOICE_STATUSES = ['draft', 'sent', 'viewed', 'paid', 'overdue', 'archived'];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getPagination = (query) => {
  const requestedPage = Number.parseInt(query.page, 10);
  const requestedPageSize = Number.parseInt(query.pageSize, 10);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageSize = Number.isInteger(requestedPageSize) && requestedPageSize > 0
    ? Math.min(requestedPageSize, MAX_PAGE_SIZE)
    : PAGE_SIZE;

  return { page, pageSize, skip: (page - 1) * pageSize };
};

const getOverview = async (req, res, next) => {
  try {
    const [
      users,
      companies,
      pendingFeedback,
      approvedFeedback,
      rejectedFeedback,
      invoices,
      paidInvoices,
      recentFeedback,
    ] = await Promise.all([
      User.countDocuments(),
      Company.countDocuments(),
      Feedback.countDocuments({ status: 'pending' }),
      Feedback.countDocuments({ status: 'approved' }),
      Feedback.countDocuments({ status: 'rejected' }),
      Invoice.countDocuments(),
      Invoice.countDocuments({ status: 'paid' }),
      Feedback.find({ status: 'pending' })
        .populate('company_id', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.json({
      stats: {
        users,
        companies,
        pendingFeedback,
        approvedFeedback,
        rejectedFeedback,
        invoices,
        paidInvoices,
      },
      recentFeedback,
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { page, pageSize, skip } = getPagination(req.query);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const filter = search
      ? {
        $or: [
          { full_name: new RegExp(escapeRegex(search), 'i') },
          { email: new RegExp(escapeRegex(search), 'i') },
        ],
      }
      : {};

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('full_name email role isEmailVerified authProvider avatar_url subscription createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      User.countDocuments(filter),
    ]);

    const platformAdmins = (process.env.PLATFORM_ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);

    res.json({
      users: users.map((user) => {
        const result = user.toJSON();
        if (platformAdmins.includes(user.email.toLowerCase())) result.role = 'admin';
        return result;
      }),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    next(error);
  }
};

const activateUserSubscription = async (req, res, next) => {
  try {
    if (req.body?.action !== 'activate') {
      return res.status(400).json({ message: 'Action must be activate' });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const platformAdmins = (process.env.PLATFORM_ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
    if (user.role === 'admin' || platformAdmins.includes(user.email.toLowerCase())) {
      return res.status(400).json({ message: 'Platform administrator subscriptions cannot be changed here' });
    }

    if (user.subscription?.stripeSubscriptionId || user.subscription?.stripeCheckoutSessionId) {
      return res.status(409).json({ message: 'This user has a Stripe-managed subscription or pending checkout' });
    }

    const now = new Date();
    const currentEnd = user.subscription?.currentPeriodEnd;
    const extendFrom = user.subscription?.status === 'active'
      && currentEnd
      && new Date(currentEnd).getTime() > now.getTime()
      ? new Date(currentEnd)
      : now;
    const currentStart = user.subscription?.status === 'active'
      && user.subscription?.adminGrantedBy
      && currentEnd
      && new Date(currentEnd).getTime() > now.getTime()
      ? user.subscription.currentPeriodStart || now
      : now;

    user.subscription = {
      ...(user.subscription?.toObject?.() || user.subscription || {}),
      plan: 'enterprise',
      status: 'active',
      billingCycle: 'monthly',
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCheckoutSessionId: null,
      currentPeriodStart: currentStart,
      currentPeriodEnd: new Date(extendFrom.getTime() + MANUAL_SUBSCRIPTION_DAYS * 24 * 60 * 60 * 1000),
      expiryReminderSentFor: null,
      adminGrantedBy: req.user._id,
    };
    await user.save();

    res.json({
      message: `Subscription activated for ${MANUAL_SUBSCRIPTION_DAYS} days`,
      user: {
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getFeedback = async (req, res, next) => {
  try {
    const { page, pageSize, skip } = getPagination(req.query);
    const status = typeof req.query.status === 'string' ? req.query.status : 'all';
    if (status !== 'all' && !FEEDBACK_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid feedback status' });
    }

    const filter = status === 'all' ? {} : { status };
    const [feedback, total, pendingCount] = await Promise.all([
      Feedback.find(filter)
        .populate('company_id', 'name created_by')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Feedback.countDocuments(filter),
      Feedback.countDocuments({ status: 'pending' }),
    ]);

    res.json({
      feedback,
      pendingCount,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    next(error);
  }
};

const getInvoices = async (req, res, next) => {
  try {
    const { page, pageSize, skip } = getPagination(req.query);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const status = typeof req.query.status === 'string' ? req.query.status : 'all';
    if (status !== 'all' && !INVOICE_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid invoice status' });
    }

    const filter = status === 'all' ? {} : { status };
    if (search) {
      const expression = new RegExp(escapeRegex(search), 'i');
      filter.$or = [
        { invoice_number: expression },
        { title: expression },
        { recipient_name: expression },
        { recipient_email: expression },
        { created_by: expression },
      ];
    }

    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .select('invoice_number title amount tax_amount total_amount recipient_name recipient_email due_date status company_id created_by createdAt')
        .populate('company_id', 'name created_by currency')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Invoice.countDocuments(filter),
    ]);

    res.json({
      invoices,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getUsers,
  activateUserSubscription,
  getFeedback,
  getInvoices,
};
