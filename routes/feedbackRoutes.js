const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
<<<<<<< HEAD
const asyncHandler = require('../middleware/asyncHandler');
=======
>>>>>>> 83595b6967ef8bdb2edb4a6e722a113919985b22
const {
  getSubmissionForm,
  submitFeedback,
  getPublicCompanyFeedback,
  getCompanyFeedbackStatus,
  getMyFeedback,
  getPendingFeedback,
  updateFeedbackStatus,
} = require('../controllers/feedbackController');

<<<<<<< HEAD
router.get('/public/company/:companyId', asyncHandler(getPublicCompanyFeedback));
router.get('/public/:token', asyncHandler(getSubmissionForm));
router.post('/public/:token', asyncHandler(submitFeedback));

router.get('/company/status', protect, asyncHandler(getCompanyFeedbackStatus));
router.get('/mine', protect, asyncHandler(getMyFeedback));
router.get('/admin/pending', protect, adminOnly, asyncHandler(getPendingFeedback));
router.patch('/admin/:id/status', protect, adminOnly, asyncHandler(updateFeedbackStatus));
=======
router.get('/public/company/:companyId', getPublicCompanyFeedback);
router.get('/public/:token', getSubmissionForm);
router.post('/public/:token', submitFeedback);

router.get('/company/status', protect, getCompanyFeedbackStatus);
router.get('/mine', protect, getMyFeedback);
router.get('/admin/pending', protect, adminOnly, getPendingFeedback);
router.patch('/admin/:id/status', protect, adminOnly, updateFeedbackStatus);
>>>>>>> 83595b6967ef8bdb2edb4a6e722a113919985b22

module.exports = router;
