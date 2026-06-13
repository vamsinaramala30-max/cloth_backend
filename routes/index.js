const express = require('express');
const masterRouter = express.Router();

const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const paymentRoutes = require('./payment.routes');
const adminRoutes = require('./admin.routes');
const cartRoutes = require('./cart.routes');
const wishlistRoutes = require('./wishlist.routes');
const adminProductsRoutes = require('./admin.products.routes');

// Granular Nested Sub-Routes Imports

const userProfileSubRoutes = require('./sub/user.routes');
const userOrdersSubRoutes = require('./sub/order.routes');

// High-Level Matrix Assignment Mapping
masterRouter.use('/auth', authRoutes);
masterRouter.use('/products', productRoutes);
masterRouter.use('/payments', paymentRoutes);
masterRouter.use('/admin', adminRoutes);
masterRouter.use('/cart', cartRoutes);
masterRouter.use('/wishlist', wishlistRoutes);

// Sub-Route Assignment Integration
masterRouter.use('/account', userProfileSubRoutes);
masterRouter.use('/orders', userOrdersSubRoutes);

module.exports = masterRouter;