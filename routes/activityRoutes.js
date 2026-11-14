const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { getActivities, createActivity, deleteCompanyActivities } = require('../controllers/activityController');

router.use(protect);
router.route('/').get(asyncHandler(getActivities)).post(asyncHandler(createActivity));

router.delete('/company/:company_id', asyncHandler(deleteCompanyActivities));

module.exports = router;		