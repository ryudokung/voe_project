const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const IdeaComment = sequelize.define('IdeaComment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  idea_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Ideas',
      key: 'id',
    },
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  parent_comment_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'IdeaComments',
      key: 'id',
    },
  },
  is_moderator_note: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_edited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  edited_at: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'idea_comments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = IdeaComment;
