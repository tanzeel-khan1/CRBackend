const Client = require('../models/Client');
const Feedback = require('../models/Feedback');
const crypto = require('crypto');
const { canAccessCompany } = require('../middleware/companyAccess');
const { softDeleteById, softDeleteOne } = require('../utils/softDelete');

const getClients = async (req, res, next) => {
  try {
    const { company_id } = req.query;

    if (!company_id || !(await canAccessCompany(req.user.email, company_id))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const clients = await Client.find({ company_id }).sort({ createdAt: -1 });
    const clientsWithoutToken = clients.filter((client) => !client.feedback_token);
    await Promise.all(clientsWithoutToken.map((client) => Client.updateOne(
      { _id: client._id, feedback_token: { $in: [null, ''] } },
      { $set: { feedback_token: crypto.randomBytes(24).toString('hex') } }
    )));
    const clientsWithTokens = clientsWithoutToken.length
      ? await Client.find({ company_id }).sort({ createdAt: -1 })
      : clients;
    res.json(clientsWithTokens);
  } catch (error) {
    next(error);
  }
};

const createClient = async (req, res, next) => {
  try {
    const data = { ...req.body };

    if (!data.company_id || !(await canAccessCompany(req.user.email, data.company_id))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    delete data.feedback_token;
    if (data.email) data.email = data.email.toLowerCase().trim();

    const client = await Client.create({
      ...data,
      created_by: req.user.email,
      feedback_token: crypto.randomBytes(24).toString('hex'),
    });

    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
};

const updateClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) return res.status(404).json({ message: 'Client not found' });

    if (!(await canAccessCompany(req.user.email, client.company_id.toString()))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const data = { ...req.body };
    delete data.company_id;
    delete data.created_by;
    delete data.feedback_token;
    if (data.email) data.email = data.email.toLowerCase().trim();

    const updated = await Client.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) return res.status(404).json({ message: 'Client not found' });

    if (!(await canAccessCompany(req.user.email, client.company_id.toString()))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await softDeleteOne(Feedback, { client_id: client._id }, req.user.email);
    await softDeleteById(Client, req.params.id, req.user.email);
    res.json({ message: 'Client deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getClients, createClient, updateClient, deleteClient };