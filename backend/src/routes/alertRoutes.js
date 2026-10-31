const router = require('express').Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { createAlert, listAlerts, removeAlert } = require('../controllers/alertController');
router.use(requireAuth);
router.post('/', createAlert);
router.get('/', listAlerts);
router.delete('/:id', removeAlert);
module.exports = router;
