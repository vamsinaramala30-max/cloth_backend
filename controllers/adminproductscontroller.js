const Product = require('../models/Product');

function normalizeSlug(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const createProduct = async (req, res) => {
  try {
    const {
      _id,
      name,
      slug,
      description,
      basePrice,
      salePrice,
      category,
      collections,
      tags,
      variants,
      isFeatured,
      isActive,
    } = req.body || {};

    if (!name) return res.status(400).json({ success: false, message: 'name is required' });
    if (!description) return res.status(400).json({ success: false, message: 'description is required' });
    if (basePrice === undefined || basePrice === null)
      return res.status(400).json({ success: false, message: 'basePrice is required' });
    if (!category) return res.status(400).json({ success: false, message: 'category is required' });

    const finalSlug = slug ? normalizeSlug(slug) : normalizeSlug(name);
    if (!finalSlug) return res.status(400).json({ success: false, message: 'slug is required' });

    // Basic variant sanitization (schema will validate deeply)
    const finalVariants = Array.isArray(variants) ? variants : [];

    const product = await Product.create({
      name: String(name).trim(),
      slug: finalSlug,
      description: String(description),
      basePrice: Number(basePrice),
      salePrice: salePrice === undefined ? undefined : Number(salePrice),
      category,
      collections: Array.isArray(collections) ? collections : [],
      tags: Array.isArray(tags) ? tags : [],
      variants: finalVariants,
      isFeatured: Boolean(isFeatured),
      isActive: isActive === undefined ? true : Boolean(isActive),
    });

    return res.status(201).json({ success: true, data: product });
  } catch (err) {
    // Common case: duplicate slug
    const msg = err?.message ? String(err.message) : 'Failed to create product';
    return res.status(400).json({ success: false, message: msg });
  }
};

const listProductsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, isActive } = req.query || {};

    const queryConfig = {};
    if (isActive !== undefined) queryConfig.isActive = String(isActive) === 'true';

    const p = Number(page);
    const l = Number(limit);
    const skipIndex = (p - 1) * l;

    const items = await Product.find(queryConfig)
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(l);

    const total = await Product.countDocuments(queryConfig);

    return res.status(200).json({
      success: true,
      data: items,
      pagination: { total, page: p, pages: Math.ceil(total / l) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to list products' });
  }
};

module.exports = { createProduct, listProductsAdmin };


