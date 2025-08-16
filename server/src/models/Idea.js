const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Idea = sequelize.define('Idea', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'IdeaCategories',
      key: 'id',
    },
  },
  creator_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('submitted', 'under_review', 'shortlisted', 'in_pilot', 'implemented', 'closed'),
    defaultValue: 'submitted',
  },
  visibility: {
    type: DataTypes.ENUM('public', 'department', 'private'),
    defaultValue: 'public',
  },
  attachment_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  vote_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  comment_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  expected_benefit: {
    type: DataTypes.TEXT,
  },
  implementation_notes: {
    type: DataTypes.TEXT,
  },
  due_date: {
    type: DataTypes.DATE,
  },
  closed_reason: {
    type: DataTypes.TEXT,
  },
  closed_at: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'ideas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (idea) => {
      // Generate unique idea code
      const prefix = 'VOE';
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.random().toString(36).substr(2, 3).toUpperCase();
      idea.code = `${prefix}-${timestamp}-${random}`;
    },
  },
});

module.exports = Idea;
