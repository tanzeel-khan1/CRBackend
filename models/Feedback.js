const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  },
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    unique: true,
  },
  client_name: { type: String, required: true, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, trim: true, maxlength: 2000, default: '' },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
