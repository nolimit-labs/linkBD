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
    const { user } = c.get('session');

    try {
      const currentUser = await userModel.getUserProfileById(user.id);

      if (!currentUser) {
        return c.json({ error: 'User not found' }, 404);
      }

      return c.json({
       ...currentUser
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
    description: z.string().max(500).optional(), // User bio/about section
  })), async (c) => {
    const { user } = c.get('session');
    const validatedData = c.req.valid('json');

    try {
      const updatedUser = await userModel.updateUser(user.id, validatedData);

      if (!updatedUser) {
        return c.json({ error: 'User not found' }, 404);
      }

      return c.json({
        ...updatedUser,
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      return c.json({ error: 'Failed to update user profile' }, 500);
    }
  })
  


export default userRoutes;