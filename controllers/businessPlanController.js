const BusinessPlan = require('../models/BusinessPlan');
const { canAccessCompany } = require('../middleware/companyAccess');

const getSections = async (req, res) => {
  const { company_id } = req.query;
  if (!company_id) return res.status(400).json({ message: 'company_id required' });
  if (!await canAccessCompany(req.user.email, company_id))
    return res.status(403).json({ message: 'Access denied' });
  const sections = await BusinessPlan.find({ company_id }).sort({ createdAt: 1 });
  res.json(sections);
};

// Upsert: create if not exists, update if exists
const saveSection = async (req, res) => {
  const { company_id, section_type, ...rest } = req.body;
  if (!company_id || !section_type) return res.status(400).json({ message: 'company_id and section_type required' });
  if (!await canAccessCompany(req.user.email, company_id))
    return res.status(403).json({ message: 'Access denied' });
  const section = await BusinessPlan.findOneAndUpdate(
    { company_id, section_type },
    { ...rest, company_id, section_type, created_by: req.user.email },
    { new: true, upsert: true }
  );
  res.json(section);
};

const updateSection = async (req, res) => {
  const section = await BusinessPlan.findById(req.params.id);
  if (!section) return res.status(404).json({ message: 'Section not found' });
  if (!await canAccessCompany(req.user.email, section.company_id.toString()))
    return res.status(403).json({ message: 'Access denied' });
  const updated = await BusinessPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

const deleteSection = async (req, res) => {
  const section = await BusinessPlan.findById(req.params.id);
  if (!section) return res.status(404).json({ message: 'Section not found' });
  if (!await canAccessCompany(req.user.email, section.company_id.toString()))
    return res.status(403).json({ message: 'Access denied' });
  await BusinessPlan.findByIdAndDelete(req.params.id);
  res.json({ message: 'Section deleted' });
};

module.exports = { getSections, saveSection, updateSection, deleteSection };
