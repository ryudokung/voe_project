const express = require('express');
const { body, param } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/audit');
const { 
  createIdea, 
  getIdeas, 
  getIdeaById, 
  voteIdea, 
  updateIdea 
} = require('../controllers/ideaController');

const router = express.Router();

// Validation rules
const createIdeaValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 20, max: 5000 })
    .withMessage('Description must be between 20 and 5000 characters'),
  body('category_id')
    .isInt({ min: 1 })
    .withMessage('Valid category ID is required'),
  body('expected_benefit')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Expected benefit must not exceed 2000 characters'),
  body('visibility')
    .optional()
    .isIn(['public', 'department', 'private'])
    .withMessage('Visibility must be public, department, or private'),
];

const updateIdeaValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid idea ID is required'),
  body('title')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Description must be between 20 and 5000 characters'),
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid category ID is required'),
  body('expected_benefit')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Expected benefit must not exceed 2000 characters'),
];

const voteIdeaValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid idea ID is required'),
  body('vote_type')
    .isInt()
    .isIn([1, -1])
    .withMessage('Vote type must be 1 (upvote) or -1 (downvote)'),
];

const ideaIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid idea ID is required'),
];

// Routes
router.post('/', 
  authenticateToken, 
  createIdeaValidation, 
  auditMiddleware('create', 'idea'),
  createIdea
);

router.get('/', 
  authenticateToken, 
  getIdeas
);

router.get('/:id', 
  authenticateToken, 
  ideaIdValidation, 
  getIdeaById
);

router.post('/:id/vote', 
  authenticateToken, 
  voteIdeaValidation,
  auditMiddleware('vote', 'idea'),
  voteIdea
);

router.put('/:id', 
  authenticateToken, 
  updateIdeaValidation,
  auditMiddleware('update', 'idea'),
  updateIdea
);

module.exports = router;
