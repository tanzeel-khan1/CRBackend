const Note = require('../models/Note');
const { canAccessCompany } = require('../middleware/companyAccess');

const getNotes = async (req, res) => {
  const { company_id, is_personal } = req.query;

  if (is_personal === 'true') {
    const notes = await Note.find({ is_personal: true, created_by: req.user.email }).sort({ createdAt: -1 });
    return res.json(notes);
  }

  if (!company_id) return res.status(400).json({ message: 'company_id required' });
  if (!await canAccessCompany(req.user.email, company_id))
    return res.status(403).json({ message: 'Access denied' });

  const notes = await Note.find({ company_id }).sort({ createdAt: -1 });
  res.json(notes);
};

const createNote = async (req, res) => {
  const { company_id, is_personal } = req.body;

  if (is_personal === 'true') {
    const note = await Note.create({ ...req.body, company_id: null, created_by: req.user.email });
    return res.status(201).json(note);
  }

  if (!company_id) return res.status(400).json({ message: 'company_id required' });
  if (!await canAccessCompany(req.user.email, company_id))
    return res.status(403).json({ message: 'Access denied' });
  const note = await Note.create({ ...req.body, created_by: req.user.email });
  res.status(201).json(note);
};

const updateNote = async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ message: 'Note not found' });

  if (note.company_id) {
    if (!await canAccessCompany(req.user.email, note.company_id.toString()))
      return res.status(403).json({ message: 'Access denied' });
  } else if (note.created_by !== req.user.email) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const updated = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

const deleteNote = async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ message: 'Note not found' });

  if (note.company_id) {
    if (!await canAccessCompany(req.user.email, note.company_id.toString()))
      return res.status(403).json({ message: 'Access denied' });
  } else if (note.created_by !== req.user.email) {
    return res.status(403).json({ message: 'Access denied' });
  }

  await Note.findByIdAndDelete(req.params.id);
  res.json({ message: 'Note deleted' });
};

module.exports = { getNotes, createNote, updateNote, deleteNote };
