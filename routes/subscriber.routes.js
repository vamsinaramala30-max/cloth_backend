'use strict';

const express = require('express');
const { subscribe, unsubscribe, listSubscribers } = require('../controllers/subscriberController');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
// Protect listing with admin token header `x-admin-token`
router.get('/', adminAuth, listSubscribers);

module.exports = router;
const express = require('express');
const rateLimit = require('express-rate-limit');
const { subscribe } = require('../controllers/subscribercontroller');
const { validateBody } = require('../middleware/validatez');

// Fallback limiter for unauthenticated endpoint.
const subscriberLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 429, message: 'Too many subscription attempts. Try again later.' },
});

const subRouter = express.Router();

// POST /api/subscription/subscribe
subRouter.post('/subscribe', subscriberLimiter, subscribe);

module.exports = subRouter;

