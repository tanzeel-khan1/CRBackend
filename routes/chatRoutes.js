const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { getMessages, sendMessage, updateMessage, deleteMessage } = require('../controllers/chatController');

router.use(protect);
router.route('/').get(asyncHandler(getMessages)).post(asyncHandler(sendMessage));
router.route('/:id').put(asyncHandler(updateMessage)).delete(asyncHandler(deleteMessage));

module.exports = router;
