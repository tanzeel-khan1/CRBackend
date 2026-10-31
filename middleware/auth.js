/* eslint-disable */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.slice(7).trim();
    }
    if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    return next();
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError
      || error instanceof jwt.TokenExpiredError
      || error instanceof jwt.NotBeforeError
    ) {
      return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
    }
    return next(error);
  }
};

const adminOnly = (req, res, next) => {
  const platformAdmins = (process.env.PLATFORM_ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (
    req.user
    && (req.user.role === 'admin' || platformAdmins.includes(req.user.email.toLowerCase()))
  ) return next();
  res.status(403).json({ message: 'Admin access required' });
};

module.exports = { protect, adminOnly };