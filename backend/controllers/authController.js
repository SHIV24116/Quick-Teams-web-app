const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'quickteams_super_secret_jwt_key_2026', {
    expiresIn: '30d'
  });
};

// @desc    Register new user
// @route   POST /api/v1/auth/register
const registerUser = async (req, res) => {
  try {
    const { username, password, name, skills, linkedin, github, education, about_me } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const cleanUsername = username.trim().toLowerCase();

    const userExists = await User.findOne({ where: { username: cleanUsername } });
    if (userExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    let photo = '';
    if (req.file) {
      photo = req.file.filename;
    }

    const user = await User.create({
      username: cleanUsername,
      password_hash: password,
      name: name || '',
      skills: skills || '',
      linkedin: linkedin || '',
      github: github || '',
      education: education || '',
      about_me: about_me || '',
      photo: photo
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        skills: user.skills,
        linkedin: user.linkedin,
        github: user.github,
        education: user.education,
        photo: user.photo,
        availability: user.availability,
        about_me: user.about_me
      },
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('[AUTH ERROR] Register:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/v1/auth/login
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const user = await User.findOne({ where: { username: cleanUsername } });

    if (user && (await user.validPassword(password))) {
      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          skills: user.skills,
          linkedin: user.linkedin,
          github: user.github,
          education: user.education,
          photo: user.photo,
          availability: user.availability,
          about_me: user.about_me
        },
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('[AUTH ERROR] Login:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/v1/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, skills, linkedin, github, education, about_me, availability } = req.body;

    if (name !== undefined) user.name = name;
    if (skills !== undefined) user.skills = skills;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (github !== undefined) user.github = github;
    if (education !== undefined) user.education = education;
    if (about_me !== undefined) user.about_me = about_me;
    if (availability !== undefined) user.availability = availability === 'true' || availability === true;

    if (req.file) {
      user.photo = req.file.filename;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        skills: user.skills,
        linkedin: user.linkedin,
        github: user.github,
        education: user.education,
        photo: user.photo,
        availability: user.availability,
        about_me: user.about_me
      }
    });
  } catch (error) {
    console.error('[AUTH ERROR] Update Profile:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile
};
