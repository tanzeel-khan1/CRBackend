const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getIdeas, createIdea, updateIdea, deleteIdea } = require('../controllers/ideaController');

router.use(protect);
router.route('/').get(getIdeas).post(createIdea);
router.route('/:id').put(updateIdea).delete(deleteIdea);

module.exports = router;
