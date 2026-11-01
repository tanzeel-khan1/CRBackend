const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const {
  getOverview,
  getUsers,
  activateUserSubscription,
  getFeedback,
  getInvoices,
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect, adminOnly);
router.get('/overview', asyncHandler(getOverview));
router.get('/users', asyncHandler(getUsers));
router.patch('/users/:id/subscription', asyncHandler(activateUserSubscription));
router.get('/feedback', asyncHandler(getFeedback));
router.get('/invoices', asyncHandler(getInvoices));

module.exports = router;
