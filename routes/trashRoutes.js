const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getTrash, restoreTrashItem, purgeTrashItem } = require('../controllers/trashController');

router.use(protect);
router.get('/', getTrash);
router.post('/:resource/:id/restore', restoreTrashItem);
router.delete('/:resource/:id', purgeTrashItem);

module.exports = router;
