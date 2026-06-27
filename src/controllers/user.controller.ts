import type { Request, Response } from 'express';
import { supabase } from '../database/connect';

function getUserId(req: Request): string | undefined {
  return req.user?.id;
}

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { data: addresses } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId);

    const { data: wishlist } = await supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', userId);

    const mappedUser = {
      ...user,
      _id: user.id,
      addresses: (addresses || []).map((addr) => ({
        ...addr,
        postalCode: addr.postal_code,
        isDefault: addr.is_default,
      })),
      wishlist: (wishlist || []).map((w) => w.product_id),
    };

    res.status(200).json({ success: true, user: mappedUser });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get profile';
    res.status(500).json({ success: false, message });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { name, email } = req.body as { name?: string; email?: string };

    const updates: Record<string, any> = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error || !user) {
      res.status(500).json({ success: false, message: error?.message || 'Update failed' });
      return;
    }

    // Update in auth.users too
    await supabase.auth.admin.updateUserById(userId, {
      email: email,
      user_metadata: { name },
    });

    const { data: addresses } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId);

    const { data: wishlist } = await supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', userId);

    const mappedUser = {
      ...user,
      _id: user.id,
      addresses: (addresses || []).map((addr) => ({
        ...addr,
        postalCode: addr.postal_code,
        isDefault: addr.is_default,
      })),
      wishlist: (wishlist || []).map((w) => w.product_id),
    };

    res.status(200).json({ success: true, message: 'Profile updated', user: mappedUser });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    res.status(500).json({ success: false, message });
  }
};

export const addAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { label, street, city, state, postalCode, country, isDefault } = req.body as {
      label: string;
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      isDefault?: boolean;
    };

    // Get current addresses count
    const { data: currentAddresses } = await supabase
      .from('addresses')
      .select('id')
      .eq('user_id', userId);

    const addressCount = currentAddresses?.length || 0;
    const makeDefault = isDefault ?? (addressCount === 0);

    if (makeDefault) {
      // Set all other user addresses to not default
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { error: insertError } = await supabase.from('addresses').insert({
      user_id: userId,
      label,
      street,
      city,
      state,
      postal_code: postalCode,
      country,
      is_default: makeDefault,
    });

    if (insertError) {
      res.status(500).json({ success: false, message: insertError.message });
      return;
    }

    const { data: addresses } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId);

    const mappedAddresses = (addresses || []).map((addr) => ({
      ...addr,
      _id: addr.id,
      postalCode: addr.postal_code,
      isDefault: addr.is_default,
    }));

    res.status(201).json({ success: true, message: 'Address added', addresses: mappedAddresses });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add address';
    res.status(500).json({ success: false, message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie('accessToken');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Logout failed';
    res.status(500).json({ success: false, message });
  }
};
