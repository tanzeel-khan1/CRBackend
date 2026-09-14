const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  step_number: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
  color: { type: String, default: 'yellow' },
  created_by: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Step', stepSchema);
