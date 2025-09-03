import { Hono } from 'hono';
import { authMiddleware, type AuthVariables } from '../middleware/auth.js';
import * as userModel from '../models/user.js';
import * as orgModel from '../models/organization.js';
import * as subscriptionModel from '../models/subscriptions.js';
import { generateDownloadURL } from '../lib/storage';

const profileRoutes = new Hono<{ Variables: AuthVariables }>()

  // Get profile by ID (can be user or organization)
  .get('/:id', authMiddleware, async (c) => {
    const profileId = c.req.param('id');
    
    try {
      // Try to fetch as user first
      const userInfo = await userModel.getUserById(profileId);
      
      if (userInfo) {
        // Generate avatar URL if user has an image
        const imageUrl = await generateDownloadURL(userInfo.image);
        
        // Get subscription data
        const subscription = await subscriptionModel.getUserActiveSubscription(userInfo.id);
        
        return c.json({
          id: userInfo.id,
          name: userInfo.name,
          image: imageUrl,
          description: userInfo.description || null,
          type: 'user' as const,
          isOfficial: userInfo.isOfficial || false,
          subscriptionPlan: subscription?.plan || 'free',
          createdAt: userInfo.createdAt
        });
      }
      
      // If not a user, try to fetch as organization
      const orgInfo = await orgModel.getOrgById(profileId);
      
      if (orgInfo) {
        // Generate logo URL if organization has a logo or imageKey
        const imageUrl = await generateDownloadURL(orgInfo.imageKey || orgInfo.logo);
        
        // Get the organization owner's subscription
        let subscriptionPlan = 'free';
        const orgOwner = await orgModel.getOrgOwner(orgInfo.id);
        if (orgOwner) {
          const ownerSubscription = await subscriptionModel.getUserActiveSubscription(orgOwner.userId);
          subscriptionPlan = ownerSubscription?.plan || 'free';
        }
        
        return c.json({
          id: orgInfo.id,
          name: orgInfo.name,
          image: imageUrl,
          description: orgInfo.description || null,
          type: 'organization' as const,
          isOfficial: orgInfo.isOfficial || false,
          subscriptionPlan,
          createdAt: orgInfo.createdAt
        });
      }
      
      // Neither user nor organization found
      return c.json({ error: 'Profile not found' }, 404);
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      return c.json({ error: 'Failed to fetch profile' }, 500);
    }
  });

export default profileRoutes;