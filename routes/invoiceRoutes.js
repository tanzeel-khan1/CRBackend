const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { getInvoices, createInvoice, updateInvoice, deleteInvoice } = require('../controllers/invoiceController');

router.use(protect);
router.route('/').get(asyncHandler(getInvoices)).post(asyncHandler(createInvoice));
router.route('/:id').put(asyncHandler(updateInvoice)).delete(asyncHandler(deleteInvoice));

module.exports = router;
