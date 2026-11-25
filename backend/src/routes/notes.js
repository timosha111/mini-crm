const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth');
const c = require('../controllers/notesController');

router.delete('/:id', authenticateToken, c.remove);

module.exports = router;
