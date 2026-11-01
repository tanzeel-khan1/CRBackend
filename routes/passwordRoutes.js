const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { getPasswords, createPassword, updatePassword, deletePassword } = require('../controllers/passwordController');

router.use(protect);
router.route('/').get(asyncHandler(getPasswords)).post(asyncHandler(createPassword));
router.route('/:id').put(asyncHandler(updatePassword)).delete(asyncHandler(deletePassword));

module.exports = router;
