import mongoose, { Schema } from 'mongoose';
import type { ICollectionDocument, ICollectionModel } from '../interfaces/collection.interface';

const CollectionSchema = new Schema<ICollectionDocument, ICollectionModel>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, required: true },
    longDescription: { type: String },
    image: { type: String, required: true },
    bannerImage: { type: String },
    accentColor: { type: String },
    featuredProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    productCount: { type: Number, default: 0 },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true },
);

export default mongoose.models.Collection
  ? (mongoose.models.Collection as ICollectionModel)
  : mongoose.model<ICollectionDocument, ICollectionModel>('Collection', CollectionSchema);
