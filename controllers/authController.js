const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const generateOTP = require("../utils/generateOTP");
const sendOTPEmail = require("../utils/sendOTPEmail");

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
  res.json(req.user);
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

module.exports = { register, login, getMe, googleLogin, updateProfile, verifyEmailOTP, };