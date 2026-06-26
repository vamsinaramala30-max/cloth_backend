import mongoose, { Schema } from 'mongoose';
import type { Document, Model } from 'mongoose';

export interface ISubscriber {
  email?: string;
  phone?: string;
  source?: string;
  optedIn: boolean;
  meta?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type ISubscriberDocument = ISubscriber & Document;
export type ISubscriberModel = Model<ISubscriberDocument>;

const SubscriberSchema = new Schema<ISubscriberDocument, ISubscriberModel>(
  {
    email: { type: String, lowercase: true, trim: true, index: true },
    phone: { type: String, index: true },
    source: { type: String },
    optedIn: { type: Boolean, default: true },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

export default mongoose.models.Subscriber
  ? (mongoose.models.Subscriber as ISubscriberModel)
  : mongoose.model<ISubscriberDocument, ISubscriberModel>('Subscriber', SubscriberSchema);
