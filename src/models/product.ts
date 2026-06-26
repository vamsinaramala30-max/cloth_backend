import mongoose, { Schema } from 'mongoose';
import type { IProductDocument, IProductModel } from '../interfaces/product.interface';

const VariantSchema = new Schema({
  sku: { type: String, required: true },
  color: { type: String, required: true },
  colorName: { type: String, required: true },
  size: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 },
  images: [String],
});

const ProductSchema = new Schema<IProductDocument, IProductModel>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    category: { type: String, required: true },
    collections: [String],
    tags: [String],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    popularity: { type: Number, default: 0 },
    variants: [VariantSchema],
  },
  { timestamps: true },
);

export default mongoose.models.Product
  ? (mongoose.models.Product as IProductModel)
  : mongoose.model<IProductDocument, IProductModel>('Product', ProductSchema);
