const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const clients = require('../controllers/clientsController');
const notes = require('../controllers/notesController');

router.use(authenticateToken);

router.get('/', clients.list);
router.get('/:id', clients.getOne);
router.post('/', clients.create);
router.put('/:id', clients.update);
router.delete('/:id', authorizeRole('ADMIN'), clients.remove); // удалять клиентов может только ADMIN

router.get('/:id/notes', notes.listByClient);
router.post('/:id/notes', notes.create);

module.exports = router;
