const Note = require('../models/Note');
const { canAccessCompany } = require('../middleware/companyAccess');

const getNotes = async (req, res) => {
  const { company_id } = req.query;
  if (company_id && req.query.is_personal !== 'true' && !await canAccessCompany(req.user.email, company_id))
    return res.status(403).json({ message: 'Access denied' });
  const filter = {};
  if (company_id) filter.company_id = company_id;
  if (req.query.is_personal === 'true') {
    filter.is_personal = true;
    filter.created_by = req.user.email;
  }
  const notes = await Note.find(filter).sort({ createdAt: -1 });
  res.json(notes);
};

const createNote = async (req, res) => {
  const { company_id } = req.body;
  if (company_id && !await canAccessCompany(req.user.email, company_id))
    return res.status(403).json({ message: 'Access denied' });
  const note = await Note.create({ ...req.body, created_by: req.user.email });
  res.status(201).json(note);
};

const updateNote = async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ message: 'Note not found' });
  if (note.company_id && !await canAccessCompany(req.user.email, note.company_id.toString()))
    return res.status(403).json({ message: 'Access denied' });
  const updated = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

const deleteNote = async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ message: 'Note not found' });
  if (note.company_id && !await canAccessCompany(req.user.email, note.company_id.toString()))
    return res.status(403).json({ message: 'Access denied' });
  await Note.findByIdAndDelete(req.params.id);
  res.json({ message: 'Note deleted' });
};

module.exports = { getNotes, createNote, updateNote, deleteNote };
