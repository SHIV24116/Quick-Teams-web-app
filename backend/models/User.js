const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  password_hash: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  skills: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: ''
  },
  linkedin: {
    type: DataTypes.STRING(200),
    allowNull: true,
    defaultValue: ''
  },
  github: {
    type: DataTypes.STRING(200),
    allowNull: true,
    defaultValue: ''
  },
  education: {
    type: DataTypes.STRING(200),
    allowNull: true,
    defaultValue: ''
  },
  photo: {
    type: DataTypes.STRING(200),
    allowNull: true,
    defaultValue: ''
  },
  availability: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  about_me: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash && !user.password_hash.startsWith('$2a$')) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash') && !user.password_hash.startsWith('$2a$')) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
      }
    }
  }
});

User.prototype.validPassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

module.exports = User;
