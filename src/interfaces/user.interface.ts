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
  _id?: string;
  id?: string;
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
  wishlist: string[];
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}
