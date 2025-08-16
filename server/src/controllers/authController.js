const { User, Department } = require('../models');
const { generateToken } = require('../utils/jwt');
const { validationResult } = require('express-validator');
const { createAuditLog } = require('../middleware/audit');

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { employee_no, name, email, password, department_id } = req.body;

    // Check if user already exists
    const { Op } = require('sequelize');
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { employee_no }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or employee number already exists',
      });
    }

    // Verify department exists
    const department = await Department.findByPk(department_id);
    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department',
      });
    }

    // Create user
    const user = await User.create({
      employee_no,
      name,
      email,
      password,
      department_id,
      role: 'employee', // Default role
    });

    // Generate token
    const token = generateToken({ userId: user.id, role: user.role });

    // Log the registration
    await createAuditLog(user.id, 'register', 'user', user.id, { employee_no, email }, req);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          employee_no: user.employee_no,
          name: user.name,
          email: user.email,
          role: user.role,
          department_id: user.department_id,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user with department info
    const user = await User.findOne({
      where: { email },
      include: [{ model: Department, as: 'department' }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    // Verify password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Generate token
    const token = generateToken({ userId: user.id, role: user.role });

    // Log the login
    await createAuditLog(user.id, 'login', 'user', user.id, { email }, req);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          employee_no: user.employee_no,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          last_login: user.last_login,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Department, as: 'department' }],
      attributes: { exclude: ['password'] },
    });

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { name } = req.body;
    const userId = req.user.id;

    await User.update({ name }, { where: { id: userId } });

    const updatedUser = await User.findByPk(userId, {
      include: [{ model: Department, as: 'department' }],
      attributes: { exclude: ['password'] },
    });

    // Log the profile update
    await createAuditLog(userId, 'update_profile', 'user', userId, { name }, req);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};
