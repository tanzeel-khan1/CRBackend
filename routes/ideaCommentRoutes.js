const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getComments, createComment } = require('../controllers/ideaCommentController');

router.use(protect);
router.route('/').get(getComments).post(createComment);

module.exports = router;
