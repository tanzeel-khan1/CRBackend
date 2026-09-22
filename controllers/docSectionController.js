const DocSection = require('../models/DocSection');
const { canAccessCompany } = require('../middleware/companyAccess');

const getSections = async (req, res) => {
  const { company_id } = req.query;
  if (!company_id) return res.status(400).json({ message: 'company_id required' });
  if (!await canAccessCompany(req.user.email, company_id))
    return res.status(403).json({ message: 'Access denied' });
  const sections = await DocSection.find({ company_id }).sort('createdAt');
  res.json(sections);
};

const createSection = async (req, res) => {
  const { company_id } = req.body;
  if (!company_id) return res.status(400).json({ message: 'company_id required' });
  if (!await canAccessCompany(req.user.email, company_id))
    return res.status(403).json({ message: 'Access denied' });
  const section = await DocSection.create({ ...req.body, created_by: req.user.email });
  res.status(201).json(section);
};

const updateSection = async (req, res) => {
  const section = await DocSection.findById(req.params.id);
  if (!section) return res.status(404).json({ message: 'Section not found' });
  if (!await canAccessCompany(req.user.email, section.company_id?.toString()))
    return res.status(403).json({ message: 'Access denied' });
  const updated = await DocSection.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

const deleteSection = async (req, res) => {
  const section = await DocSection.findById(req.params.id);
  if (!section) return res.status(404).json({ message: 'Section not found' });
  if (!await canAccessCompany(req.user.email, section.company_id?.toString()))
    return res.status(403).json({ message: 'Access denied' });
  await DocSection.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};

module.exports = { getSections, createSection, updateSection, deleteSection };