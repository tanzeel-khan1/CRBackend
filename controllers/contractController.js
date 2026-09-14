const Contract = require('../models/Contract');
const Company = require('../models/Company');

const isOwner = async (userEmail, companyId) => {
  const company = await Company.findById(companyId);
  return company && company.created_by === userEmail.toLowerCase().trim();
};

const getContracts = async (req, res) => {
  try {
    const { company_id } = req.query;
    if (!company_id) return res.status(400).json({ message: 'company_id required' });
    if (!await isOwner(req.user.email, company_id))
      return res.status(403).json({ message: 'Only company owner can access contracts' });
    const contracts = await Contract.find({ company_id }).sort({ createdAt: -1 });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createContract = async (req, res) => {
  try {
    const { company_id } = req.body;
    if (!company_id) return res.status(400).json({ message: 'company_id required' });
    if (!await isOwner(req.user.email, company_id))
      return res.status(403).json({ message: 'Only company owner can create contracts' });
    const contract = await Contract.create({ ...req.body, created_by: req.user.email });
    res.status(201).json(contract);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    if (!await isOwner(req.user.email, contract.company_id?.toString()))
      return res.status(403).json({ message: 'Only company owner can update contracts' });
    const updated = await Contract.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    if (!await isOwner(req.user.email, contract.company_id?.toString()))
      return res.status(403).json({ message: 'Only company owner can delete contracts' });
    await Contract.findByIdAndDelete(req.params.id);
    res.json({ message: 'Contract deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getContracts, createContract, updateContract, deleteContract };
