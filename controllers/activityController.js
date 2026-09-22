const Activity = require('../models/Activity');
const { canAccessCompany } = require('../middleware/companyAccess');

const getActivities = async (req, res) => {
  const { company_id, user_email } = req.query;

  if (company_id) {
    if (!await canAccessCompany(req.user.email, company_id))
      return res.status(403).json({ message: 'Access denied' });
  } else if (user_email) {
    // Users may only read their own activity feed.
    if (String(user_email).toLowerCase().trim() !== String(req.user.email).toLowerCase().trim())
      return res.status(403).json({ message: 'Access denied' });
  } else {
    return res.status(400).json({ message: 'company_id or user_email required' });
  }

  const filter = {};
  if (company_id) filter.company_id = company_id;
  if (user_email) filter.user_email = user_email;
  const limit = parseInt(req.query.limit) || 100;
  const activities = await Activity.find(filter).sort({ createdAt: -1 }).limit(limit);
  res.json(activities);
};

const createActivity = async (req, res) => {
  const { company_id } = req.body;
  if (company_id && !await canAccessCompany(req.user.email, company_id))
    return res.status(403).json({ message: 'Access denied' });
  const activity = await Activity.create({ ...req.body, user_email: req.user.email });
  res.status(201).json(activity);
};

const deleteCompanyActivities = async (req, res) => {
  try {
    const { company_id } = req.params;

    if (!await canAccessCompany(req.user.email, company_id))
      return res.status(403).json({ message: 'Access denied' });

    const result = await Activity.deleteMany({ company_id });

    res.status(200).json({
      success: true,
      deletedCount: result.deletedCount,
      message: 'Company activities deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = { getActivities, createActivity, deleteCompanyActivities  };