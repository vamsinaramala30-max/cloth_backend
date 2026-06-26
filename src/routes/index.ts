import { Router } from 'express';

import { seedDatabase } from '../controllers/seed.controller';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import collectionRoutes from './collection.routes';
import paymentRoutes from './payment.routes';
import adminRoutes from './admin.routes';
import cartRoutes from './cart.routes';
import wishlistRoutes from './wishlist.routes';
import adminProductsRoutes from './adminProducts.routes';
import otpRoutes from './otp.routes';
import sessionRoutes from './session.routes';
import subscriberRoutes from './subscriber.routes';
import orderRoutes from './order.routes';
import userSubRoutes from './sub/user.routes';
import orderSubRoutes from './sub/order.routes';

const masterRouter = Router();

masterRouter.get('/seed-db', seedDatabase);

// Authentication
masterRouter.use('/auth', authRoutes);
masterRouter.use('/auth/otp', otpRoutes);
masterRouter.use('/auth/session', sessionRoutes);

// Catalog
masterRouter.use('/products', productRoutes);
masterRouter.use('/collections', collectionRoutes);

// Commerce
masterRouter.use('/cart', cartRoutes);
masterRouter.use('/wishlist', wishlistRoutes);
masterRouter.use('/payments', paymentRoutes);
masterRouter.use('/orders', orderRoutes);

// Subscriber
masterRouter.use('/subscriber', subscriberRoutes);

// Admin
masterRouter.use('/admin', adminRoutes);
masterRouter.use('/admin/products', adminProductsRoutes);

// Account sub-routes
masterRouter.use('/account', userSubRoutes);
masterRouter.use('/account/orders', orderSubRoutes);

export default masterRouter;
