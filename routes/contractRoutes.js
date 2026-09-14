const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getContracts, createContract, updateContract, deleteContract } = require('../controllers/contractController');

router.use(protect);
router.get('/', getContracts);
router.post('/', createContract);
router.put('/:id', updateContract);
router.delete('/:id', deleteContract);

module.exports = router;
