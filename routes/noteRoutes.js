const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { getNotes, createNote, updateNote, deleteNote } = require('../controllers/noteController');

router.use(protect);
router.route('/').get(asyncHandler(getNotes)).post(asyncHandler(createNote));
router.route('/:id').put(asyncHandler(updateNote)).delete(asyncHandler(deleteNote));

module.exports = router;
