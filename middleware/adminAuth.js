'use strict';

const env = require('../src/config/env');

module.exports = function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query?.adminToken;
  if (!token || token !== process.env.ADMIN_API_TOKEN) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  return next();
};
