const mongoose = require('mongoose');

const businessPlanSchema = new mongoose.Schema({
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  section_type: { type: String, required: true },
  category: { type: String, default: 'overview' },
  title: { type: String },
  content: { type: String, default: '' },
  color: { type: String, default: 'blue' },
  created_by: { type: String },
}, { timestamps: true });

businessPlanSchema.index({ company_id: 1, section_type: 1 }, { unique: true });

module.exports = mongoose.model('BusinessPlan', businessPlanSchema);
