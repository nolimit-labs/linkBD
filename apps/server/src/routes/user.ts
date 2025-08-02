import { Hono } from 'hono';
import { z } from 'zod';
import * as userModel from '../models/user.js';
import * as storageModel from '../models/storage.js';
import { authMiddleware, type AuthVariables } from '../middleware/auth.js';
import { zValidator } from '@hono/zod-validator';
import { generateDownloadURL } from '../lib/storage';

const userRoutes = new Hono<{ Variables: AuthVariables }>()

  // Get current user profile
  .get('/profile', authMiddleware, async (c) => {
    const { userId } = c.get('session');
    if (!userId) {
      return c.json({ error: 'Not authenticated' }, 401);
    }

    try {
      const currentUser = await userModel.getUserProfile(userId);

      if (!currentUser) {
        return c.json({ error: 'User not found' }, 404);
      }

      // Generate avatar URL if user has an image
      const avatarUrl = await generateDownloadURL(currentUser.image);

      return c.json({
        user: {
          ...currentUser,
          avatarUrl
        }
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return c.json({ error: 'Failed to fetch user profile' }, 500);
    }
  })

  // Update user profile
  .put('/profile', authMiddleware, zValidator('json', z.object({
    name: z.string().min(1).max(100).optional(),
    image: z.string().nullable().optional(), // File key from storage or null to remove
  })), async (c) => {
    const { userId } = c.get('session');
    if (!userId) {
      return c.json({ error: 'Not authenticated' }, 401);
    }
    const validatedData = c.req.valid('json');

    try {
      const updatedUser = await userModel.updateUser(userId, validatedData);

      if (!updatedUser) {
        return c.json({ error: 'User not found' }, 404);
      }

      // Generate avatar URL if user has an image
      const avatarUrl = await generateDownloadURL(updatedUser.image);

      return c.json({
        success: true,
        user: {
          ...updatedUser,
          avatarUrl
        }
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      return c.json({ error: 'Failed to update user profile' }, 500);
    }
  })
  
  // Get user profile by ID
  .get('/:id', authMiddleware, async (c) => {
    const targetUserId = c.req.param('id');
    
    try {
      const userProfile = await userModel.getUserProfile(targetUserId);
      
      if (!userProfile) {
        return c.json({ error: 'User not found' }, 404);
      }
      
      // Generate avatar URL if user has an image
      const avatarUrl = await generateDownloadURL(userProfile.image);
      
      return c.json({
        user: {
          ...userProfile,
          avatarUrl
        }
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return c.json({ error: 'Failed to fetch user profile' }, 500);
    }
  });

export default userRoutes;