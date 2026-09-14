const Invoice = require('../models/Invoice');
const { canAccessCompany } = require('../middleware/companyAccess');

const getInvoices = async (req, res) => {
  const { company_id } = req.query;
  if (company_id && !await canAccessCompany(req.user.email, company_id))
    return res.status(403).json({ message: 'Access denied' });
  const filter = {};
  if (company_id) filter.company_id = company_id;
  const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
  res.json(invoices);
};

const createInvoice = async (req, res) => {
  const { company_id } = req.body;
  if (company_id && !await canAccessCompany(req.user.email, company_id))
    return res.status(403).json({ message: 'Access denied' });
  const invoice = await Invoice.create({ ...req.body, created_by: req.user.email });
  res.status(201).json(invoice);
};

const updateInvoice = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
  if (!await canAccessCompany(req.user.email, invoice.company_id?.toString()))
    return res.status(403).json({ message: 'Access denied' });
  const updated = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

const deleteInvoice = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
  if (!await canAccessCompany(req.user.email, invoice.company_id?.toString()))
    return res.status(403).json({ message: 'Access denied' });
  await Invoice.findByIdAndDelete(req.params.id);
  res.json({ message: 'Invoice deleted' });
};

module.exports = { getInvoices, createInvoice, updateInvoice, deleteInvoice };
