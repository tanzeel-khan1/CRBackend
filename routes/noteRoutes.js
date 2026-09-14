const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getNotes, createNote, updateNote, deleteNote } = require('../controllers/noteController');

router.use(protect);
router.route('/').get(getNotes).post(createNote);
router.route('/:id').put(updateNote).delete(deleteNote);

module.exports = router;
