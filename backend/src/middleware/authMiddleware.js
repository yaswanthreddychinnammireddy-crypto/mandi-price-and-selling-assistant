const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');
const inMemoryStore = require('../config/inMemoryStore');

async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.slice(7);
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required.' });
    if (!env.jwtSecret) throw new Error('JWT_SECRET is not configured.');
    const payload = jwt.verify(token, env.jwtSecret);

    if (mongoose.connection.readyState !== 1) {
      let foundUser = null;
      for (const u of inMemoryStore.users.values()) {
        if (u.id === payload.sub || u._id === payload.sub) {
          foundUser = u;
          break;
        }
      }
      if (!foundUser) return res.status(401).json({ success: false, message: 'User no longer exists.' });
      req.user = foundUser;
      return next();
    }

    req.user = await User.findById(payload.sub);
    if (!req.user) return res.status(401).json({ success: false, message: 'User no longer exists.' });
    next();
  } catch (error) { next(error); }
}
module.exports = { requireAuth };
