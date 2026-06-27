import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { supabase } from '../database/connect';

const router = Router();

router.get('/history', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ success: false, message: error.message });
      return;
    }

    const orderIds = (orders || []).map((o) => o.id);
    let allItems: any[] = [];
    if (orderIds.length > 0) {
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);
      allItems = items || [];
    }

    const mappedOrders = (orders || []).map((o) => {
      const oItems = allItems
        .filter((i) => i.order_id === o.id)
        .map((i) => ({
          product: i.product_id,
          sku: i.sku,
          name: i.name,
          quantity: i.quantity,
          price: Number(i.price),
          color: i.color,
          size: i.size,
          image: i.image,
        }));

      return {
        _id: o.id,
        id: o.id,
        user: o.user_id,
        items: oItems,
        shippingAddress: o.shipping_address,
        paymentInfo: {
          gateway: o.payment_gateway,
          paymentId: o.payment_id,
          orderId: o.payment_order_id,
          status: o.payment_status,
        },
        financials: {
          subtotal: Number(o.subtotal),
          discount: Number(o.discount),
          shipping: Number(o.shipping),
          tax: Number(o.tax),
          total: Number(o.total),
        },
        orderStatus: o.order_status,
        trackingNumber: o.tracking_number,
        estimatedDelivery: o.estimated_delivery,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
      };
    });

    res.status(200).json({ success: true, data: mappedOrders });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get orders';
    res.status(500).json({ success: false, message });
  }
});

export default router;
