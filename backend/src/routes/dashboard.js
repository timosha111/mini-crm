const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const c = require('../controllers/dashboardController');

router.get('/', authenticateToken, authorizeRole('ADMIN', 'MANAGER'), c.get);

module.exports = router;
