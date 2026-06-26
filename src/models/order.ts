import mongoose, { Schema } from 'mongoose';
import type { IOrderDocument, IOrderModel } from '../interfaces/order.interface';

const OrderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  sku: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  color: { type: String, required: true },
  size: { type: String, required: true },
  image: { type: String, required: true },
});

const OrderSchema = new Schema<IOrderDocument, IOrderModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [OrderItemSchema],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentInfo: {
      gateway: { type: String, enum: ['stripe', 'razorpay'], required: true },
      paymentId: { type: String, required: true },
      orderId: { type: String },
      status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    },
    financials: {
      subtotal: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      shipping: { type: Number, default: 0 },
      tax: { type: Number, required: true },
      total: { type: Number, required: true },
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    trackingNumber: { type: String },
    estimatedDelivery: { type: Date, required: true },
  },
  { timestamps: true },
);

export default mongoose.models.Order
  ? (mongoose.models.Order as IOrderModel)
  : mongoose.model<IOrderDocument, IOrderModel>('Order', OrderSchema);
