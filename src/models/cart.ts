import mongoose, { Schema } from 'mongoose';
import type { ICartDocument, ICartMethods, ICartModel } from '../interfaces/cart.interface';

const CartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantSku: { type: String },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String },
    color: { type: String },
    image: { type: String },
  },
  { timestamps: true },
);

const CartSchema = new Schema<ICartDocument, ICartModel, ICartMethods>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: [CartItemSchema],
  },
  { timestamps: true },
);

CartSchema.methods.getTotal = function (): number {
  return this.items.reduce((total: number, item: { price: number; quantity: number }) => total + item.price * item.quantity, 0);
};

export default mongoose.models.Cart
  ? (mongoose.models.Cart as ICartModel)
  : mongoose.model<ICartDocument, ICartModel>('Cart', CartSchema);
