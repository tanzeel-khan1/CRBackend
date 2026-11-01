const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { getContracts, createContract, updateContract, deleteContract } = require('../controllers/contractController');

router.use(protect);
router.get('/', asyncHandler(getContracts));
router.post('/', asyncHandler(createContract));
router.put('/:id', asyncHandler(updateContract));
router.delete('/:id', asyncHandler(deleteContract));

module.exports = router;
