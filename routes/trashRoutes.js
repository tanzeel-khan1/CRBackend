const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { getTrash, restoreTrashItem, purgeTrashItem } = require('../controllers/trashController');

router.use(protect);
router.get('/', asyncHandler(getTrash));
router.post('/:resource/:id/restore', asyncHandler(restoreTrashItem));
router.delete('/:resource/:id', asyncHandler(purgeTrashItem));

module.exports = router;
