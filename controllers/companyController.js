const Company = require('../models/Company');
const Investor = require('../models/Investor');
const sendCompanyWelcomeEmail = require('../utils/sendCompanyWelcomeEmail');

const getCompanies = async (req, res) => {
  const userEmail = req.user.email.toLowerCase().trim();

  // Companies this user created
  const ownedCompanies = await Company.find({ created_by: userEmail }).sort({ createdAt: -1 });

  // Companies where this user has an accepted invitation, regardless of role.
  const investorRecords = await Investor.find({
    user_email: userEmail,
    invitation_status: { $in: ['accepted', null] },
  });

  const ownedIds = new Set(ownedCompanies.map(c => c._id.toString()));
  const sharedIds = investorRecords
    .map(r => r.company_id?.toString())
    .filter(id => id && !ownedIds.has(id));

  let sharedCompanies = [];
  if (sharedIds.length > 0) {
    sharedCompanies = await Company.find({ _id: { $in: sharedIds } });
  }

  res.json([...ownedCompanies, ...sharedCompanies]);
};

const getCompany = async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) return res.status(404).json({ message: 'Company not found' });
  res.json(company);
};

const createCompany = async (req, res) => {
  const userEmail = req.user.email.toLowerCase().trim();
  const existingCount = await Company.countDocuments({ created_by: userEmail });

  const company = await Company.create({ ...req.body, created_by: userEmail });

  if (existingCount === 0) {
    try {
      await sendCompanyWelcomeEmail({
        email: req.user.email,
        fullName: req.user.full_name,
        companyName: company.name,
      });
    } catch (err) {
      console.error('Company welcome email failed:', err.message);
    }
  }

  res.status(201).json(company);
};

const updateCompany = async (req, res) => {
  const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!company) return res.status(404).json({ message: 'Company not found' });
  res.json(company);
};

const deleteCompany = async (req, res) => {
  const company = await Company.findByIdAndDelete(req.params.id);
  if (!company) return res.status(404).json({ message: 'Company not found' });
  res.json({ message: 'Company deleted' });
};

module.exports = { getCompanies, getCompany, createCompany, updateCompany, deleteCompany };
