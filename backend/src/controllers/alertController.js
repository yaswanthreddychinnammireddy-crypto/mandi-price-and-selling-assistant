const { z } = require('zod');
const mongoose = require('mongoose');
const PriceAlert = require('../models/PriceAlert');
const inMemoryStore = require('../config/inMemoryStore');

const alertSchema = z.object({
  crop: z.string().min(1).max(100),
  mandi: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  targetPrice: z.coerce.number().positive(),
  unit: z.string().min(1).max(40).default('INR/quintal')
});

async function createAlert(req, res, next) {
  try {
    const parsed = alertSchema.parse(req.body);
    const userId = req.user.id || req.user._id;

    if (mongoose.connection.readyState !== 1) {
      const alertObj = {
        _id: "alt_" + Date.now(),
        id: "alt_" + Date.now(),
        ...parsed,
        user: userId,
        createdAt: new Date()
      };
      inMemoryStore.alerts.unshift(alertObj);
      return res.status(201).json({
        success: true,
        message: 'Price alert saved successfully.',
        data: alertObj
      });
    }

    const alert = await PriceAlert.create({ ...parsed, user: userId });
    res.status(201).json({ success: true, message: 'Price alert saved.', data: alert });
  } catch (error) { next(error); }
}

async function listAlerts(req, res, next) {
  try {
    const userId = req.user.id || req.user._id;
    if (mongoose.connection.readyState !== 1) {
      const userAlerts = inMemoryStore.alerts.filter(a => a.user === userId);
      return res.json({ success: true, data: userAlerts });
    }
    res.json({ success: true, data: await PriceAlert.find({ user: userId }).sort({ createdAt: -1 }) });
  } catch (error) { next(error); }
}

async function removeAlert(req, res, next) {
  try {
    const userId = req.user.id || req.user._id;
    if (mongoose.connection.readyState !== 1) {
      const idx = inMemoryStore.alerts.findIndex(a => a._id === req.params.id && a.user === userId);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Alert not found.' });
      inMemoryStore.alerts.splice(idx, 1);
      return res.json({ success: true, message: 'Alert deleted.' });
    }
    const alert = await PriceAlert.findOneAndDelete({ _id: req.params.id, user: userId });
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found.' });
    res.json({ success: true, message: 'Alert deleted.' });
  } catch (error) { next(error); }
}

module.exports = { createAlert, listAlerts, removeAlert };
