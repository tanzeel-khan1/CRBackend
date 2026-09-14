const mongoose = require('mongoose');

const agreementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const investorSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },

    user_email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      enum: [
        'owner',
        'admin',
        'investor',
        'finance_manager',
        'accountant',
        'auditor',
        'viewer',
      ],
      default: 'investor',
    },

    equity_percentage: {
      type: Number,
      default: 0,
    },

    total_invested: {
      type: Number,
      default: 0,
    },

    total_withdrawn: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ['active', 'invited', 'inactive', 'pending', 'accepted'],
      default: 'pending',
    },

    // Invitation & contract
    // invitation_status: {
    //   type: String,
    //   enum: ['pending', 'accepted', 'rejected'],
    //   default: 'accepted', // backward-compatible: existing records treated as accepted
    // },
    invitation_status: {
  type: String,
  enum: ['pending', 'accepted', 'rejected'],
  default: 'pending',   // ✅ FIX THIS
},
    contract_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', default: null },
    contract_agreed: { type: Boolean, default: false },

    agreements: {
      type: [agreementSchema],
      default: [],
      validate: {
        validator: function (value) {
          return value.length <= 4;
        },
        message: 'Maximum 4 agreements are allowed',
      },
    },

    created_by: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Investor', investorSchema);