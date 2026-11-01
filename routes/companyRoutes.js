const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { getCompanies, getCompany, createCompany, updateCompany, deleteCompany } = require('../controllers/companyController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', asyncHandler(getCompanies));
router.post('/', asyncHandler(createCompany));
router.get('/:id', asyncHandler(getCompany));
router.put('/:id', asyncHandler(updateCompany));
router.delete('/:id', asyncHandler(deleteCompany));

module.exports = router;