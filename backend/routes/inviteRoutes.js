const express = require('express');
const router = express.Router();
const {
  sendInvite,
  getIncomingInvites,
  acceptInvite,
  declineInvite
} = require('../controllers/inviteController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendInvite);
router.get('/incoming', protect, getIncomingInvites);
router.post('/:id/accept', protect, acceptInvite);
router.post('/:id/decline', protect, declineInvite);

module.exports = router;
