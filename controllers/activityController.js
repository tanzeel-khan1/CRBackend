const Activity = require('../models/Activity');

const getActivities = async (req, res) => {
  const filter = {};
  if (req.query.company_id) filter.company_id = req.query.company_id;
  if (req.query.user_email) filter.user_email = req.query.user_email;
  const limit = parseInt(req.query.limit) || 100;
  const activities = await Activity.find(filter).sort({ createdAt: -1 }).limit(limit);
  res.json(activities);
};

const createActivity = async (req, res) => {
  const activity = await Activity.create({ ...req.body, user_email: req.user.email });
  res.status(201).json(activity);
};

const deleteCompanyActivities = async (req, res) => {
  try {
    const { company_id } = req.params;

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
