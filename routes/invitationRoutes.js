const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getMyInvitations, acceptInvitation, rejectInvitation } = require('../controllers/invitationController');

router.use(protect);
router.get('/', getMyInvitations);
router.put('/:id/accept', acceptInvitation);
router.put('/:id/reject', rejectInvitation);

module.exports = router;
