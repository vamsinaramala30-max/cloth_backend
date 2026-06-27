import type { Request, Response } from 'express';
import { supabase } from '../database/connect';
import { sendWelcomeEmail } from '../utils/mailService';

export const subscribe = async (req: Request, res: Response): Promise<void> => {
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

    const emailKey = email ? email.toLowerCase() : null;

    let existing = null;
    if (emailKey) {
      const { data } = await supabase
        .from('subscribers')
        .select('*')
        .eq('email', emailKey)
        .maybeSingle();
      existing = data;
    }

    if (existing) {
      await supabase
        .from('subscribers')
        .update({
          opted_in: true,
          source: existing.source ?? source,
          meta: { ...(existing.meta || {}), ...(meta || {}) },
        })
        .eq('id', existing.id);

      res.status(200).json({ success: true, message: 'Already subscribed' });
      return;
    }

    const { data: created, error } = await supabase
      .from('subscribers')
      .insert({
        email: emailKey,
        phone,
        source,
        meta,
        opted_in: true,
      })
      .select()
      .single();

    if (error || !created) {
      res.status(500).json({ success: false, message: error?.message || 'Subscribe failed' });
      return;
    }

    if (emailKey) {
      try {
        const text = 'Thanks for subscribing to RARE RAB IT.';
        await sendWelcomeEmail({
          to: emailKey,
          subject: 'Welcome to RARE RAB IT',
          text,
          html: `<p>${text}</p>`,
        });
      } catch (err) {
        console.warn('Failed to send welcome email:', err instanceof Error ? err.message : err);
      }
    }

    res.status(201).json({ success: true, message: 'Subscribed', id: created.id });
  } catch (err) {
    console.error('[subscriber.subscribe]', err);
    res.status(500).json({ success: false, message: 'Subscribe failed' });
  }
};

export const unsubscribe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone } = (req.body ?? {}) as { email?: string; phone?: string };

    if (!email && !phone) {
      res.status(400).json({ success: false, message: 'email or phone required' });
      return;
    }

    let query = supabase.from('subscribers').select('*');
    if (email) {
      query = query.eq('email', email.toLowerCase());
    } else {
      query = query.eq('phone', phone);
    }

    const { data: sub, error } = await query.maybeSingle();

    if (error || !sub) {
      res.status(404).json({ success: false, message: 'Subscriber not found' });
      return;
    }

    await supabase
      .from('subscribers')
      .update({ opted_in: false })
      .eq('id', sub.id);

    res.status(200).json({ success: true, message: 'Unsubscribed' });
  } catch (err) {
    console.error('[subscriber.unsubscribe]', err);
    res.status(500).json({ success: false, message: 'Unsubscribe failed' });
  }
};

export const listSubscribers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: subs, error } = await supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      res.status(500).json({ success: false, message: error.message });
      return;
    }

    const mapped = (subs || []).map((s) => ({
      ...s,
      _id: s.id,
      optedIn: s.opted_in,
    }));

    res.status(200).json({ success: true, data: mapped });
  } catch (err) {
    console.error('[subscriber.list]', err);
    res.status(500).json({ success: false, message: 'Failed to list subscribers' });
  }
};
