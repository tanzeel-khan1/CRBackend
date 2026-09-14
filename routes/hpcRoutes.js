const express = require('express');
const { getHpcs, createHpc, updateHpc, deleteHpc } = require('../controllers/hpcController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', getHpcs);
router.post('/', createHpc);
router.put('/:id', updateHpc);
router.delete('/:id', deleteHpc);

module.exports = router;
