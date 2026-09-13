const { Team, User, TeamMember, ConnectionRequest, Message } = require('../models');

// @desc    Create a new team
// @route   POST /api/v1/teams
const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    const team = await Team.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      created_by: req.user.id
    });

    await TeamMember.create({
      team_id: team.id,
      user_id: req.user.id,
      role: 'admin'
    });

    const fullTeam = await Team.findByPk(team.id, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'username', 'name', 'photo', 'skills'],
          through: { attributes: ['role'] }
        }
      ]
    });

    res.status(201).json({
      message: `Team '${team.name}' created successfully`,
      team: fullTeam
    });
  } catch (error) {
    console.error('[TEAM CONTROLLER ERROR] createTeam:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's teams (both member and admin teams)
// @route   GET /api/v1/teams/my
const getMyTeams = async (req, res) => {
  try {
    const userId = req.user.id;

    const userTeams = await Team.findAll({
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'username', 'name', 'photo', 'skills'],
          through: { attributes: ['role'] }
        }
      ]
    });

    // Filter teams where user is a member
    const myTeams = userTeams.filter(team =>
      team.members.some(m => m.id === userId)
    );

    res.json(myTeams);
  } catch (error) {
    console.error('[TEAM CONTROLLER ERROR] getMyTeams:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get team by ID with full details & members
// @route   GET /api/v1/teams/:id
const getTeamById = async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'username', 'name', 'photo', 'skills', 'about_me'],
          through: { attributes: ['role', 'createdAt'] }
        }
      ]
    });

    if (!team) {
      return res.status(404).json({ message: 'Team workspace not found' });
    }

    // Check if current user is member
    const isMember = team.members.some(m => m.id === req.user.id);
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this team workspace' });
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Promote member to Admin
// @route   POST /api/v1/teams/:id/make-admin/:userId
const makeAdmin = async (req, res) => {
  try {
    const teamId = req.params.id;
    const targetUserId = parseInt(req.params.userId, 10);

    const callerMembership = await TeamMember.findOne({
      where: { team_id: teamId, user_id: req.user.id }
    });

    if (!callerMembership || callerMembership.role !== 'admin') {
      return res.status(403).json({ message: 'Only team admins can promote members' });
    }

    const targetMembership = await TeamMember.findOne({
      where: { team_id: teamId, user_id: targetUserId }
    });

    if (!targetMembership) {
      return res.status(404).json({ message: 'Target user is not a member of this team' });
    }

    targetMembership.role = 'admin';
    await targetMembership.save();

    res.json({ message: 'Member successfully promoted to Admin' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove member from team (Admin action)
// @route   DELETE /api/v1/teams/:id/members/:userId
const removeMember = async (req, res) => {
  try {
    const teamId = req.params.id;
    const targetUserId = parseInt(req.params.userId, 10);

    const callerMembership = await TeamMember.findOne({
      where: { team_id: teamId, user_id: req.user.id }
    });

    if (!callerMembership || callerMembership.role !== 'admin') {
      return res.status(403).json({ message: 'Only team admins can remove members' });
    }

    if (targetUserId === req.user.id) {
      return res.status(400).json({ message: 'Use leave team endpoint to leave your own team' });
    }

    await TeamMember.destroy({
      where: { team_id: teamId, user_id: targetUserId }
    });

    res.json({ message: 'Member removed from team' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Leave team workspace
// @route   POST /api/v1/teams/:id/leave
const leaveTeam = async (req, res) => {
  try {
    const teamId = req.params.id;
    await TeamMember.destroy({
      where: { team_id: teamId, user_id: req.user.id }
    });
    res.json({ message: 'You have left the team workspace' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTeam,
  getMyTeams,
  getTeamById,
  makeAdmin,
  removeMember,
  leaveTeam
};
