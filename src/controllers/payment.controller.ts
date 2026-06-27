import Stripe from 'stripe';
import type { Request, Response } from 'express';
import env from '../config/env';
import { supabase } from '../database/connect';
import type { IOrderItem, IShippingAddress, IFinancials } from '../interfaces/order.interface';

const stripe = new Stripe(env.STRIPE_SECRET_KEY as string, { apiVersion: '2023-10-16' as any });

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

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: req.user.id,
        shipping_address: shippingAddress,
        payment_gateway: 'stripe',
        payment_id: paymentIntent.id,
        payment_status: 'pending',
        subtotal: financials.subtotal,
        discount: financials.discount || 0,
        shipping: financials.shipping || 0,
        tax: financials.tax,
        total: financials.total,
        order_status: 'pending',
        estimated_delivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select('id')
      .single();

    if (orderError || !order) {
      res.status(500).json({ success: false, message: orderError?.message || 'Failed to create order' });
      return;
    }

    // Insert order items
    if (items && items.length > 0) {
      const dbItems = items.map((i: any) => ({
        order_id: order.id,
        product_id: i.product || i.productId,
        sku: i.sku,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        color: i.color,
        size: i.size,
        image: i.image,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(dbItems);
      if (itemsError) {
        // Rollback order
        await supabase.from('orders').delete().eq('id', order.id);
        res.status(500).json({ success: false, message: itemsError.message });
        return;
      }
    }

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Payment failed';
    res.status(500).json({ success: false, message });
  }
};
