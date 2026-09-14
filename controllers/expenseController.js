const Expense = require('../models/Expense');
const { canAccessCompany } = require('../middleware/companyAccess');

const getExpenses = async (req, res) => {
  const { company_id } = req.query;
  if (company_id && !await canAccessCompany(req.user.email, company_id))
    return res.status(403).json({ message: 'Access denied' });
  const filter = {};
  if (company_id) filter.company_id = company_id;
  const expenses = await Expense.find(filter).sort({ createdAt: -1 });
  res.json(expenses);
};

const createExpense = async (req, res) => {
  const { company_id } = req.body;
  if (company_id && !await canAccessCompany(req.user.email, company_id))
    return res.status(403).json({ message: 'Access denied' });
  const expense = await Expense.create({ ...req.body, created_by: req.user.email });
  res.status(201).json(expense);
};

const updateExpense = async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  if (!await canAccessCompany(req.user.email, expense.company_id?.toString()))
    return res.status(403).json({ message: 'Access denied' });
  const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

const deleteExpense = async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  if (!await canAccessCompany(req.user.email, expense.company_id?.toString()))
    return res.status(403).json({ message: 'Access denied' });
  await Expense.findByIdAndDelete(req.params.id);
  res.json({ message: 'Expense deleted' });
};

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense };
