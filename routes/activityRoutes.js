const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getActivities, createActivity, deleteCompanyActivities } = require('../controllers/activityController');

router.use(protect);
router.route('/').get(getActivities).post(createActivity);

router.delete('/company/:company_id', deleteCompanyActivities);

module.exports = router;
