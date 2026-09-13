const { Message, User, TeamMember } = require('../models');

// @desc    Get messages for a team workspace
// @route   GET /api/v1/chats/:teamId
const getTeamMessages = async (req, res) => {
  try {
    const teamId = req.params.teamId;

    // Check membership
    const membership = await TeamMember.findOne({
      where: { team_id: teamId, user_id: req.user.id }
    });

    if (!membership) {
      return res.status(403).json({ message: 'You must be a member of this team to view chat' });
    }

    const messages = await Message.findAll({
      where: { team_id: teamId },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'name', 'photo'] }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json(messages);
  } catch (error) {
    console.error('[CHAT CONTROLLER ERROR] getTeamMessages:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message to team workspace
// @route   POST /api/v1/chats/:teamId
const sendMessage = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    // Check membership
    const membership = await TeamMember.findOne({
      where: { team_id: teamId, user_id: req.user.id }
    });

    if (!membership) {
      return res.status(403).json({ message: 'You must be a member of this team to send chat messages' });
    }

    const msg = await Message.create({
      team_id: teamId,
      sender_id: req.user.id,
      content: content.trim()
    });

    const fullMsg = await Message.findByPk(msg.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'name', 'photo'] }
      ]
    });

    res.status(201).json(fullMsg);
  } catch (error) {
    console.error('[CHAT CONTROLLER ERROR] sendMessage:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTeamMessages,
  sendMessage
};
