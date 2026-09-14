const Idea = require('../models/Idea');
const IdeaComment = require('../models/IdeaComment');
const { canAccessCompany } = require('../middleware/companyAccess');

const getIdeas = async (req, res) => {
  const { company_id } = req.query;
  if (company_id && !await canAccessCompany(req.user.email, company_id))
    return res.status(403).json({ message: 'Access denied' });
  const filter = {};
  if (company_id) filter.company_id = company_id;
  const ideas = await Idea.find(filter).sort({ createdAt: -1 });
  res.json(ideas);
};

const createIdea = async (req, res) => {
  const { company_id } = req.body;
  if (company_id && !await canAccessCompany(req.user.email, company_id))
    return res.status(403).json({ message: 'Access denied' });
  const idea = await Idea.create({ ...req.body, created_by: req.user.email });
  res.status(201).json(idea);
};

const updateIdea = async (req, res) => {
  const idea = await Idea.findById(req.params.id);
  if (!idea) return res.status(404).json({ message: 'Idea not found' });
  if (!await canAccessCompany(req.user.email, idea.company_id?.toString()))
    return res.status(403).json({ message: 'Access denied' });
  const updated = await Idea.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

const deleteIdea = async (req, res) => {
  const idea = await Idea.findById(req.params.id);
  if (!idea) return res.status(404).json({ message: 'Idea not found' });
  if (!await canAccessCompany(req.user.email, idea.company_id?.toString()))
    return res.status(403).json({ message: 'Access denied' });
  await Idea.findByIdAndDelete(req.params.id);
  await IdeaComment.deleteMany({ idea_id: req.params.id });
  res.json({ message: 'Idea deleted' });
};

module.exports = { getIdeas, createIdea, updateIdea, deleteIdea };
