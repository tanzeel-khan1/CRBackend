const Employee = require('../models/Employee');
const { canAccessCompany } = require('../middleware/companyAccess');

const getEmployees = async (req, res) => {
  const { company_id } = req.query;
  if (company_id && !await canAccessCompany(req.user.email, company_id))
    return res.status(403).json({ message: 'Access denied' });
  const filter = {};
  if (company_id) filter.company_id = company_id;
  const employees = await Employee.find(filter).sort({ createdAt: -1 });
  res.json(employees);
};

const createEmployee = async (req, res) => {
  const { company_id } = req.body;
  if (company_id && !await canAccessCompany(req.user.email, company_id))
    return res.status(403).json({ message: 'Access denied' });
  const employee = await Employee.create({ ...req.body, created_by: req.user.email });
  res.status(201).json(employee);
};

const updateEmployee = async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) return res.status(404).json({ message: 'Employee not found' });
  if (!await canAccessCompany(req.user.email, employee.company_id?.toString()))
    return res.status(403).json({ message: 'Access denied' });
  const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

const deleteEmployee = async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) return res.status(404).json({ message: 'Employee not found' });
  if (!await canAccessCompany(req.user.email, employee.company_id?.toString()))
    return res.status(403).json({ message: 'Access denied' });
  await Employee.findByIdAndDelete(req.params.id);
  res.json({ message: 'Employee deleted' });
};

module.exports = { getEmployees, createEmployee, updateEmployee, deleteEmployee };
