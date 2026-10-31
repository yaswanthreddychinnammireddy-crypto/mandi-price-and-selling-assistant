const router = require('express').Router();
const { assistant } = require('../controllers/sellingController');
router.post('/assistant', assistant);
module.exports = router;
