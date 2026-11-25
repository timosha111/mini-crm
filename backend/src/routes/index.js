const router = require('express').Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.use('/auth', require('./auth'));
router.use('/users', require('./users'));
router.use('/clients', require('./clients'));
router.use('/deals', require('./deals'));
router.use('/notes', require('./notes'));
router.use('/dashboard', require('./dashboard'));

module.exports = router;
