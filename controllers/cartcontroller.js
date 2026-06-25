const Cart = require('../models/Cart');
const Product = require('../models/product');

const addToCart = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { productId, variantSku, quantity, size, color } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Invalid product or quantity' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId && item.size === size && item.color === color
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        variantSku,
        quantity,
        size,
        color,
        price: product.salePrice || product.basePrice,
        name: product.name,
        image: product.variants?.[0]?.images?.[0] || '',
      });
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cart,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const { userId } = req.user || {};
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const cart = await Cart.findOne({ userId }).populate('items.productId');

    return res.status(200).json({
      success: true,
      data: cart || { userId, items: [] },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { userId } = req.user || {};
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { itemId, quantity } = req.body;

    if (quantity < 0) {
      return res.status(400).json({ success: false, message: 'Invalid quantity' });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    if (quantity === 0) {
      cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    } else {
      const item = cart.items.find((item) => item._id.toString() === itemId);
      if (item) {
        item.quantity = quantity;
      }
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const { userId } = req.user || {};
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    await Cart.deleteOne({ userId });

    return res.status(200).json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addToCart, getCart, updateCartItem, clearCart };