const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { getClients, createClient, updateClient, deleteClient } = require('../controllers/clientController');

router.use(protect);
router.route('/').get(asyncHandler(getClients)).post(asyncHandler(createClient));
router.route('/:id').put(asyncHandler(updateClient)).delete(asyncHandler(deleteClient));

module.exports = router;