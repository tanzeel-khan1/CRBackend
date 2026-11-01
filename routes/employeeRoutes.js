const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { getEmployees, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');

router.use(protect);
router.route('/').get(asyncHandler(getEmployees)).post(asyncHandler(createEmployee));
router.route('/:id').put(asyncHandler(updateEmployee)).delete(asyncHandler(deleteEmployee));

module.exports = router;
