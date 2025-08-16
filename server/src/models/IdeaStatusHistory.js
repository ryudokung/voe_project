const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const IdeaStatusHistory = sequelize.define('IdeaStatusHistory', {
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
  from_status: {
    type: DataTypes.ENUM('submitted', 'under_review', 'shortlisted', 'in_pilot', 'implemented', 'closed'),
    allowNull: true, // null for initial creation
  },
  to_status: {
    type: DataTypes.ENUM('submitted', 'under_review', 'shortlisted', 'in_pilot', 'implemented', 'closed'),
    allowNull: false,
  },
  changed_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  note: {
    type: DataTypes.TEXT,
  },
  due_date: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'idea_status_history',
  timestamps: true,
  createdAt: 'changed_at',
  updatedAt: false,
});

module.exports = IdeaStatusHistory;
