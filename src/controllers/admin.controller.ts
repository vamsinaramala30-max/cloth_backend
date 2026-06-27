import type { Request, Response } from 'express';
import { supabase } from '../database/connect';

export const getDashboardAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('total')
      .eq('payment_status', 'paid');

    if (orderError) {
      res.status(500).json({ success: false, message: orderError.message });
      return;
    }

    const revenue = (orders || []).reduce((sum, o) => sum + Number(o.total), 0);

    const { count: salesCount, error: countError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'paid');

    if (countError) {
      res.status(500).json({ success: false, message: countError.message });
      return;
    }

    const { count: catalogSize, error: catalogError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (catalogError) {
      res.status(500).json({ success: false, message: catalogError.message });
      return;
    }

    res.status(200).json({
      success: true,
      analytics: {
        revenue,
        salesCount: salesCount || 0,
        catalogSize: catalogSize || 0,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get analytics';
    res.status(500).json({ success: false, message });
  }
};
