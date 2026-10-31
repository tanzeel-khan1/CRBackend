const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const generateOTP = require("../utils/generateOTP");
const sendOTPEmail = require("../utils/sendOTPEmail");
const crypto = require('crypto');
const createMailer = require('../utils/mailer');

const findLocalAccountByEmail = (email) => User.findOne({
  email,
  $or: [{ authProvider: 'local' }, { authProvider: { $exists: false } }],
  password: { $exists: true, $ne: null },
});

// POST /api/auth/register
// const register = async (req, res) => {
//   const { full_name, email, password, role } = req.body;
//   const exists = await User.findOne({ email });
//   if (exists) return res.status(400).json({ message: 'Email already registered' });

//   const user = await User.create({ full_name, email, password, role });
//   res.status(201).json({ ...user.toJSON(), token: generateToken(user._id) });
// };
const register = async (req, res) => {
  const { full_name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "Email already registered" });

  const otp = generateOTP();
const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

  const user = await User.create({
    full_name,
    email,
    password,
    emailOtp: otp,
    emailOtpExpires: otpExpires,
    isEmailVerified: false,
  });

  await sendOTPEmail(email, otp);

  res.status(201).json({
    message: "OTP sent to email. Verify to continue.",
    userId: user._id,
  });
};
// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  res.json({ ...user.toJSON(), token: generateToken(user._id) });
};


const verifyEmailOTP = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.isEmailVerified) {
    return res.status(400).json({ message: "Already verified" });
  }

  if (user.emailOtp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (user.emailOtpExpires < Date.now()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  user.isEmailVerified = true;
  user.emailOtp = null;
  user.emailOtpExpires = null;

  await user.save();

  res.json({
    message: "Email verified successfully",
    ...user.toJSON(),
    token: generateToken(user._id),
  });
};

const requestPasswordReset = async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailPassword = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  if (!emailUser || !emailPassword) {
    return res.status(503).json({ message: 'Email service is not configured.' });
  }

  const user = await findLocalAccountByEmail(email);
  if (!user) {
    return res.json({ message: 'If an account exists for this email, a reset code has been sent.' });
  }

  const otp = generateOTP();
  user.passwordResetOtpHash = crypto.createHash('sha256').update(otp).digest('hex');
  user.passwordResetOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
  await user.save();

  try {
    await createMailer().sendMail({
      from: `"Ranvola" <${emailUser}>`,
      to: email,
      subject: 'Your Ranvola password reset code',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;color:#111;">
          <h2>Reset your password</h2>
          <p>Enter this code in Ranvola to choose a new password:</p>
          <p style="font-size:30px;font-weight:bold;letter-spacing:8px;text-align:center;">${otp}</p>
          <p>This code expires in 5 minutes. If you did not request a password reset, you can ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Password reset email failed:', error.message);
    user.passwordResetOtpHash = null;
    user.passwordResetOtpExpires = null;
    await user.save();
    return res.status(503).json({ message: 'Unable to send the reset code right now. Please try again later.' });
  }

  return res.json({ message: 'If an account exists for this email, a reset code has been sent.' });
};

const resetPassword = async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const otp = typeof req.body.otp === 'string' ? req.body.otp.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!email || !/^\d{6}$/.test(otp) || password.length < 6) {
    return res.status(400).json({ message: 'Enter a valid email, 6-digit code, and password with at least 6 characters.' });
  }

  const user = await findLocalAccountByEmail(email);
  if (!user || !user.passwordResetOtpHash || !user.passwordResetOtpExpires) {
    return res.status(400).json({ message: 'Invalid or expired reset code.' });
  }

  if (user.passwordResetOtpExpires.getTime() <= Date.now()) {
    user.passwordResetOtpHash = null;
    user.passwordResetOtpExpires = null;
    await user.save();
    return res.status(400).json({ message: 'Reset code expired. Please request a new one.' });
  }

  const submittedHash = crypto.createHash('sha256').update(otp).digest();
  const savedHash = Buffer.from(user.passwordResetOtpHash, 'hex');
  if (savedHash.length !== submittedHash.length || !crypto.timingSafeEqual(savedHash, submittedHash)) {
    return res.status(400).json({ message: 'Invalid or expired reset code.' });
  }

  user.password = password;
  user.passwordResetOtpHash = null;
  user.passwordResetOtpExpires = null;
  await user.save();

  return res.json({ message: 'Password reset successfully. You can now sign in.' });
};

// POST /api/auth/google

const googleLogin = async (req, res) => {
  const { full_name, email, avatar_url } = req.body;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      full_name,
      email,
      avatar_url,
    });
  }

  res.json({
    ...user.toJSON(),
    token: generateToken(user._id),
  });
};
// GET /api/auth/me
const getMe = async (req, res) => {
  const user = req.user.toJSON();
  const platformAdmins = (process.env.PLATFORM_ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (platformAdmins.includes(req.user.email.toLowerCase())) user.role = 'admin';
  res.json(user);
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (full_name !== undefined) {
      const trimmed = full_name.trim();
      if (!trimmed) {
        return res.status(400).json({ message: "Name is required" });
      }
      user.full_name = trimmed;
    }

    if (email !== undefined) {
      const normalized = email.trim().toLowerCase();
      if (!normalized) {
        return res.status(400).json({ message: "Email is required" });
      }
      if (normalized !== user.email) {
        const exists = await User.findOne({ email: normalized });
        if (exists) {
          return res.status(400).json({ message: "Email already in use" });
        }
        user.email = normalized;
      }
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters",
        });
      }
      user.password = password;
    }

    await user.save();

    return res.json({
      message: "Profile updated successfully",
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
  
};

module.exports = {
  register,
  login,
  getMe,
  googleLogin,
  updateProfile,
  verifyEmailOTP,
  requestPasswordReset,
  resetPassword,
};