const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const IdeaCategory = sequelize.define('IdeaCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  color: {
    type: DataTypes.STRING(7), // Hex color code
    defaultValue: '#007bff',
  },
  icon: {
    type: DataTypes.STRING(50),
  },
  description: {
    type: DataTypes.TEXT,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'idea_categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = IdeaCategory;
