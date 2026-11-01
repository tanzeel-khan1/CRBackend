const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { getDocuments, createDocument, updateDocument, deleteDocument } = require('../controllers/documentController');

router.use(protect);
router.route('/').get(asyncHandler(getDocuments)).post(asyncHandler(createDocument));
router.route('/:id').put(asyncHandler(updateDocument)).delete(asyncHandler(deleteDocument));

module.exports = router;
