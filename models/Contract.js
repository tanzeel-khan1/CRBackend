const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, default: '' },
  description: { type: String, default: '' },
  created_by: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Contract', contractSchema);
