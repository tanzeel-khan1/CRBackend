const Hpc = require('../models/Hpc');
const { canAccessCompany } = require('../middleware/companyAccess');

const getHpcs = async (req, res) => {
  try {
    const { company_id } = req.query;
    if (company_id && !(await canAccessCompany(req.user.email, company_id))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filter = {};
    if (company_id) filter.company_id = company_id;

    const hpcs = await Hpc.find(filter).sort({ createdAt: -1 });
    res.json(hpcs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createHpc = async (req, res) => {
  try {
    const { company_id } = req.body;
    if (company_id && !(await canAccessCompany(req.user.email, company_id))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const hpc = await Hpc.create({ ...req.body, created_by: req.user.email });
    res.status(201).json(hpc);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getHpcs, createHpc, updateHpc, deleteHpc };
