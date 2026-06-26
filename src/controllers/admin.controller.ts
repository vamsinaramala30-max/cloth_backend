import type { Request, Response } from 'express';
import Order from '../models/order';
import Product from '../models/product';

export const getDashboardAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalRevenue = await Order.aggregate<{ _id: null; total: number }>([
      { $match: { 'paymentInfo.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$financials.total' } } },
    ]);

    const operationalSalesCount = await Order.countDocuments({ 'paymentInfo.status': 'paid' });
    const productCatalogDepth = await Product.countDocuments();

    res.status(200).json({
      success: true,
      analytics: {
        revenue: totalRevenue[0]?.total ?? 0,
        salesCount: operationalSalesCount,
        catalogSize: productCatalogDepth,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get analytics';
    res.status(500).json({ success: false, message });
  }
};
