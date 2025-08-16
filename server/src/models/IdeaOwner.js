const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const IdeaOwner = sequelize.define('IdeaOwner', {
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
  owner_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  assigned_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  role_description: {
    type: DataTypes.STRING(200),
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'idea_owners',
  timestamps: true,
  createdAt: 'assigned_at',
  updatedAt: 'updated_at',
});

module.exports = IdeaOwner;
