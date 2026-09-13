const { ConnectionRequest, Team, User, TeamMember } = require('../models');

// @desc    Send a team invitation to a user
// @route   POST /api/v1/invites
const sendInvite = async (req, res) => {
  try {
    const { receiver_id, team_id, purpose } = req.body;

    if (!receiver_id || !team_id) {
      return res.status(400).json({ message: 'Target user ID and team ID are required' });
    }

    // Check if caller is admin of the team
    const adminMembership = await TeamMember.findOne({
      where: {
        team_id: team_id,
        user_id: req.user.id,
        role: 'admin'
      }
    });

    if (!adminMembership) {
      return res.status(403).json({ message: 'You must be an admin of the selected team to send invites' });
    }

    // Check if target user is already in team
    const existingMember = await TeamMember.findOne({
      where: { team_id, user_id: receiver_id }
    });
    if (existingMember) {
      return res.status(400).json({ message: 'User is already a member of this team' });
    }

    // Check if pending invite already exists
    const existingInvite = await ConnectionRequest.findOne({
      where: {
        receiver_id,
        team_id,
        status: 'pending'
      }
    });

    if (existingInvite) {
      return res.status(400).json({ message: 'An invite to this team is already pending for this user' });
    }

    const invite = await ConnectionRequest.create({
      sender_id: req.user.id,
      receiver_id,
      team_id,
      purpose: purpose || 'Join our hackathon project!',
      status: 'pending'
    });

    res.status(201).json({ message: 'Invitation sent successfully', invite });
  } catch (error) {
    console.error('[INVITE CONTROLLER ERROR] sendInvite:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's incoming pending connection requests/invites
// @route   GET /api/v1/invites/incoming
const getIncomingInvites = async (req, res) => {
  try {
    const invites = await ConnectionRequest.findAll({
      where: {
        receiver_id: req.user.id,
        status: 'pending'
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'name', 'photo', 'skills'] },
        { model: Team, as: 'team', attributes: ['id', 'name', 'description'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(invites);
  } catch (error) {
    console.error('[INVITE CONTROLLER ERROR] getIncomingInvites:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept invite
// @route   POST /api/v1/invites/:id/accept
const acceptInvite = async (req, res) => {
  try {
    const invite = await ConnectionRequest.findByPk(req.params.id);

    if (!invite || invite.receiver_id !== req.user.id) {
      return res.status(404).json({ message: 'Invitation not found or unauthorized' });
    }

    invite.status = 'accepted';
    await invite.save();

    // Add user to team
    await TeamMember.findOrCreate({
      where: {
        team_id: invite.team_id,
        user_id: req.user.id
      },
      defaults: {
        role: 'member'
      }
    });

    res.json({ message: 'Invitation accepted! You joined the team workspace.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Decline invite
// @route   POST /api/v1/invites/:id/decline
const declineInvite = async (req, res) => {
  try {
    const invite = await ConnectionRequest.findByPk(req.params.id);

    if (!invite || invite.receiver_id !== req.user.id) {
      return res.status(404).json({ message: 'Invitation not found or unauthorized' });
    }

    invite.status = 'declined';
    await invite.save();

    res.json({ message: 'Invitation declined' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendInvite,
  getIncomingInvites,
  acceptInvite,
  declineInvite
};
