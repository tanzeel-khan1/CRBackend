const Document = require('../models/Document');
const DocSection = require('../models/DocSection');
const { canAccessCompany } = require('../middleware/companyAccess');

const getDocuments = async (req, res) => {
  const { company_id, is_personal } = req.query;

  if (is_personal === 'true') {
    const docs = await Document.find({ is_personal: true, created_by: req.user.email }).sort({ createdAt: -1 });
    return res.json(docs);
  }

  if (!company_id) return res.status(400).json({ message: 'company_id required' });
  if (!await canAccessCompany(req.user.email, company_id))
    return res.status(403).json({ message: 'Access denied' });

  const docs = await Document.find({ company_id }).sort({ createdAt: -1 });
  res.json(docs);
};

const createDocument = async (req, res) => {
  try {
    const data = { ...req.body };
    const { company_id, is_personal } = data;

    if (is_personal === 'true') {
      // Personal document — belongs to the current user only.
      const doc = await Document.create({ ...data, company_id: null, created_by: req.user.email });
      return res.status(201).json(doc);
    }

    if (!company_id) return res.status(400).json({ message: 'company_id required' });
    if (!await canAccessCompany(req.user.email, company_id))
      return res.status(403).json({ message: 'Access denied' });

    if (!data.section_id) delete data.section_id;
    const doc = await Document.create({ ...data, created_by: req.user.email });
    res.status(201).json(doc);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    if (doc.company_id) {
      if (!await canAccessCompany(req.user.email, doc.company_id.toString()))
        return res.status(403).json({ message: 'Access denied' });
    } else if (doc.created_by !== req.user.email) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const data = { ...req.body };
    if (!data.section_id) data.section_id = null;
    const updated = await Document.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteDocument = async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Document not found' });

  if (doc.company_id) {
    if (!await canAccessCompany(req.user.email, doc.company_id.toString()))
      return res.status(403).json({ message: 'Access denied' });
  } else if (doc.created_by !== req.user.email) {
    return res.status(403).json({ message: 'Access denied' });
  }

  await Document.findByIdAndDelete(req.params.id);
  res.json({ message: 'Document deleted' });
};

const getSections = async (req, res) => {
  const { company_id } = req.query;
  if (!company_id) return res.status(400).json({ message: 'company_id required' });
  if (!await canAccessCompany(req.user.email, company_id))
    return res.status(403).json({ message: 'Access denied' });
  const sections = await DocSection.find({ company_id }).sort({ createdAt: 1 });
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
  await Document.deleteMany({ section_id: req.params.id });
  res.json({ message: 'Section deleted' });
};

module.exports = { getDocuments, createDocument, updateDocument, deleteDocument, getSections, createSection, updateSection, deleteSection };
