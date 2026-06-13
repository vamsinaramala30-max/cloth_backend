const express = require('express');
const subRouter = express.Router();

// Admin endpoints to be implemented in a follow-up step.
// This file exists to fix router wiring so the API boots.

subRouter.get('/health', (req, res) => {
  res.status(200).json({ success: true, status: 'admin ok' });
});

module.exports = subRouter;

