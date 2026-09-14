const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getDocuments, createDocument, updateDocument, deleteDocument } = require('../controllers/documentController');

router.use(protect);
router.route('/').get(getDocuments).post(createDocument);
router.route('/:id').put(updateDocument).delete(deleteDocument);

module.exports = router;
