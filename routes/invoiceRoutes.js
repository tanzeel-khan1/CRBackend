const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getInvoices, createInvoice, updateInvoice, deleteInvoice } = require('../controllers/invoiceController');

router.use(protect);
router.route('/').get(getInvoices).post(createInvoice);
router.route('/:id').put(updateInvoice).delete(deleteInvoice);

module.exports = router;
