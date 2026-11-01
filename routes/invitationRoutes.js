const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { getMyInvitations, acceptInvitation, rejectInvitation } = require('../controllers/invitationController');

router.use(protect);
router.get('/', asyncHandler(getMyInvitations));
router.put('/:id/accept', asyncHandler(acceptInvitation));
router.put('/:id/reject', asyncHandler(rejectInvitation));

module.exports = router;
