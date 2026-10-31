const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  phone: { type: String, trim: true, match: /^[6-9]\d{9}$/ },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^\S+@\S+\.\S+$/ },
  passwordHash: { type: String, required: true, select: false },
  preferredLanguage: { type: String, enum: ['English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Marathi'], default: 'English' },
  state: { type: String, trim: true },
  district: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
