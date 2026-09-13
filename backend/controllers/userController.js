const { User } = require('../models');
const { Op } = require('sequelize');
const http = require('http');

// @desc    Get matching users with smart relevance scoring
// @route   GET /api/v1/users/matches
const getMatches = async (req, res) => {
  try {
    const query = (req.query.q || '').trim();
    const currentUserId = req.user.id;

    const availableUsers = await User.findAll({
      where: {
        availability: true,
        id: { [Op.ne]: currentUserId }
      },
      attributes: { exclude: ['password_hash'] }
    });

    if (!query) {
      return res.json(availableUsers);
    }

    const searchTerms = query.replace(/,/g, ' ').split(/\s+/).filter(t => t.length > 0).map(t => t.toLowerCase());

    const scoredUsers = [];

    for (const user of availableUsers) {
      let score = 0;

      // Direct ID match
      if (!isNaN(query) && user.id === parseInt(query, 10)) {
        score += 100;
      }

      const userDataStr = `${user.username || ''} ${user.name || ''} ${user.skills || ''} ${user.about_me || ''}`.toLowerCase();

      for (const term of searchTerms) {
        if (userDataStr.includes(term)) {
          score += 10;
          // Word boundary exact match bonus
          const formattedStr = ` ${userDataStr.replace(/,/g, ' ')} `;
          if (formattedStr.includes(` ${term} `)) {
            score += 5;
          }
        }
      }

      if (score > 0) {
        scoredUsers.push({ score, user });
      }
    }

    scoredUsers.sort((a, b) => b.score - a.score);
    const sortedUsers = scoredUsers.map(item => item.user);

    res.json(sortedUsers);
  } catch (error) {
    console.error('[USER CONTROLLER ERROR] getMatches:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile by ID
// @route   GET /api/v1/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMatches,
  getUserById
};
