'use strict';

const Subscriber = require('../models/subscriber');

async function subscribe(req, res) {
  try {
    const { email, phone, source, meta } = req.body || {};
    if (!email && !phone) return res.status(400).json({ success: false, message: 'email or phone required' });

    const existing = email ? await Subscriber.findOne({ email: email.toLowerCase() }) : null;
    if (existing) {
      existing.optedIn = true;
      existing.source = existing.source || source;
      existing.meta = { ...(existing.meta || {}), ...(meta || {}) };
      await existing.save();
      return res.status(200).json({ success: true, message: 'Already subscribed' });
    }

    const created = await Subscriber.create({ email: email?.toLowerCase(), phone, source, meta });

    // Send welcome email if email present
    if (email) {
      try {
        const mailer = require('../utils/mailService');
const subject = 'Welcome to RARE RAB IT';
        const text = `Thanks for subscribing to RARE RAB IT.`;
        await mailer.sendWelcomeEmail({ to: email, subject, text, html: `<p>${text}</p>` });
      } catch (err) {
        console.warn('Failed to send welcome email:', err?.message || err);
      }
    }

    return res.status(201).json({ success: true, message: 'Subscribed', id: created._id });
  } catch (err) {
    console.error('[subscriber.subscribe]', err);
    return res.status(500).json({ success: false, message: 'Subscribe failed' });
  }
}

async function unsubscribe(req, res) {
  try {
    const { email, phone } = req.body || {};
    if (!email && !phone) return res.status(400).json({ success: false, message: 'email or phone required' });

    const query = email ? { email: email.toLowerCase() } : { phone };
    const sub = await Subscriber.findOne(query);
    if (!sub) return res.status(404).json({ success: false, message: 'Subscriber not found' });
    sub.optedIn = false;
    await sub.save();
    return res.status(200).json({ success: true, message: 'Unsubscribed' });
  } catch (err) {
    console.error('[subscriber.unsubscribe]', err);
    return res.status(500).json({ success: false, message: 'Unsubscribe failed' });
  }
}

async function listSubscribers(req, res) {
  try {
    const subs = await Subscriber.find({}).sort({ createdAt: -1 }).limit(200);
    return res.status(200).json({ success: true, data: subs });
  } catch (err) {
    console.error('[subscriber.list]', err);
    return res.status(500).json({ success: false, message: 'Failed to list subscribers' });
  }
}

module.exports = { subscribe, unsubscribe, listSubscribers };
const { z } = require('zod');
const Subscriber = require('../models/subscriber');

const subscribeSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  source: z.string().trim().min(1).optional(),
});

async function subscribe(req, res) {
  try {
    const parsed = await subscribeSchema.parseAsync(req.body);

    // Upsert to avoid duplicate-key errors.
    // We store a record even if already subscribed.
    const updated = await Subscriber.findOneAndUpdate(
      { email: parsed.email.toLowerCase() },
      {
        $setOnInsert: {
          email: parsed.email.toLowerCase(),
          subscribedAt: new Date(),
          source: parsed.source ?? 'footer',
        },
        $set: {
          source: parsed.source ?? 'footer',
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Subscribed successfully',
      subscriber: { email: updated.email, subscribedAt: updated.subscribedAt },
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err?.message || 'Subscription failed',
    });
  }
}

module.exports = { subscribe };

