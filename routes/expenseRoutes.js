const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { getExpenses, createExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');

router.use(protect);
router.route('/').get(asyncHandler(getExpenses)).post(asyncHandler(createExpense));
router.route('/:id').put(asyncHandler(updateExpense)).delete(asyncHandler(deleteExpense));

module.exports = router;
