import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        subscriptionTier: true,
        analysesRemaining: true,
        createdAt: true,
        _count: {
          select: {
            resumes: true,
            analyses: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
router.patch('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { name, username } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(username && { username }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        subscriptionTier: true,
        analysesRemaining: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;

