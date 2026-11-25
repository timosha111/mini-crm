const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const c = require('../controllers/usersController');

router.use(authenticateToken);

// Список {id, name} нужен менеджерам для выбора ответственного в сделках
router.get('/options', c.options);

// Всё остальное — только ADMIN
router.use(authorizeRole('ADMIN'));
router.get('/', c.list);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;
