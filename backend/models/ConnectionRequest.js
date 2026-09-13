const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ConnectionRequest = sequelize.define('ConnectionRequest', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  receiver_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  team_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  purpose: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined'),
    defaultValue: 'pending'
  }
}, {
  timestamps: true
});

module.exports = ConnectionRequest;
