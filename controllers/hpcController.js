const Hpc = require('../models/Hpc');
const { canAccessCompany } = require('../middleware/companyAccess');
const { respondWithError } = require('../utils/errorResponse');

const getHpcs = async (req, res) => {
  try {
    const { company_id } = req.query;
    if (!company_id) {
      return res.status(400).json({ message: 'company_id required' });
    }
    if (!(await canAccessCompany(req.user.email, company_id))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const hpcs = await Hpc.find({ company_id }).sort({ createdAt: -1 });
    res.json(hpcs);
  } catch (error) {
    respondWithError(res, error);
  }
};

const createHpc = async (req, res) => {
  try {
    const { company_id } = req.body;
    if (!company_id) {
      return res.status(400).json({ message: 'company_id required' });
    }
    if (!(await canAccessCompany(req.user.email, company_id))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const hpc = await Hpc.create({ ...req.body, created_by: req.user.email });
    res.status(201).json(hpc);
  } catch (error) {
    respondWithError(res, error);
  }
};

const updateHpc = async (req, res) => {
  try {
    const hpc = await Hpc.findById(req.params.id);
    if (!hpc) return res.status(404).json({ message: 'HPC not found' });

    if (!(await canAccessCompany(req.user.email, hpc.company_id?.toString()))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updated = await Hpc.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updated);
  } catch (error) {
    respondWithError(res, error);
  }
};

const deleteHpc = async (req, res) => {
  try {
    const hpc = await Hpc.findById(req.params.id);
    if (!hpc) return res.status(404).json({ message: 'HPC not found' });

    if (!(await canAccessCompany(req.user.email, hpc.company_id?.toString()))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Hpc.findByIdAndDelete(req.params.id);
    res.json({ message: 'HPC deleted' });
  } catch (error) {
    respondWithError(res, error);
  }
};

module.exports = { getHpcs, createHpc, updateHpc, deleteHpc };
