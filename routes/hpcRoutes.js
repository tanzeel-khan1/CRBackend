const express = require('express');
const { getHpcs, createHpc, updateHpc, deleteHpc } = require('../controllers/hpcController');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();
router.use(protect);

router.get('/', asyncHandler(getHpcs));
router.post('/', asyncHandler(createHpc));
router.put('/:id', asyncHandler(updateHpc));
router.delete('/:id', asyncHandler(deleteHpc));

module.exports = router;
