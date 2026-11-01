const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { getSections, saveSection, updateSection, deleteSection } = require('../controllers/businessPlanController');

router.use(protect);
router.get('/', asyncHandler(getSections));
router.post('/', asyncHandler(saveSection));
router.put('/:id', asyncHandler(updateSection));
router.delete('/:id', asyncHandler(deleteSection));

module.exports = router;
