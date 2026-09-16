const Client = require('../models/Client');
const { canAccessCompany } = require('../middleware/companyAccess');

const getClients = async (req, res) => {
  try {
    const { company_id } = req.query;

    if (!company_id || !(await canAccessCompany(req.user.email, company_id))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const clients = await Client.find({ company_id }).sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createClient = async (req, res) => {
  try {
    const data = { ...req.body };

    if (!data.company_id || !(await canAccessCompany(req.user.email, data.company_id))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (data.email) data.email = data.email.toLowerCase().trim();

    const client = await Client.create({
      ...data,
      created_by: req.user.email,
    });

    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) return res.status(404).json({ message: 'Client not found' });

    if (!(await canAccessCompany(req.user.email, client.company_id.toString()))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const data = { ...req.body };
    delete data.company_id;
    delete data.created_by;
    if (data.email) data.email = data.email.toLowerCase().trim();

    const updated = await Client.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) return res.status(404).json({ message: 'Client not found' });

    if (!(await canAccessCompany(req.user.email, client.company_id.toString()))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: 'Client deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getClients, createClient, updateClient, deleteClient };