import Stripe from 'stripe';
import type { Request, Response } from 'express';
import env from '../config/env';
import Order from '../models/order';
import type { IOrderItem, IShippingAddress, IFinancials } from '../interfaces/order.interface';

const stripe = new Stripe(env.STRIPE_SECRET_KEY as string, { apiVersion: '2023-10-16' });

export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { items, shippingAddress, financials } = req.body as {
      items: IOrderItem[];
      shippingAddress: IShippingAddress;
      financials: IFinancials;
    };

    if (!req.user) {
      res.status(403).json({ success: false, message: 'Context validation missed.' });
      return;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(financials.total * 100), // convert to cents
      currency: 'usd',
      metadata: { userId: req.user.id },
      automatic_payment_methods: { enabled: true },
    });

    const order = await Order.create({
      user: req.user.id,
      items,
      shippingAddress,
      paymentInfo: { gateway: 'stripe', paymentId: paymentIntent.id, status: 'pending' },
      financials,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Payment failed';
    res.status(500).json({ success: false, message });
  }
};
