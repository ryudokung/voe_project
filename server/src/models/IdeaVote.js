const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const IdeaVote = sequelize.define('IdeaVote', {
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
  vote_type: {
    type: DataTypes.INTEGER, // +1 for upvote, -1 for downvote
    allowNull: false,
    validate: {
      isIn: [[-1, 1]],
    },
  },
}, {
  tableName: 'idea_votes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['idea_id', 'user_id'],
    },
  ],
});

module.exports = IdeaVote;
