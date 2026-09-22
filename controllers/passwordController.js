const Password = require('../models/Password');
const { canAccessCompany } = require('../middleware/companyAccess');
const { encrypt, decrypt } = require('../utils/encrypt');

const getPasswords = async (req, res) => {
  const { company_id } = req.query;
  if (!company_id) return res.status(400).json({ message: 'company_id required' });
  if (!await canAccessCompany(req.user.email, company_id))
    return res.status(403).json({ message: 'Access denied' });

  const passwords = await Password.find({ company_id }).sort({ createdAt: -1 });
  const safe = passwords.map((p) => {
    const json = p.toJSON();
    if (json.password) json.password = decrypt(json.password);
    return json;
  });
  res.json(safe);
};

const createPassword = async (req, res) => {
  const { company_id, password } = req.body;
  if (!company_id) return res.status(400).json({ message: 'company_id required' });
  if (!await canAccessCompany(req.user.email, company_id))
    return res.status(403).json({ message: 'Access denied' });

  const created = await Password.create({
    ...req.body,
    password: encrypt(password),
    created_by: req.user.email,
  });

  const json = created.toJSON();
  if (json.password) json.password = decrypt(json.password);
  res.status(201).json(json);
};

const updatePassword = async (req, res) => {
  const password = await Password.findById(req.params.id);
  if (!password) return res.status(404).json({ message: 'Password not found' });

  if (!await canAccessCompany(req.user.email, password.company_id?.toString()))
    return res.status(403).json({ message: 'Access denied' });

  const data = { ...req.body };
  delete data.company_id; // never allow moving a record to another company
  delete data.created_by;
  if (data.password !== undefined) data.password = encrypt(data.password);

  const updated = await Password.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });

  const json = updated.toJSON();
  if (json.password) json.password = decrypt(json.password);
  res.json(json);
};

const deletePassword = async (req, res) => {
  const password = await Password.findById(req.params.id);
  if (!password) return res.status(404).json({ message: 'Password not found' });

  if (!await canAccessCompany(req.user.email, password.company_id?.toString()))
    return res.status(403).json({ message: 'Access denied' });

  await Password.findByIdAndDelete(req.params.id);
  res.json({ message: 'Password deleted' });
};

module.exports = { getPasswords, createPassword, updatePassword, deletePassword };