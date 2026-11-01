const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
<<<<<<< HEAD
const asyncHandler = require('../middleware/asyncHandler');
const { getTrash, restoreTrashItem, purgeTrashItem } = require('../controllers/trashController');

router.use(protect);
router.get('/', asyncHandler(getTrash));
router.post('/:resource/:id/restore', asyncHandler(restoreTrashItem));
router.delete('/:resource/:id', asyncHandler(purgeTrashItem));
=======
const { getTrash, restoreTrashItem, purgeTrashItem } = require('../controllers/trashController');

router.use(protect);
router.get('/', getTrash);
router.post('/:resource/:id/restore', restoreTrashItem);
router.delete('/:resource/:id', purgeTrashItem);
>>>>>>> 83595b6967ef8bdb2edb4a6e722a113919985b22

module.exports = router;
