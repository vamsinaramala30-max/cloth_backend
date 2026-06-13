const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AddressSchema = new mongoose.Schema({
  label: { type: String, required: true }, // e.g., Home, Work
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true },
  phone: { type: String, sparse: true, index: true }, // optional E.164 phone number
  passwordHash: { type: String },
  role: { type: String, enum: ['customer', 'admin', 'superadmin'], default: 'customer' },
  googleId: { type: String, sparse: true },
  isVerified: { type: Boolean, default: false },
  verificationOtp: { type: String },
  otpExpiry: { type: Date },
  devices: [
    {
      fingerprint: { type: String },
      name: { type: String },
      ip: { type: String },
      userAgent: { type: String },
      lastSeenAt: { type: Date, default: Date.now },
    },
  ],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  addresses: [AddressSchema]
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) return next();
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

UserSchema.methods.comparePassword = async function(password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);