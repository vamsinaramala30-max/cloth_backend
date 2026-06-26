import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { IUserDocument, IUserMethods, IUserModel } from '../interfaces/user.interface';

const AddressSchema = new Schema({
  label: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const DeviceSchema = new Schema({
  fingerprint: { type: String },
  name: { type: String },
  ip: { type: String },
  userAgent: { type: String },
  lastSeenAt: { type: Date, default: Date.now },
});

const UserSchema = new Schema<IUserDocument, IUserModel, IUserMethods>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true },
    phone: { type: String, sparse: true, index: true },
    passwordHash: { type: String },
    role: {
      type: String,
      enum: ['customer', 'admin', 'superadmin'],
      default: 'customer',
    },
    googleId: { type: String, sparse: true },
    isVerified: { type: Boolean, default: false },
    verificationOtp: { type: String },
    otpExpiry: { type: Date },
    devices: [DeviceSchema],
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    addresses: [AddressSchema],
  },
  { timestamps: true },
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) return next();
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.models.User
  ? (mongoose.models.User as IUserModel)
  : mongoose.model<IUserDocument, IUserModel>('User', UserSchema);
