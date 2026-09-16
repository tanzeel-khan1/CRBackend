const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    budget: {
      type: Number,
      min: 0,
      default: 0,
    },
    address: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Viewing', 'Negotiating', 'Closed', 'Lost'],
      default: 'New',
    },
    closed_date: {
      type: Date,
    },
    created_by: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Client', clientSchema);