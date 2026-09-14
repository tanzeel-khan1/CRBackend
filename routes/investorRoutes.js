const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getInvestors, createInvestor, updateInvestor, deleteInvestor } = require('../controllers/investorController');

router.use(protect);
router.route('/').get(getInvestors).post(createInvestor);
router.route('/:id').put(updateInvestor).delete(deleteInvestor);

module.exports = router;
