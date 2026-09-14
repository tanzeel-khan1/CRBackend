const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getSections, createSection, updateSection, deleteSection } = require('../controllers/documentController');

router.use(protect);
router.route('/').get(getSections).post(createSection);
router.route('/:id').put(updateSection).delete(deleteSection);

module.exports = router;
