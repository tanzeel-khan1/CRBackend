const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getSubmissionForm,
  submitFeedback,
  getPublicCompanyFeedback,
  getCompanyFeedbackStatus,
  getMyFeedback,
  getPendingFeedback,
  updateFeedbackStatus,
} = require('../controllers/feedbackController');

router.get('/public/company/:companyId', getPublicCompanyFeedback);
router.get('/public/:token', getSubmissionForm);
router.post('/public/:token', submitFeedback);

router.get('/company/status', protect, getCompanyFeedbackStatus);
router.get('/mine', protect, getMyFeedback);
router.get('/admin/pending', protect, adminOnly, getPendingFeedback);
router.patch('/admin/:id/status', protect, adminOnly, updateFeedbackStatus);

module.exports = router;
