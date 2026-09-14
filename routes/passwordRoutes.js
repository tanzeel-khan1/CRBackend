const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getPasswords, createPassword, updatePassword, deletePassword } = require('../controllers/passwordController');

router.use(protect);
router.route('/').get(getPasswords).post(createPassword);
router.route('/:id').put(updatePassword).delete(deletePassword);

module.exports = router;
