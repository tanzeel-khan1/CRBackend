const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { getInvestors, createInvestor, updateInvestor, deleteInvestor } = require('../controllers/investorController');

router.use(protect);
router.route('/').get(asyncHandler(getInvestors)).post(asyncHandler(createInvestor));
router.route('/:id').put(asyncHandler(updateInvestor)).delete(asyncHandler(deleteInvestor));

module.exports = router;
