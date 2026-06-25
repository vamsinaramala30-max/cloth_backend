const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true, index: true },
  color: { type: String, required: true },
  colorName: { type: String, required: true },
  size: { type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], required: true },
  stock: { type: Number, required: true, min: 0 },
  images: [{ type: String, required: true }]
});

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  // Add these two fields:
  basePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  salePrice: {
    type: Number,
    min: 0,
  },
  category: {
    type: String,
    required: true,
  },
  collections: [String],
  tags: [String],
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  variants: [
    {
      sku: { type: String, required: true },
      color: { type: String, required: true },
      colorName: { type: String, required: true },
      size: { type: String, required: true },
      stock: { type: Number, required: true, min: 0 },
      images: [String],
    },
  ],
}, { timestamps: true });

productSchema.pre('save', function(next) {
  if (this.reviews && this.reviews.length > 0) {
    const total = this.reviews.reduce((acc, curr) => acc + curr.rating, 0);
    this.averageRating = parseFloat((total / this.reviews.length).toFixed(2));
  } else {
    this.averageRating = 0;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);