const express = require('express');
const router = express.Router();
const { getMatches, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/matches', protect, getMatches);
router.get('/:id', protect, getUserById);

module.exports = router;
