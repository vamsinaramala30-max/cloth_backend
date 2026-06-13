const express = require('express');
const subRouter = express.Router();

// Placeholder to fix router wiring.
// Full order routes exist in backend/routes/orderroutes.js.

subRouter.get('/health', (req, res) => {
  res.status(200).json({ success: true, status: 'order sub-route ok' });
});

module.exports = subRouter;

