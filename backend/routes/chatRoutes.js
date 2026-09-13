const express = require('express');
const router = express.Router();
const { getTeamMessages, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:teamId', protect, getTeamMessages);
router.post('/:teamId', protect, sendMessage);

module.exports = router;
