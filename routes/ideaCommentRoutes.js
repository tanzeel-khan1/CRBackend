const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { getComments, createComment } = require('../controllers/ideaCommentController');

router.use(protect);
router.route('/').get(asyncHandler(getComments)).post(asyncHandler(createComment));

module.exports = router;
