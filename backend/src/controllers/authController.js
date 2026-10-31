const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const mongoose = require('mongoose');
const User = require('../models/User');
const env = require('../config/env');
const inMemoryStore = require('../config/inMemoryStore');

const registration = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
  preferredLanguage: z.enum(['English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Marathi']).optional(),
  state: z.string().max(100).optional(),
  district: z.string().max(100).optional()
});

const login = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

function token(user) {
  if (!env.jwtSecret) throw new Error('JWT_SECRET is not configured.');
  return jwt.sign({ sub: user.id || user._id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

async function register(req, res, next) {
  try {
    const input = registration.parse(req.body);
    const emailLower = input.email.toLowerCase();

    if (mongoose.connection.readyState !== 1) {
      if (inMemoryStore.users.has(emailLower)) {
        return res.status(409).json({ success: false, message: 'An account already uses that email.' });
      }
      const passwordHash = await bcrypt.hash(input.password, 10);
      const userObj = {
        id: "usr_" + Date.now(),
        _id: "usr_" + Date.now(),
        ...input,
        email: emailLower,
        passwordHash,
        createdAt: new Date()
      };
      inMemoryStore.users.set(emailLower, userObj);
      return res.status(201).json({
        success: true,
        message: 'Farmer account registered successfully.',
        data: { token: token(userObj), user: { id: userObj.id, name: userObj.name, email: userObj.email, phone: userObj.phone, state: userObj.state, district: userObj.district } }
      });
    }

    const exists = await User.exists({ email: emailLower });
    if (exists) return res.status(409).json({ success: false, message: 'An account already uses that email.' });
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await User.create({ ...input, email: emailLower, passwordHash });
    res.status(201).json({
      success: true,
      message: 'User registered.',
      data: { token: token(user), user: { id: user.id, name: user.name, email: user.email } }
    });
  } catch (error) { next(error); }
}

async function loginUser(req, res, next) {
  try {
    const input = login.parse(req.body);
    const emailLower = input.email.toLowerCase();

    if (mongoose.connection.readyState !== 1) {
      const user = inMemoryStore.users.get(emailLower);
      if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }
      return res.json({
        success: true,
        message: 'Login successful.',
        data: { token: token(user), user: { id: user.id, name: user.name, email: user.email, phone: user.phone, state: user.state, district: user.district } }
      });
    }

    const user = await User.findOne({ email: emailLower }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    res.json({
      success: true,
      message: 'Login successful.',
      data: { token: token(user), user: { id: user.id, name: user.name, email: user.email } }
    });
  } catch (error) { next(error); }
}

module.exports = { register, loginUser };
