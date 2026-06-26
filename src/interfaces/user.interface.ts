import type { Document, Model, Types } from 'mongoose';

export interface IAddress {
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface IDeviceInfo {
  fingerprint?: string;
  name?: string;
  ip?: string;
  userAgent?: string;
  lastSeenAt?: Date;
}

export interface IUser {
  name: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  role: 'customer' | 'admin' | 'superadmin';
  googleId?: string;
  isVerified: boolean;
  verificationOtp?: string;
  otpExpiry?: Date;
  devices: IDeviceInfo[];
  wishlist: Types.ObjectId[];
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(password: string): Promise<boolean>;
}

export type IUserDocument = IUser & IUserMethods & Document;
export type IUserModel = Model<IUser, Record<string, never>, IUserMethods>;
