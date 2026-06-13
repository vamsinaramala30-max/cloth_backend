'use strict';

const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  deviceInfo: {
    fingerprint: String,
    name: String,
    ip: String,
    userAgent: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);
