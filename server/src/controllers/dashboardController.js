const { Op } = require('sequelize');
const { 
  Idea, 
  User, 
  IdeaCategory, 
  Department, 
  IdeaVote,
  IdeaStatusHistory,
  sequelize 
} = require('../models');

// Get dashboard overview statistics
const getDashboardOverview = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let dateFilter = {};
    
    switch (period) {
      case '7d':
        dateFilter = { [Op.gte]: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        dateFilter = { [Op.gte]: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case '90d':
        dateFilter = { [Op.gte]: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
        break;
      case '1y':
        dateFilter = { [Op.gte]: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
        break;
      default:
        dateFilter = {}; // All time
    }

    // Base query conditions based on user role
    let baseIdeaQuery = {};
    if (req.user.role === 'employee') {
      baseIdeaQuery = {
        [Op.or]: [
          { visibility: 'public' },
          { creator_id: req.user.id },
          {
            visibility: 'department',
            '$creator.department_id$': req.user.department_id
          }
        ]
      };
    }

    // Total ideas
    const totalIdeas = await Idea.count({
      where: {
        ...baseIdeaQuery,
        ...(Object.keys(dateFilter).length && { created_at: dateFilter })
      },
      include: req.user.role === 'employee' ? [{ 
        model: User, 
        as: 'creator',
        attributes: [] 
      }] : []
    });

    // Ideas by status
    const ideasByStatus = await Idea.findAll({
      where: {
        ...baseIdeaQuery,
        ...(Object.keys(dateFilter).length && { created_at: dateFilter })
      },
      include: req.user.role === 'employee' ? [{ 
        model: User, 
        as: 'creator',
        attributes: [] 
      }] : [],
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('Idea.id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Total votes
    const totalVotes = await IdeaVote.count({
      include: [{
        model: Idea,
        as: 'idea',
        where: baseIdeaQuery,
        include: req.user.role === 'employee' ? [{
          model: User,
          as: 'creator',
          attributes: []
        }] : []
      }],
      ...(Object.keys(dateFilter).length && { where: { created_at: dateFilter } })
    });

    // Active users (users who created ideas or voted in the period)
    const activeUsersQuery = `
      SELECT COUNT(DISTINCT user_id) as count 
      FROM (
        SELECT creator_id as user_id FROM ideas 
        WHERE created_at >= $1
        UNION
        SELECT user_id FROM idea_votes 
        WHERE created_at >= $1
      ) active_users
    `;
    
    const startDate = Object.keys(dateFilter).length 
      ? dateFilter[Op.gte] 
      : new Date('2020-01-01');
    
    const [activeUsersResult] = await sequelize.query(activeUsersQuery, {
      bind: [startDate],
      type: sequelize.QueryTypes.SELECT
    });

    // Ideas by category
    const ideasByCategory = await Idea.findAll({
      where: {
        ...baseIdeaQuery,
        ...(Object.keys(dateFilter).length && { created_at: dateFilter })
      },
      include: [
        { 
          model: IdeaCategory, 
          as: 'category',
          attributes: ['name', 'color']
        },
        ...(req.user.role === 'employee' ? [{ 
          model: User, 
          as: 'creator',
          attributes: [] 
        }] : [])
      ],
      attributes: [
        [sequelize.col('category.name'), 'category'],
        [sequelize.col('category.color'), 'color'],
        [sequelize.fn('COUNT', sequelize.col('Idea.id')), 'count']
      ],
      group: ['category.id', 'category.name', 'category.color'],
      raw: true
    });

    // Top voted ideas
    const topVotedIdeas = await Idea.findAll({
      where: {
        ...baseIdeaQuery,
        vote_count: { [Op.gt]: 0 },
        ...(Object.keys(dateFilter).length && { created_at: dateFilter })
      },
      include: [
        { 
          model: User, 
          as: 'creator',
          attributes: ['name', 'employee_no']
        },
        { 
          model: IdeaCategory, 
          as: 'category',
          attributes: ['name', 'color']
        }
      ],
      order: [['vote_count', 'DESC']],
      limit: 5
    });

    // Average idea-to-action time (submitted to in_pilot or implemented)
    const ideaToActionQuery = `
      SELECT AVG(EXTRACT(epoch FROM (sh.changed_at - i.created_at)) / 86400) as avg_days
      FROM ideas i
      INNER JOIN idea_status_history sh ON i.id = sh.idea_id
      WHERE sh.to_status IN ('in_pilot', 'implemented')
      AND i.created_at >= $1
    `;
    
    const [ideaToActionResult] = await sequelize.query(ideaToActionQuery, {
      bind: [startDate],
      type: sequelize.QueryTypes.SELECT
    });

    // Recent activity (status changes)
    const recentActivity = await IdeaStatusHistory.findAll({
      where: {
        changed_at: dateFilter[Op.gte] ? { [Op.gte]: dateFilter[Op.gte] } : {}
      },
      include: [
        {
          model: Idea,
          as: 'idea',
          where: baseIdeaQuery,
          attributes: ['id', 'title', 'code'],
          include: req.user.role === 'employee' ? [{
            model: User,
            as: 'creator',
            attributes: []
          }] : []
        },
        {
          model: User,
          as: 'changedBy',
          attributes: ['name']
        }
      ],
      order: [['changed_at', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        overview: {
          total_ideas: totalIdeas,
          total_votes: totalVotes,
          active_users: parseInt(activeUsersResult?.count || 0),
          avg_idea_to_action_days: Math.round(parseFloat(ideaToActionResult?.avg_days || 0) * 10) / 10
        },
        ideas_by_status: ideasByStatus,
        ideas_by_category: ideasByCategory,
        top_voted_ideas: topVotedIdeas,
        recent_activity: recentActivity,
        period
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
};

// Get department statistics (for executives and admins)
const getDepartmentStats = async (req, res) => {
  try {
    if (!['executive', 'admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let dateFilter = {};
    
    switch (period) {
      case '7d':
        dateFilter = { [Op.gte]: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        dateFilter = { [Op.gte]: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case '90d':
        dateFilter = { [Op.gte]: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
        break;
      default:
        dateFilter = {};
    }

    const departmentStats = await Department.findAll({
      include: [
        {
          model: User,
          as: 'users',
          attributes: [],
          include: [
            {
              model: Idea,
              as: 'createdIdeas',
              attributes: [],
              where: Object.keys(dateFilter).length ? { created_at: dateFilter } : {},
              required: false
            }
          ]
        }
      ],
      attributes: [
        'id',
        'name',
        [sequelize.fn('COUNT', sequelize.col('users.createdIdeas.id')), 'idea_count'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('users.id'))), 'user_count']
      ],
      group: ['Department.id', 'Department.name'],
      order: [[sequelize.literal('idea_count'), 'DESC']]
    });

    res.json({
      success: true,
      data: {
        departments: departmentStats,
        period
      }
    });
  } catch (error) {
    console.error('Department stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching department statistics'
    });
  }
};

module.exports = {
  getDashboardOverview,
  getDepartmentStats
};
