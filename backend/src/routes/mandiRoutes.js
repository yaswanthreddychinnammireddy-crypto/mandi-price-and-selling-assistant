const router = require('express').Router();
const { prices, compare } = require('../controllers/mandiController');
router.get('/prices', prices);
router.get('/compare', compare);
module.exports = router;
