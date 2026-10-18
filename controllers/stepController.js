const Step = require('../models/Step');
const { canAccessCompany } = require('../middleware/companyAccess');
const { respondWithError } = require('../utils/errorResponse');

const getSteps = async (req, res) => {
  try {
    const { company_id } = req.query;
    if (!company_id) return res.status(400).json({ message: 'company_id required' });
    if (!await canAccessCompany(req.user.email, company_id))
      return res.status(403).json({ message: 'Access denied' });
    const steps = await Step.find({ company_id }).sort({ step_number: 1 });
    res.json(steps);
  } catch (err) {
    respondWithError(res, err);
  }
};

const createStep = async (req, res) => {
  try {
    const { company_id } = req.body;
    if (!company_id) return res.status(400).json({ message: 'company_id required' });
    if (!await canAccessCompany(req.user.email, company_id))
      return res.status(403).json({ message: 'Access denied' });

    // Auto-assign next step_number
    if (!req.body.step_number) {
      const last = await Step.findOne({ company_id }).sort({ step_number: -1 });
      req.body.step_number = (last?.step_number || 0) + 1;
    }
    const step = await Step.create({ ...req.body, created_by: req.user.email });
    res.status(201).json(step);
  } catch (err) {
    respondWithError(res, err);
  }
};

const updateStep = async (req, res) => {
  try {
    const step = await Step.findById(req.params.id);
    if (!step) return res.status(404).json({ message: 'Step not found' });
    if (!await canAccessCompany(req.user.email, step.company_id.toString()))
      return res.status(403).json({ message: 'Access denied' });
    const updated = await Step.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    respondWithError(res, err);
  }
};

const deleteStep = async (req, res) => {
  try {
    const step = await Step.findById(req.params.id);
    if (!step) return res.status(404).json({ message: 'Step not found' });
    if (!await canAccessCompany(req.user.email, step.company_id.toString()))
      return res.status(403).json({ message: 'Access denied' });
    await Step.findByIdAndDelete(req.params.id);

    // Re-number remaining steps
    const remaining = await Step.find({ company_id: step.company_id }).sort({ step_number: 1 });
    await Promise.all(remaining.map((s, i) => Step.findByIdAndUpdate(s._id, { step_number: i + 1 })));

    res.json({ message: 'Step deleted' });
  } catch (err) {
    respondWithError(res, err);
  }
};

// Reorder: accepts array of { id, step_number }
const reorderSteps = async (req, res) => {
  try {
    const { company_id, order } = req.body;
    if (!await canAccessCompany(req.user.email, company_id))
      return res.status(403).json({ message: 'Access denied' });
    await Promise.all(order.map(({ id, step_number }) => Step.findByIdAndUpdate(id, { step_number })));
    res.json({ message: 'Reordered' });
  } catch (err) {
    respondWithError(res, err);
  }
};

module.exports = { getSteps, createStep, updateStep, deleteStep, reorderSteps };
