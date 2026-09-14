const ChatMessage = require('../models/ChatMessage');

const getMessages = async (req, res) => {
  const filter = {};
  if (req.query.company_id) filter.company_id = req.query.company_id;
  const limit = parseInt(req.query.limit) || 200;
  const messages = await ChatMessage.find(filter).sort({ createdAt: 1 }).limit(limit);
  res.json(messages);
};

const sendMessage = async (req, res) => {
  const message = await ChatMessage.create({ ...req.body, sender_email: req.user.email });
  res.status(201).json(message);
};

const updateMessage = async (req, res) => {
  const message = await ChatMessage.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!message) return res.status(404).json({ message: 'Message not found' });
  res.json(message);
};

const deleteMessage = async (req, res) => {
  const message = await ChatMessage.findByIdAndDelete(req.params.id);
  if (!message) return res.status(404).json({ message: 'Message not found' });
  res.json({ message: 'Message deleted' });
};

module.exports = { getMessages, sendMessage, updateMessage, deleteMessage };
