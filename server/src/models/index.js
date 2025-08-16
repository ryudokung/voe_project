const sequelize = require('../config/database');

// Import all models
const User = require('./User');
const Department = require('./Department');
const IdeaCategory = require('./IdeaCategory');
const Idea = require('./Idea');
const IdeaVote = require('./IdeaVote');
const IdeaComment = require('./IdeaComment');
const IdeaStatusHistory = require('./IdeaStatusHistory');
const IdeaOwner = require('./IdeaOwner');
const Attachment = require('./Attachment');
const Notification = require('./Notification');
const AuditLog = require('./AuditLog');

// Define associations
// User associations
User.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Department.hasMany(User, { foreignKey: 'department_id', as: 'users' });

// Idea associations
Idea.belongsTo(User, { foreignKey: 'creator_id', as: 'creator' });
Idea.belongsTo(IdeaCategory, { foreignKey: 'category_id', as: 'category' });
User.hasMany(Idea, { foreignKey: 'creator_id', as: 'createdIdeas' });
IdeaCategory.hasMany(Idea, { foreignKey: 'category_id', as: 'ideas' });

// Vote associations
IdeaVote.belongsTo(Idea, { foreignKey: 'idea_id', as: 'idea' });
IdeaVote.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Idea.hasMany(IdeaVote, { foreignKey: 'idea_id', as: 'votes' });
User.hasMany(IdeaVote, { foreignKey: 'user_id', as: 'votes' });

// Comment associations
IdeaComment.belongsTo(Idea, { foreignKey: 'idea_id', as: 'idea' });
IdeaComment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
IdeaComment.belongsTo(IdeaComment, { foreignKey: 'parent_comment_id', as: 'parentComment' });
IdeaComment.hasMany(IdeaComment, { foreignKey: 'parent_comment_id', as: 'replies' });
Idea.hasMany(IdeaComment, { foreignKey: 'idea_id', as: 'comments' });
User.hasMany(IdeaComment, { foreignKey: 'user_id', as: 'comments' });

// Status History associations
IdeaStatusHistory.belongsTo(Idea, { foreignKey: 'idea_id', as: 'idea' });
IdeaStatusHistory.belongsTo(User, { foreignKey: 'changed_by', as: 'changedBy' });
Idea.hasMany(IdeaStatusHistory, { foreignKey: 'idea_id', as: 'statusHistory' });
User.hasMany(IdeaStatusHistory, { foreignKey: 'changed_by', as: 'statusChanges' });

// Idea Owner associations
IdeaOwner.belongsTo(Idea, { foreignKey: 'idea_id', as: 'idea' });
IdeaOwner.belongsTo(User, { foreignKey: 'owner_user_id', as: 'owner' });
IdeaOwner.belongsTo(User, { foreignKey: 'assigned_by', as: 'assignedBy' });
Idea.hasMany(IdeaOwner, { foreignKey: 'idea_id', as: 'owners' });
User.hasMany(IdeaOwner, { foreignKey: 'owner_user_id', as: 'ownedIdeas' });
User.hasMany(IdeaOwner, { foreignKey: 'assigned_by', as: 'assignedIdeas' });

// Attachment associations
Attachment.belongsTo(Idea, { foreignKey: 'idea_id', as: 'idea' });
Attachment.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });
Idea.hasMany(Attachment, { foreignKey: 'idea_id', as: 'attachments' });
User.hasMany(Attachment, { foreignKey: 'uploaded_by', as: 'uploadedFiles' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });

// Audit Log associations
AuditLog.belongsTo(User, { foreignKey: 'actor_id', as: 'actor' });
User.hasMany(AuditLog, { foreignKey: 'actor_id', as: 'auditLogs' });

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  Department,
  IdeaCategory,
  Idea,
  IdeaVote,
  IdeaComment,
  IdeaStatusHistory,
  IdeaOwner,
  Attachment,
  Notification,
  AuditLog,
};
