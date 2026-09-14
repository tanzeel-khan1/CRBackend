const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getSections, saveSection, updateSection, deleteSection } = require('../controllers/businessPlanController');

router.use(protect);
router.get('/', getSections);
router.post('/', saveSection);
router.put('/:id', updateSection);
router.delete('/:id', deleteSection);

module.exports = router;
