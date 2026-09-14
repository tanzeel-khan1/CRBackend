const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // full_name: { type: String, required: true, trim: true },
  // email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  // password: { type: String, required: true, minlength: 6 },
  // role: { type: String, enum: ['admin', 'user'], default: 'user' },
  // avatar_url: { type: String },
  full_name: {
    type: String,
    required: true,
    trim: true,
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  
  password: {
    type: String,
    minlength: 6,
   
  },
  isEmailVerified: {
  type: Boolean,
  default: false,
},

emailOtp: {
  type: String,
  default: null,
},

emailOtpExpires: {
  type: Date,
  default: null,
},
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  
  avatar_url: {
    type: String,
  },
  stripeCustomerId: {
  type: String,
  default: null,
},

subscription: {
  plan: {
    type: String,
    default: "free",
  },
  status: {
    type: String,
    default: "inactive",
  },
  billingCycle: {
    type: String,
    default: null,
  },
  stripeSubscriptionId: {
    type: String,
    default: null,
  },
  stripePriceId: {
    type: String,
    default: null,
  },
  stripeCheckoutSessionId: {
    type: String,
    default: null,
  },
  currentPeriodStart: {
    type: Date,
    default: null,
  },
  currentPeriodEnd: {
    type: Date,
    default: null,
  },
  expiryReminderSentFor: {
    type: Date,
    default: null,
  },
},
}, { timestamps: true });

userSchema.index({ email: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);