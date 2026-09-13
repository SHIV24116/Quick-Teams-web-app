const { sequelize } = require('../config/db');
const User = require('./User');
const Team = require('./Team');
const TeamMember = require('./TeamMember');
const ConnectionRequest = require('./ConnectionRequest');
const Message = require('./Message');

// Team & User Many-to-Many via TeamMember
User.belongsToMany(Team, { through: TeamMember, foreignKey: 'user_id', as: 'teams' });
Team.belongsToMany(User, { through: TeamMember, foreignKey: 'team_id', as: 'members' });

TeamMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
TeamMember.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });

// Connection Request Associations
ConnectionRequest.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
ConnectionRequest.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });
ConnectionRequest.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });

// Message Associations
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });
Team.hasMany(Message, { foreignKey: 'team_id', as: 'messages' });

module.exports = {
  sequelize,
  User,
  Team,
  TeamMember,
  ConnectionRequest,
  Message
};
