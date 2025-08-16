const { Op } = require('sequelize');
const { 
  Idea, 
  User, 
  IdeaCategory, 
  Department, 
  IdeaVote, 
  IdeaComment, 
  IdeaStatusHistory,
  IdeaOwner,
  Attachment,
  Notification,
  sequelize 
} = require('../models');
const { validationResult } = require('express-validator');
const { createAuditLog } = require('../middleware/audit');

// Create new idea
const createIdea = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { title, description, category_id, expected_benefit, visibility = 'public' } = req.body;
    const userId = req.user.id;

    // Verify category exists
    const category = await IdeaCategory.findByPk(category_id);
    if (!category || !category.is_active) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid or inactive category',
      });
    }

    // Create idea
    const idea = await Idea.create({
      title,
      description,
      category_id,
      creator_id: userId,
      expected_benefit,
      visibility,
    }, { transaction });

    // Create initial status history
    await IdeaStatusHistory.create({
      idea_id: idea.id,
      from_status: null,
      to_status: 'submitted',
      changed_by: userId,
      note: 'Idea submitted',
    }, { transaction });

    await transaction.commit();

    // Fetch the complete idea with relations
    const createdIdea = await Idea.findByPk(idea.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'employee_no'] },
        { model: IdeaCategory, as: 'category' },
        { model: IdeaVote, as: 'votes' },
        { model: IdeaComment, as: 'comments' },
        { model: IdeaStatusHistory, as: 'statusHistory', include: [{ model: User, as: 'changedBy', attributes: ['name'] }] },
      ],
    });

    // Log the creation
    await createAuditLog(userId, 'create', 'idea', idea.id, { title, category_id }, req);

    res.status(201).json({
      success: true,
      message: 'Idea created successfully',
      data: { idea: createdIdea },
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create idea error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating idea',
    });
  }
};

// Get ideas with filtering and pagination
const getIdeas = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      department,
      q, // search query
      sort = 'created_at',
      order = 'DESC',
      my_ideas = false 
    } = req.query;

    const offset = (page - 1) * limit;
    const userId = req.user.id;

    // Build where conditions
    const whereConditions = {};

    // Status filter
    if (status && status !== 'all') {
      whereConditions.status = status;
    }

    // Category filter
    if (category && category !== 'all') {
      whereConditions.category_id = category;
    }

    // Search query
    if (q) {
      whereConditions[Op.or] = [
        { title: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
      ];
    }

    // My ideas filter
    if (my_ideas === 'true') {
      whereConditions.creator_id = userId;
    }

    // Visibility filter based on user role
    if (req.user.role === 'employee') {
      whereConditions[Op.or] = [
        { visibility: 'public' },
        { creator_id: userId },
        { 
          visibility: 'department',
          '$creator.department_id$': req.user.department_id
        }
      ];
    }

    // Include conditions for department filter
    const includeConditions = [
      { 
        model: User, 
        as: 'creator', 
        attributes: ['id', 'name', 'employee_no', 'department_id'],
        include: [{ model: Department, as: 'department', attributes: ['name'] }],
        ...(department && department !== 'all' ? { where: { department_id: department } } : {})
      },
      { model: IdeaCategory, as: 'category' },
      { 
        model: IdeaVote, 
        as: 'votes',
        attributes: ['vote_type', 'user_id']
      },
    ];

    const ideas = await Idea.findAndCountAll({
      where: whereConditions,
      include: includeConditions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort, order.toUpperCase()]],
      distinct: true,
    });

    // Add user vote status and calculate scores
    const ideasWithVotes = ideas.rows.map(idea => {
      const userVote = idea.votes.find(vote => vote.user_id === userId);
      const upvotes = idea.votes.filter(vote => vote.vote_type === 1).length;
      const downvotes = idea.votes.filter(vote => vote.vote_type === -1).length;
      
      return {
        ...idea.toJSON(),
        user_vote: userVote ? userVote.vote_type : null,
        upvotes,
        downvotes,
        vote_score: upvotes - downvotes,
      };
    });

    res.json({
      success: true,
      data: {
        ideas: ideasWithVotes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: ideas.count,
          pages: Math.ceil(ideas.count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get ideas error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching ideas',
    });
  }
};

// Get single idea by ID
const getIdeaById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const idea = await Idea.findByPk(id, {
      include: [
        { 
          model: User, 
          as: 'creator', 
          attributes: ['id', 'name', 'employee_no'],
          include: [{ model: Department, as: 'department' }]
        },
        { model: IdeaCategory, as: 'category' },
        { 
          model: IdeaVote, 
          as: 'votes',
          include: [{ model: User, as: 'user', attributes: ['name'] }]
        },
        { 
          model: IdeaComment, 
          as: 'comments',
          include: [
            { model: User, as: 'user', attributes: ['name', 'role'] },
            { 
              model: IdeaComment, 
              as: 'replies',
              include: [{ model: User, as: 'user', attributes: ['name', 'role'] }]
            }
          ],
          where: { parent_comment_id: null },
          required: false
        },
        { 
          model: IdeaStatusHistory, 
          as: 'statusHistory',
          include: [{ model: User, as: 'changedBy', attributes: ['name'] }],
          order: [['changed_at', 'ASC']]
        },
        { 
          model: IdeaOwner, 
          as: 'owners',
          where: { is_active: true },
          required: false,
          include: [{ model: User, as: 'owner', attributes: ['name', 'employee_no'] }]
        },
        { 
          model: Attachment, 
          as: 'attachments',
          where: { is_deleted: false },
          required: false
        }
      ],
    });

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found',
      });
    }

    // Check visibility permissions
    const canView = (
      idea.visibility === 'public' ||
      idea.creator_id === userId ||
      req.user.role === 'moderator' ||
      req.user.role === 'executive' ||
      req.user.role === 'admin' ||
      (idea.visibility === 'department' && idea.creator.department_id === req.user.department_id)
    );

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Calculate vote statistics
    const userVote = idea.votes.find(vote => vote.user_id === userId);
    const upvotes = idea.votes.filter(vote => vote.vote_type === 1).length;
    const downvotes = idea.votes.filter(vote => vote.vote_type === -1).length;

    const ideaData = {
      ...idea.toJSON(),
      user_vote: userVote ? userVote.vote_type : null,
      upvotes,
      downvotes,
      vote_score: upvotes - downvotes,
    };

    res.json({
      success: true,
      data: { idea: ideaData },
    });
  } catch (error) {
    console.error('Get idea error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching idea',
    });
  }
};

// Vote on idea
const voteIdea = async (req, res) => {
  try {
    const { id } = req.params;
    const { vote_type } = req.body; // 1 for upvote, -1 for downvote
    const userId = req.user.id;

    if (![1, -1].includes(vote_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote type. Use 1 for upvote or -1 for downvote.',
      });
    }

    const idea = await Idea.findByPk(id);
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found',
      });
    }

    // Can't vote on own idea
    if (idea.creator_id === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot vote on your own idea',
      });
    }

    // Check for existing vote
    const existingVote = await IdeaVote.findOne({
      where: { idea_id: id, user_id: userId },
    });

    let action = '';
    if (existingVote) {
      if (existingVote.vote_type === vote_type) {
        // Remove vote (toggle off)
        await existingVote.destroy();
        action = 'removed_vote';
      } else {
        // Change vote
        await existingVote.update({ vote_type });
        action = 'changed_vote';
      }
    } else {
      // Create new vote
      await IdeaVote.create({
        idea_id: id,
        user_id: userId,
        vote_type,
      });
      action = 'voted';
    }

    // Update vote count on idea
    const voteCount = await IdeaVote.sum('vote_type', {
      where: { idea_id: id },
    });
    await idea.update({ vote_count: voteCount || 0 });

    // Log the vote
    await createAuditLog(userId, action, 'idea_vote', id, { vote_type }, req);

    res.json({
      success: true,
      message: `Vote ${action} successfully`,
      data: { vote_count: voteCount || 0 },
    });
  } catch (error) {
    console.error('Vote idea error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while voting',
    });
  }
};

// Update idea (creator or moderator only)
const updateIdea = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, expected_benefit, category_id } = req.body;
    const userId = req.user.id;

    const idea = await Idea.findByPk(id);
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found',
      });
    }

    // Check permissions
    const canEdit = (
      idea.creator_id === userId ||
      req.user.role === 'moderator' ||
      req.user.role === 'admin'
    );

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied',
      });
    }

    // Verify category if provided
    if (category_id) {
      const category = await IdeaCategory.findByPk(category_id);
      if (!category || !category.is_active) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or inactive category',
        });
      }
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (expected_benefit) updateData.expected_benefit = expected_benefit;
    if (category_id) updateData.category_id = category_id;

    await idea.update(updateData);

    // Log the update
    await createAuditLog(userId, 'update', 'idea', id, updateData, req);

    // Return updated idea
    const updatedIdea = await Idea.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'employee_no'] },
        { model: IdeaCategory, as: 'category' },
      ],
    });

    res.json({
      success: true,
      message: 'Idea updated successfully',
      data: { idea: updatedIdea },
    });
  } catch (error) {
    console.error('Update idea error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating idea',
    });
  }
};

module.exports = {
  createIdea,
  getIdeas,
  getIdeaById,
  voteIdea,
  updateIdea,
};
