const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { getIdeas, createIdea, updateIdea, deleteIdea } = require('../controllers/ideaController');

router.use(protect);
router.route('/').get(asyncHandler(getIdeas)).post(asyncHandler(createIdea));
router.route('/:id').put(asyncHandler(updateIdea)).delete(asyncHandler(deleteIdea));

module.exports = router;
