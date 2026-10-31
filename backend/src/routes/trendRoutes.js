const router = require('express').Router();
const { trends } = require('../controllers/trendController');
router.get('/', trends);
module.exports = router;
