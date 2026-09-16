const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getProperties, createProperty, updateProperty, deleteProperty } = require('../controllers/propertyController');

router.use(protect);
router.route('/').get(getProperties).post(createProperty);
router.route('/:id').put(updateProperty).delete(deleteProperty);

module.exports = router;