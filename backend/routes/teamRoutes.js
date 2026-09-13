const express = require('express');
const router = express.Router();
const {
  createTeam,
  getMyTeams,
  getTeamById,
  makeAdmin,
  removeMember,
  leaveTeam
} = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createTeam);
router.get('/my', protect, getMyTeams);
router.get('/:id', protect, getTeamById);
router.post('/:id/make-admin/:userId', protect, makeAdmin);
router.delete('/:id/members/:userId', protect, removeMember);
router.post('/:id/leave', protect, leaveTeam);

module.exports = router;
