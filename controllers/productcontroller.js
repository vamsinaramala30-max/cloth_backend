const mongoose = require('mongoose');
const Product = require('../models/Product');
const env = require('../src/config/env');

const getProducts = async (req, res) => {
  try {
    // Development mode: return mock data when database is unavailable
    if (env.SKIP_DB) {
      const mockProducts = [
        {
          _id: '1',
          name: 'Quantum Silk Jacket',
          category: 'Jackets',
          basePrice: 850,
          salePrice: 720,
          isActive: true,
          variants: [{ images: ['https://images.unsplash.com/photo-1551028719-00167b16ebc5?q=80&w=1000'] }],
        },
        {
          _id: '2',
          name: 'Neural Mesh Shirt',
          category: 'Shirts',
          basePrice: 450,
          isActive: true,
          variants: [{ images: ['https://images.unsplash.com/photo-1503342394128-c104cbb9810d?q=80&w=1000'] }],
        },
      ];
      const { page = 1, limit = 12 } = req.query;
      return res.status(200).json({
        success: true,
        data: mockProducts.slice(0, Number(limit)),
        pagination: { total: mockProducts.length, page: Number(page), pages: 1 }
      });
    }

    const { category, collection, sort, search, page = 1, limit = 12 } = req.query;
    const queryConfig = { isActive: true };

    if (category) queryConfig.category = category;
    if (collection) queryConfig.collections = { $in: [collection] };
    if (search) queryConfig.name = { $regex: search, $options: 'i' };

    let sortConfig = { createdAt: -1 };
    if (sort === 'price-low-high') sortConfig = { basePrice: 1 };
    if (sort === 'price-high-low') sortConfig = { basePrice: -1 };

    const skipIndex = (Number(page) - 1) * Number(limit);
    const products = await Product.find(queryConfig)
      .sort(sortConfig)
      .skip(skipIndex)
      .limit(Number(limit));

    const totalProducts = await Product.countDocuments(queryConfig);

    return res.status(200).json({
      success: true,
      data: products,
      pagination: { total: totalProducts, page: Number(page), pages: Math.ceil(totalProducts / Number(limit)) }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    // Development mode: return mock data when database is unavailable
    if (env.SKIP_DB) {
      const mockProduct = {
        _id: '1',
        name: 'Quantum Silk Jacket',
        slug: 'quantum-silk-jacket',
        category: 'Jackets',
        basePrice: 850,
        salePrice: 720,
        description: 'Premium luxury jacket with quantum silk fabric.',
        isActive: true,
        variants: [{ images: ['https://images.unsplash.com/photo-1551028719-00167b16ebc5?q=80&w=1000'] }],
      };
      return res.status(200).json({ success: true, data: mockProduct });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
    const product = await Product.findOne(query).lean();

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getFilters = async (req, res) => {
  try {
    // Development mode: return mock filters when database is unavailable
    if (env.SKIP_DB) {
      return res.status(200).json({
        success: true,
        data: {
          categories: ['Jackets', 'Shirts', 'Pants', 'Accessories'],
          collections: ['Neural Silk', 'Quantum Weave', 'Ethereal Form', 'Digital Thread']
        }
      });
    }

    const categories = await Product.distinct('category', { isActive: true });
    const collections = await Product.distinct('collections', { isActive: true });

    return res.status(200).json({
      success: true,
      data: { categories, collections: collections.filter(Boolean) }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProducts, getProductById, getFilters };