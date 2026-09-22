const ChatMessage = require('../models/ChatMessage');
const { canAccessCompany } = require('../middleware/companyAccess');

// DM room keys are built in the frontend as `dm_<emailA>__<emailB>` (sorted).
function hasDMAccess(userEmail, roomKey) {
  if (!String(roomKey).startsWith('dm_')) return false;
  const emails = String(roomKey).slice(3).split('__').map((e) => e.toLowerCase().trim());
  return emails.includes(String(userEmail).toLowerCase().trim());
}

async function canAccessRoom(userEmail, roomKey) {
  if (!roomKey) return false;
  if (String(roomKey).startsWith('dm_')) return hasDMAccess(userEmail, roomKey);
  return canAccessCompany(userEmail, roomKey);
}

const getMessages = async (req, res) => {
  const { company_id, limit } = req.query;
  if (!company_id) return res.status(400).json({ message: 'company_id required' });
  if (!await canAccessRoom(req.user.email, company_id))
    return res.status(403).json({ message: 'Access denied' });

  const numLimit = parseInt(limit) || 200;
  const messages = await ChatMessage.find({ company_id }).sort({ createdAt: 1 }).limit(numLimit);
  res.json(messages);
};

const sendMessage = async (req, res) => {
  const { company_id } = req.body;
  if (!company_id) return res.status(400).json({ message: 'company_id required' });
  if (!await canAccessRoom(req.user.email, company_id))
    return res.status(403).json({ message: 'Access denied' });

  const message = await ChatMessage.create({ ...req.body, sender_email: req.user.email });
  res.status(201).json(message);
};

const updateMessage = async (req, res) => {
  const message = await ChatMessage.findById(req.params.id);
  if (!message) return res.status(404).json({ message: 'Message not found' });
  if (!await canAccessRoom(req.user.email, message.company_id))
    return res.status(403).json({ message: 'Access denied' });

  const updated = await ChatMessage.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

const deleteMessage = async (req, res) => {
  const message = await ChatMessage.findById(req.params.id);
  if (!message) return res.status(404).json({ message: 'Message not found' });
  if (!await canAccessRoom(req.user.email, message.company_id))
    return res.status(403).json({ message: 'Access denied' });

  await ChatMessage.findByIdAndDelete(req.params.id);
  res.json({ message: 'Message deleted' });
};

module.exports = { getMessages, sendMessage, updateMessage, deleteMessage };