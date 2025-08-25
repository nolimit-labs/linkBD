import { Hono } from 'hono';
import { adminMiddleware, type AuthVariables } from '../middleware/auth';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { generateDownloadURL } from '../lib/storage';
import * as userModel from '../models/user';
import * as organizationModel from '../models/organization';
import * as storageModel from '../models/storage';
import * as adminModel from '../models/admin';

// Validation schema for query parameters
const getUsersQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  cursor: z.string().optional(),
});

const getOrganizationsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  cursor: z.string().optional(),
});

// Validation schema for subscription update
const updateSubscriptionSchema = z.object({
  plan: z.enum(['free', 'pro_complementary']),
});

const adminRoutes = new Hono<{ Variables: AuthVariables }>()

  // ================================
  // User Management Routes
  // ================================

  // Get all users with their image URLs and organization memberships
  .get('/users', adminMiddleware, zValidator('query', getUsersQuerySchema), async (c) => {
    try {
      const { limit, cursor } = c.req.valid('query');

      // Get paginated users from model
      const result = await userModel.getAllUsersPaginated({
        limit,
        cursor,
      });

      // Get organization memberships and subscriptions for these users
      let userMembershipsMap = new Map<string, Array<{
        organizationId: string;
        organizationName: string | null;
        role: string | null;
      }>>();

      let userPlansMap = new Map<string, {
        plan: string;
        status: string | null;
        periodStart: Date | null;
        periodEnd: Date | null;
        cancelAtPeriodEnd: boolean | null;
      }>();

      if (result.users.length > 0) {
        const userIds = result.users.map(u => u.id);
        
        // Get organization memberships using model function
        const memberships = await userModel.getUserMemberships(userIds);

        // Get subscription information using model function
        const subscriptions = await userModel.getUserSubscriptions(userIds);

        // Build the memberships map
        memberships.forEach(membership => {
          if (!userMembershipsMap.has(membership.userId)) {
            userMembershipsMap.set(membership.userId, []);
          }
          userMembershipsMap.get(membership.userId)?.push({
            organizationId: membership.organizationId,
            organizationName: membership.organizationName,
            role: membership.role,
          });
        });

        // Build the plans map
        subscriptions.forEach(sub => {
          userPlansMap.set(sub.referenceId, {
            plan: sub.plan,
            status: sub.status,
            periodStart: sub.periodStart,
            periodEnd: sub.periodEnd,
            cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
          });
        });
      }

      // Process users to add image URLs, organizations, and plan information
      const usersWithDetails = await Promise.all(
        result.users.map(async (user) => {
          // Generate image URL if user has an image
          const imageUrl = user.image ? await generateDownloadURL(user.image) : null;
          
          // Get organizations for this user from the map
          const organizations = userMembershipsMap.get(user.id) || [];
          
          // Get plan information for this user from the map
          const planInfo = userPlansMap.get(user.id);

          return {
            id: user.id,
            email: user.email,
            emailVerified: user.emailVerified,
            name: user.name,
            image: user.image,
            imageUrl,
            role: user.role,
            banned: user.banned || false,
            banReason: user.banReason,
            banExpires: user.banExpires,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            organizations,
            plan: planInfo ? {
              name: planInfo.plan,
              status: planInfo.status,
              periodStart: planInfo.periodStart,
              periodEnd: planInfo.periodEnd,
              cancelAtPeriodEnd: planInfo.cancelAtPeriodEnd,
            } : null,
          };
        })
      );

      return c.json({
        users: usersWithDetails,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      return c.json({ error: 'Failed to fetch users' }, 500);
    }
  })

    // Update user subscription (admin only)
    .patch('/users/:userId/subscription', adminMiddleware, zValidator('json', updateSubscriptionSchema), async (c) => {
      try {
        const userId = c.req.param('userId');
        const { plan } = c.req.valid('json');
  
        // Verify the user exists
        const user = await userModel.getUserById(userId);
        if (!user) {
          return c.json({ error: 'User not found' }, 404);
        }
  
        // Get the user's active subscription
        const activeSubscription = await userModel.getUserActiveSubscription(userId);
  
        if (!activeSubscription) {
          // If no active subscription exists, create a new one
          const newSubscription = await userModel.createUserSubscription(
            userId,
            plan,
            user.stripeCustomerId ?? undefined
          );
  
          return c.json({
            success: true,
            subscription: {
              id: newSubscription.id,
              plan: newSubscription.plan,
              status: newSubscription.status,
            },
          });
        }
  
        // Update the existing subscription
        const updatedSubscription = await userModel.updateUserSubscription(
          activeSubscription.id,
          userId,
          plan
        );
  
        if (!updatedSubscription) {
          return c.json({ error: 'Failed to update subscription' }, 500);
        }
  
        return c.json({
          success: true,
          subscription: {
            id: updatedSubscription.id,
            plan: updatedSubscription.plan,
            status: updatedSubscription.status,
          },
        });
      } catch (error) {
        console.error('Error updating user subscription:', error);
        return c.json({ error: 'Failed to update subscription' }, 500);
      }
    })

  // ================================
  // Organization Management Routes
  // ================================

  // Get all organizations with their member counts
  .get('/organizations', adminMiddleware, zValidator('query', getOrganizationsQuerySchema), async (c) => {
    try {
      const { limit, cursor } = c.req.valid('query');

      // Get paginated organizations with member counts from model
      const result = await organizationModel.getAllOrgsPaginated({
        limit,
        cursor,
      });

      // Process organizations to add logo URLs
      const organizationsWithDetails = await Promise.all(
        result.organizations.map(async (org) => {
          // Generate logo URL if organization has a logo
          const logoUrl = org.logo ? await generateDownloadURL(org.logo) : null;

          return {
            id: org.id,
            name: org.name,
            slug: org.slug,
            logo: org.logo,
            logoUrl,
            memberCount: org.memberCount || 0,
            createdAt: org.createdAt,
          };
        })
      );

      return c.json({
        organizations: organizationsWithDetails,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('Error fetching organizations:', error);
      return c.json({ error: 'Failed to fetch organizations' }, 500);
    }
  })

  // ================================
  // Profile Related Routes
  // ================================

  // Get user or organization profile by ID (admin access) - Profile info only
  .get('/profile/:id', adminMiddleware, async (c) => {
    try {
      const profileId = c.req.param('id');

      // First try to get user profile
      const userProfileData = await adminModel.getUserProfileForAdmin(profileId);
      
      if (userProfileData) {
        return c.json({
          type: 'user' as const,
          profile: userProfileData.profile,
          organizations: userProfileData.organizations,
        });
      }

      // Try to get organization profile
      const orgProfileData = await adminModel.getOrgProfileForAdmin(profileId);
      
      if (orgProfileData) {
        return c.json({
          type: 'organization' as const,
          profile: orgProfileData.profile,
          members: orgProfileData.members,
        });
      }

      return c.json({ error: 'Profile not found' }, 404);
    } catch (error) {
      console.error('Error fetching profile:', error);
      return c.json({ error: 'Failed to fetch profile' }, 500);
    }
  })



  // Get files for a specific profile (user or organization)
  .get('/profile/:id/files', adminMiddleware, async (c) => {
    try {
      const profileId = c.req.param('id');

      // First check if it's a user
      const userExists = await userModel.getUserById(profileId);
      
      if (userExists) {
        // Get user's files
        const files = await storageModel.getUserFiles(profileId);
        
        // Add download URLs to files
        const filesWithUrls = await Promise.all(
          files.map(async (file: any) => ({
            ...file,
            downloadUrl: await generateDownloadURL(file.fileKey),
          }))
        );

        return c.json({
          type: 'user' as const,
          files: filesWithUrls,
          stats: {
            totalFiles: files.length,
            totalSize: files.reduce((sum: number, file: any) => sum + file.size, 0),
          }
        });
      }

      // Check if it's an organization
      const orgExists = await organizationModel.getOrgById(profileId);
      
      if (orgExists) {
        // Get organization's files
        const files = await storageModel.getOrgFiles(profileId);
        
        // Add download URLs to files
        const filesWithUrls = await Promise.all(
          files.map(async (file: any) => ({
            ...file,
            downloadUrl: await generateDownloadURL(file.fileKey),
          }))
        );

        return c.json({
          type: 'organization' as const,
          files: filesWithUrls,
          stats: {
            totalFiles: files.length,
            totalSize: files.reduce((sum: number, file: any) => sum + file.size, 0),
          }
        });
      }

      return c.json({ error: 'Profile not found' }, 404);
    } catch (error) {
      console.error('Error fetching profile files:', error);
      return c.json({ error: 'Failed to fetch profile files' }, 500);
    }
  })

  // ================================
  // Migration Management Routes
  // ================================

  // Get list of available migrations and their status
  .get('/migrations', adminMiddleware, async (c) => {
    try {
      const availableMigrations = await adminModel.getAvailableMigrations();
      const migrationHistory = await adminModel.getMigrationHistory(10);
      
      // Check status for each available migration
      const migrationsWithStatus = await Promise.all(
        availableMigrations.map(async (migration) => {
          const status = await adminModel.getMigrationStatus(migration.filename);
          return {
            ...migration,
            lastRun: status ? {
              status: status.status,
              startedAt: status.startedAt,
              completedAt: status.completedAt,
              error: status.error,
            } : null,
          };
        })
      );
      
      return c.json({
        migrations: migrationsWithStatus,
        recentHistory: migrationHistory,
      });
    } catch (error) {
      console.error('Error fetching migrations:', error);
      return c.json({ error: 'Failed to fetch migrations' }, 500);
    }
  })

  // Get detailed migration history
  .get('/migrations/history', adminMiddleware, async (c) => {
    try {
      const history = await adminModel.getMigrationHistory(100);
      
      return c.json({
        history,
        total: history.length,
      });
    } catch (error) {
      console.error('Error fetching migration history:', error);
      return c.json({ error: 'Failed to fetch migration history' }, 500);
    }
  })

  // Get status of a specific migration
  .get('/migrations/:filename/status', adminMiddleware, async (c) => {
    try {
      const filename = c.req.param('filename');
      const status = await adminModel.getMigrationStatus(filename);
      
      if (!status) {
        return c.json({ 
          filename,
          status: 'never_run',
          message: 'This migration has never been executed' 
        });
      }
      
      return c.json(status);
    } catch (error) {
      console.error('Error fetching migration status:', error);
      return c.json({ error: 'Failed to fetch migration status' }, 500);
    }
  })

  // Execute a migration
  .post('/migrations/:filename/run', adminMiddleware, async (c) => {
    try {
      const filename = c.req.param('filename');
      const { user } = c.get('session');
      
      // Check if any migration is currently running
      const isRunning = await adminModel.isMigrationRunning();
      if (isRunning) {
        return c.json({ 
          error: 'Another migration is currently running. Please wait for it to complete.' 
        }, 409);
      }
      
      // Execute the migration
      const result = await adminModel.executeMigration(filename, user.id);
      
      if (result.success) {
        return c.json({
          success: true,
          runId: result.runId,
          output: result.output,
          message: 'Migration executed successfully',
        });
      } else {
        return c.json({
          success: false,
          runId: result.runId,
          error: result.error,
          output: result.output,
          message: 'Migration failed',
        }, 500);
      }
    } catch (error) {
      console.error('Error executing migration:', error);
      return c.json({ error: 'Failed to execute migration' }, 500);
    }
  })

  // Rollback a migration
  .post('/migrations/:filename/rollback', adminMiddleware, async (c) => {
    try {
      const filename = c.req.param('filename');
      const { user } = c.get('session');
      
      // Check if any migration is currently running
      const isRunning = await adminModel.isMigrationRunning();
      if (isRunning) {
        return c.json({ 
          error: 'Another migration is currently running. Please wait for it to complete.' 
        }, 409);
      }
      
      // Execute the rollback
      const result = await adminModel.rollbackMigration(filename, user.id);
      
      if (result.success) {
        return c.json({
          success: true,
          runId: result.runId,
          output: result.output,
          message: 'Migration rolled back successfully',
        });
      } else {
        return c.json({
          success: false,
          runId: result.runId,
          error: result.error,
          output: result.output,
          message: 'Rollback failed',
        }, 500);
      }
    } catch (error) {
      console.error('Error rolling back migration:', error);
      return c.json({ error: 'Failed to rollback migration' }, 500);
    }
  })

  // ================================
  // Orphaned Resource Routes (Phase 3 - Placeholder)
  // ================================

  // Get orphaned resources summary
  .get('/orphaned/summary', adminMiddleware, async (c) => {
    try {
      const summary = await adminModel.getOrphanedResourcesSummary();
      
      return c.json(summary);
    } catch (error) {
      console.error('Error fetching orphaned resources summary:', error);
      return c.json({ error: 'Failed to fetch orphaned resources' }, 500);
    }
  })



  // Get orphaned files
  .get('/orphaned/files', adminMiddleware, async (c) => {
    try {
      const orphanedFiles = await adminModel.findOrphanedFiles();
      
      // Add download URLs to files
      const filesWithUrls = await Promise.all(
        orphanedFiles.map(async (file: any) => ({
          ...file,
          downloadUrl: await generateDownloadURL(file.fileKey),
        }))
      );
      
      return c.json({
        files: filesWithUrls,
        count: filesWithUrls.length,
        totalSize: orphanedFiles.reduce((sum: number, file: any) => sum + (file.size || 0), 0),
      });
    } catch (error) {
      console.error('Error fetching orphaned files:', error);
      return c.json({ error: 'Failed to fetch orphaned files' }, 500);
    }
  })

  // Delete a specific orphaned resource
  .delete('/orphaned/:type/:id', adminMiddleware, async (c) => {
    try {
      const type = c.req.param('type') as 'file';
      const id = c.req.param('id');
      
      if (type !== 'file') {
        return c.json({ error: 'Invalid resource type' }, 400);
      }
      
      const result = await adminModel.deleteOrphanedResource(type, id);
      
      return c.json(result);
    } catch (error) {
      console.error('Error deleting orphaned resource:', error);
      return c.json({ error: 'Failed to delete orphaned resource' }, 500);
    }
  })

  // Batch delete orphaned resources
  .post('/orphaned/:type/batch-delete', adminMiddleware, zValidator('json', z.object({
    ids: z.array(z.string()).min(1),
  })), async (c) => {
    try {
      const type = c.req.param('type') as 'todo' | 'file';
      const { ids } = c.req.valid('json');
      
      if (type !== 'todo' && type !== 'file') {
        return c.json({ error: 'Invalid resource type' }, 400);
      }
      
      const result = await adminModel.batchDeleteOrphans(type, ids);
      
      return c.json(result);
    } catch (error) {
      console.error('Error batch deleting orphaned resources:', error);
      return c.json({ error: 'Failed to batch delete orphaned resources' }, 500);
    }
  });



export default adminRoutes;