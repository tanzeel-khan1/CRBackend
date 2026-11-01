const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const {
  getSubmissionForm,
  submitFeedback,
  getPublicCompanyFeedback,
  getCompanyFeedbackStatus,
  getMyFeedback,
  getPendingFeedback,
  updateFeedbackStatus,
} = require('../controllers/feedbackController');

router.get('/public/company/:companyId', asyncHandler(getPublicCompanyFeedback));
router.get('/public/:token', asyncHandler(getSubmissionForm));
router.post('/public/:token', asyncHandler(submitFeedback));

router.get('/company/status', protect, asyncHandler(getCompanyFeedbackStatus));
router.get('/mine', protect, asyncHandler(getMyFeedback));
router.get('/admin/pending', protect, adminOnly, asyncHandler(getPendingFeedback));
router.patch('/admin/:id/status', protect, adminOnly, asyncHandler(updateFeedbackStatus));

module.exports = router;
