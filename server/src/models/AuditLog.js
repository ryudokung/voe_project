const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  actor_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  entity: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  entity_id: {
    type: DataTypes.INTEGER,
  },
  detail: {
    type: DataTypes.JSONB,
  },
  ip_address: {
    type: DataTypes.INET,
  },
  user_agent: {
    type: DataTypes.STRING(500),
  },
}, {
  tableName: 'audit_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = AuditLog;
