const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getSteps, createStep, updateStep, deleteStep, reorderSteps } = require('../controllers/stepController');

router.use(protect);
router.get('/', getSteps);
router.post('/', createStep);
router.post('/reorder', reorderSteps);
router.put('/:id', updateStep);
router.delete('/:id', deleteStep);

module.exports = router;
