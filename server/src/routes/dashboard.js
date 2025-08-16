const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { 
  getDashboardOverview,
  getDepartmentStats 
} = require('../controllers/dashboardController');

const router = express.Router();

// Routes
router.get('/overview', 
  authenticateToken, 
  getDashboardOverview
);

router.get('/departments', 
  authenticateToken, 
  requireRole(['executive', 'admin', 'moderator']),
  getDepartmentStats
);

module.exports = router;
