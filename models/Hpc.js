const mongoose = require('mongoose');

const hpcSchema = new mongoose.Schema({
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  title: { type: String, required: true, trim: true },
  full_form: { type: String, default: 'High Performance Center', trim: true },
  short_name: { type: String, trim: true },
  description: { type: String },
  focus_area: { type: String },
  status: { type: String, enum: ['planned', 'active', 'completed', 'paused'], default: 'planned' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  owner: { type: String },
  target_date: { type: Date },
  notes: { type: String },
  created_by: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Hpc', hpcSchema);
