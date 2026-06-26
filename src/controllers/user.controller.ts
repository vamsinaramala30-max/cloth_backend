import type { Request, Response } from 'express';
import User from '../models/user';

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

    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, user });
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

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true },
    ).select('-passwordHash');

    res.status(200).json({ success: true, message: 'Profile updated', user });
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

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      label,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault: isDefault ?? user.addresses.length === 0,
    });

    await user.save();

    res.status(201).json({ success: true, message: 'Address added', addresses: user.addresses });
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
