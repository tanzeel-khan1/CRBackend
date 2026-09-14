const DocSection = require('../models/DocSection');

const getSections = async (req, res) => {
  const filter = {};
  if (req.query.company_id) filter.company_id = req.query.company_id;
  const sections = await DocSection.find(filter).sort('createdAt');
  res.json(sections);
};

const createSection = async (req, res) => {
  const section = await DocSection.create(req.body);
  res.status(201).json(section);
};

const updateSection = async (req, res) => {
  const section = await DocSection.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!section) return res.status(404).json({ message: 'Section not found' });
  res.json(section);
};

const deleteSection = async (req, res) => {
  await DocSection.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};

module.exports = { getSections, createSection, updateSection, deleteSection };
