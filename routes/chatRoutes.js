const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getMessages, sendMessage, updateMessage, deleteMessage } = require('../controllers/chatController');

router.use(protect);
router.route('/').get(getMessages).post(sendMessage);
router.route('/:id').put(updateMessage).delete(deleteMessage);

module.exports = router;
