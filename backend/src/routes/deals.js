const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth');
const c = require('../controllers/dealsController');

router.use(authenticateToken);

router.get('/', c.list);
router.get('/:id', c.getOne);
router.post('/', c.create);
router.put('/:id', c.update);
router.patch('/:id/status', c.changeStatus);
router.delete('/:id', c.remove);

module.exports = router;
