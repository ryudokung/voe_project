const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM('idea_status_change', 'new_comment', 'idea_assigned', 'vote_received', 'system_announcement'),
    allowNull: false,
  },
  ref_id: {
    type: DataTypes.INTEGER, // Reference to the related entity (idea_id, comment_id, etc.)
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  payload: {
    type: DataTypes.JSONB, // Additional data for the notification
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  read_at: {
    type: DataTypes.DATE,
  },
  email_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  email_sent_at: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Notification;
