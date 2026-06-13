const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
require('dotenv').config();

const { globalRateLimiter, authRateLimiter } = require('./middleware/security');
const { authenticate, authorize } = require('./middleware/auth');
const { validateBody } = require('./middleware/validate');
const { registerSchema } = require('./utils/schemas');
const { register, login } = require('./controllers/auth.controller');
const { getProducts } = require('./controllers/product.controller');
const { createCheckoutSession } = require('./controllers/payment.controller');
const { getDashboardAnalytics } = require('./controllers/admin.controller');

const app = express();

// Secure Layer Initialization
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());

app.use('/api/', globalRateLimiter);

// App Routing Configurations
  app.post('/api/auth/register', authRateLimiter, validateBody(registerSchema), register);
app.post('/api/auth/login', authRateLimiter, login);
app.get('/api/products', getProducts);
app.post('/api/payments/checkout', authenticate, createCheckoutSession);
app.get('/api/admin/analytics', authenticate, authorize('admin', 'superadmin'), getDashboardAnalytics);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`[RARE RABBIT ENGINE RUNNING]: Port ${PORT}`));
  })
  .catch(err => console.error('[DATABASE CONNECTIVITY CRITICAL ERROR]:', err));