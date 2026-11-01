const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { getSteps, createStep, updateStep, deleteStep, reorderSteps } = require('../controllers/stepController');

router.use(protect);
router.get('/', asyncHandler(getSteps));
router.post('/', asyncHandler(createStep));
router.post('/reorder', asyncHandler(reorderSteps));
router.put('/:id', asyncHandler(updateStep));
router.delete('/:id', asyncHandler(deleteStep));

module.exports = router;
