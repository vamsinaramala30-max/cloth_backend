const mongoose = require('mongoose');
const Product = require('../models/Product');
const env = require('../src/config/env');

exports.createProduct = async (req, res) => {
  try {
    const { name, slug, description, basePrice, salePrice, category, collections, tags, isFeatured, isActive, variants } = req.body;

    const newProduct = new Product({
      name,
      slug,
      description,
      basePrice, // Make sure this is included
      salePrice, // Make sure this is included
      category,
      collections,
      tags,
      isFeatured,
      isActive,
      variants,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, basePrice, salePrice, category, collections, tags, isFeatured, isActive, variants } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        description,
        basePrice, // Make sure this is included
        salePrice, // Make sure this is included
        category,
        collections,
        tags,
        isFeatured,
        isActive,
        variants,
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

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
          variants: [{ images: ['`https://images.unsplash.com/photo-1551028719-00167b16ebc5?q=80&w=1000`'] }],
        },
        {
          _id: '2',
          name: 'Neural Mesh Shirt',
          category: 'Shirts',
          basePrice: 450,
          isActive: true,
          variants: [{ images: ['`https://images.unsplash.com/photo-1503342394128-c104cbb9810d?q=80&w=1000`'] }],
        },
      ];
      // Return all mock products when SKIP_DB is true
      return res.status(200).json({
        success: true,
        data: mockProducts,
        pagination: { total: mockProducts.length } // Simplified pagination for mock data
      });
    }

    // Remove 'page' and 'limit' from destructuring as we want all products
    const { category, collection, sort, search } = req.query;
    const queryConfig = { isActive: true };

    if (category) queryConfig.category = category;
    if (collection) queryConfig.collections = { $in: [collection] };
    if (search) queryConfig.name = { $regex: search, $options: 'i' };

    let sortConfig = { createdAt: -1 };
    if (sort === 'price-low-high') sortConfig = { basePrice: 1 };
    if (sort === 'price-high-low') sortConfig = { basePrice: -1 };

    // Fetch all products matching the query, without skip or limit
    const products = await Product.find(queryConfig)
      .sort(sortConfig);

    const totalProducts = await Product.countDocuments(queryConfig);

    return res.status(200).json({
      success: true,
      data: products,
      pagination: { total: totalProducts } // Simplified pagination as all products are returned
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