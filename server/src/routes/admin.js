const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { IdeaCategory, Department, User } = require('../models');

const router = express.Router();

// Get all users (admin only)
router.get('/users', 
  authenticateToken, 
  requireRole(['admin']),
  async (req, res) => {
    try {
      const users = await User.findAll({
        include: [{ model: Department, as: 'department' }],
        attributes: { exclude: ['password'] },
        order: [['created_at', 'DESC']]
      });
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching users'
      });
    }
  }
);

// Get all categories
router.get('/categories', 
  authenticateToken,
  async (req, res) => {
    try {
      const categories = await IdeaCategory.findAll({
        where: { is_active: true },
        order: [['name', 'ASC']]
      });
      
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching categories'
      });
    }
  }
);

// Get all departments
router.get('/departments', 
  authenticateToken,
  async (req, res) => {
    try {
      const departments = await Department.findAll({
        where: { is_active: true },
        order: [['name', 'ASC']]
      });
      
      res.json({
        success: true,
        data: departments
      });
    } catch (error) {
      console.error('Get departments error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching departments'
      });
    }
  }
);

// Create new category (moderator/admin)
router.post('/categories',
  authenticateToken,
  requireRole(['admin', 'moderator']),
  async (req, res) => {
    try {
      const { name, color, icon, description } = req.body;
      
      const category = await IdeaCategory.create({
        name,
        color: color || '#007bff',
        icon: icon || 'lightbulb',
        description
      });
      
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while creating category'
      });
    }
  }
);

module.exports = router;
