'use strict';

const mongoose = require('mongoose');

const SubscriberSchema = new mongoose.Schema({
  email: { type: String, lowercase: true, trim: true, index: true },
  phone: { type: String, index: true },
  source: { type: String },
  optedIn: { type: Boolean, default: true },
  meta: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('Subscriber', SubscriberSchema);
const mongoose = require('mongoose');

const SubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },

    // Date of subscription is the document createdAt.
    // Keep an explicit alias for readability/analytics.
    subscribedAt: { type: Date, default: Date.now },

    // Optional: track source channel (footer/newsletter/etc.)
    source: { type: String, default: 'footer' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscriber', SubscriberSchema);

