import mongoose, { Schema } from 'mongoose';
import type { Document, Model, Types } from 'mongoose';

export interface IDeviceInfo {
  fingerprint?: string;
  name?: string;
  ip?: string;
  userAgent?: string;
}

export interface IRefreshToken {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  deviceInfo?: IDeviceInfo;
  createdAt: Date;
  updatedAt: Date;
}

export type IRefreshTokenDocument = IRefreshToken & Document;
export type IRefreshTokenModel = Model<IRefreshTokenDocument>;

const RefreshTokenSchema = new Schema<IRefreshTokenDocument, IRefreshTokenModel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    deviceInfo: {
      fingerprint: String,
      name: String,
      ip: String,
      userAgent: String,
    },
  },
  { timestamps: true },
);

export default mongoose.models.RefreshToken
  ? (mongoose.models.RefreshToken as IRefreshTokenModel)
  : mongoose.model<IRefreshTokenDocument, IRefreshTokenModel>('RefreshToken', RefreshTokenSchema);
