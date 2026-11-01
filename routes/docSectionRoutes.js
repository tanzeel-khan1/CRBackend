const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { getSections, createSection, updateSection, deleteSection } = require('../controllers/documentController');

router.use(protect);
router.route('/').get(asyncHandler(getSections)).post(asyncHandler(createSection));
router.route('/:id').put(asyncHandler(updateSection)).delete(asyncHandler(deleteSection));

module.exports = router;
