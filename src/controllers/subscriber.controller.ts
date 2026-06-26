import type { Request, Response } from 'express';
import Subscriber from '../models/subscriber';
import { sendWelcomeEmail } from '../utils/mailService';

export async function subscribe(req: Request, res: Response): Promise<void> {
  try {
    const { email, phone, source, meta } = (req.body ?? {}) as {
      email?: string;
      phone?: string;
      source?: string;
      meta?: Record<string, unknown>;
    };

    if (!email && !phone) {
      res.status(400).json({ success: false, message: 'email or phone required' });
      return;
    }

    const existing = email ? await Subscriber.findOne({ email: email.toLowerCase() }) : null;
    if (existing) {
      existing.optedIn = true;
      existing.source = existing.source ?? source;
      existing.meta = { ...(existing.meta as Record<string, unknown> ?? {}), ...(meta ?? {}) };
      await existing.save();
      res.status(200).json({ success: true, message: 'Already subscribed' });
      return;
    }

    const created = await Subscriber.create({
      email: email?.toLowerCase(),
      phone,
      source,
      meta,
    });

    if (email) {
      try {
        const text = 'Thanks for subscribing to RARE RAB IT.';
        await sendWelcomeEmail({
          to: email,
          subject: 'Welcome to RARE RAB IT',
          text,
          html: `<p>${text}</p>`,
        });
      } catch (err) {
        console.warn('Failed to send welcome email:', err instanceof Error ? err.message : err);
      }
    }

    res.status(201).json({ success: true, message: 'Subscribed', id: created._id });
  } catch (err) {
    console.error('[subscriber.subscribe]', err);
    res.status(500).json({ success: false, message: 'Subscribe failed' });
  }
}

export async function unsubscribe(req: Request, res: Response): Promise<void> {
  try {
    const { email, phone } = (req.body ?? {}) as { email?: string; phone?: string };

    if (!email && !phone) {
      res.status(400).json({ success: false, message: 'email or phone required' });
      return;
    }

    const query = email ? { email: email.toLowerCase() } : { phone };
    const sub = await Subscriber.findOne(query);
    if (!sub) {
      res.status(404).json({ success: false, message: 'Subscriber not found' });
      return;
    }

    sub.optedIn = false;
    await sub.save();
    res.status(200).json({ success: true, message: 'Unsubscribed' });
  } catch (err) {
    console.error('[subscriber.unsubscribe]', err);
    res.status(500).json({ success: false, message: 'Unsubscribe failed' });
  }
}

export async function listSubscribers(req: Request, res: Response): Promise<void> {
  try {
    const subs = await Subscriber.find({}).sort({ createdAt: -1 }).limit(200);
    res.status(200).json({ success: true, data: subs });
  } catch (err) {
    console.error('[subscriber.list]', err);
    res.status(500).json({ success: false, message: 'Failed to list subscribers' });
  }
}
