const Order = require('../models/Order');
const Product = require('../models/Product');

const getDashboardAnalytics = async (req, res) => {
  try {
    const totalRevenue = await Order.aggregate([
      { $match: { 'paymentInfo.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$financials.total' } } }
    ]);

    const operationalSalesCount = await Order.countDocuments({ 'paymentInfo.status': 'paid' });
    const productCatalogDepth = await Product.countDocuments();

    return res.status(200).json({
      success: true,
      analytics: {
        revenue: totalRevenue[0]?.total || 0,
        salesCount: operationalSalesCount,
        catalogSize: productCatalogDepth
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardAnalytics };