/**
 * Migration Script - Phase 1: Organization Posts
 * 
 * This migration script populates the createdBy field with the userId value
 * for posts that have an organizationId, then removes the userId to make them
 * true organization-only posts.
 * 
 * Prerequisites:
 * - createdBy field must already exist in the posts table
 * - userId field must be nullable in the schema
 * 
 * Usage:
 * 1. Run this script in a test environment first
 * 2. Backup your database before running in production
 * 3. Execute: tsx migration-organization-posts-phase1.ts
 */

import { sql, and, isNotNull } from 'drizzle-orm';
import { db } from '../../index';
import { posts } from '../../schema';
import { log } from '../cli/utils/logger';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../schema';

async function migrateOrganizationPosts() {
  log.title('Starting migration: Organization Posts Phase 1');

  try {
    // Step 1: Count posts that will be affected
    const affectedPosts = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(
        and(
          isNotNull(posts.organizationId),
          isNotNull(posts.userId)
        )
      );

    const totalCount = Number(affectedPosts[0]?.count || 0);
    log.info(`Found ${totalCount} posts with both userId and organizationId`);

    if (totalCount === 0) {
      log.warning('No posts need migration. Exiting...');
      return;
    }

    // Step 2: Begin transaction for safety
    log.step('Starting database transaction...');
    
    // Execute migration in a transaction
    await db.transaction(async (tx: NodePgDatabase<typeof schema>) => {
      // Step 3: Update posts - populate createdBy with userId for organization posts
      log.step('Populating createdBy field with userId values...');
      
      const updateCreatedBy = await tx.execute(sql`
        UPDATE ${posts}
        SET created_by = user_id
        WHERE organization_id IS NOT NULL
          AND user_id IS NOT NULL
          AND created_by IS NULL
      `);

      log.success(`Updated createdBy for ${updateCreatedBy.rowCount} posts`);

      // Step 4: Remove userId for organization posts (make them org-only)
      log.step('Removing userId from organization posts...');
      
      const removeUserId = await tx.execute(sql`
        UPDATE ${posts}
        SET user_id = NULL
        WHERE organization_id IS NOT NULL
          AND created_by IS NOT NULL
      `);

      log.success(`Removed userId from ${removeUserId.rowCount} posts`);

      // Step 5: Verify the migration
      log.step('Verifying migration results...');
      
      // Check for posts that still have both userId and organizationId
      const invalidPosts = await tx
        .select({ count: sql<number>`count(*)` })
        .from(posts)
        .where(
          and(
            isNotNull(posts.organizationId),
            isNotNull(posts.userId)
          )
        );

      const invalidCount = Number(invalidPosts[0]?.count || 0);
      
      if (invalidCount > 0) {
        throw new Error(`Migration verification failed: ${invalidCount} posts still have both userId and organizationId`);
      }

      // Check that organization posts have createdBy set
      const orgPostsWithoutCreatedBy = await tx
        .select({ count: sql<number>`count(*)` })
        .from(posts)
        .where(
          and(
            isNotNull(posts.organizationId),
            sql`${posts.createdBy} IS NULL`
          )
        );

      const missingCreatedByCount = Number(orgPostsWithoutCreatedBy[0]?.count || 0);
      
      if (missingCreatedByCount > 0) {
        log.warning(`${missingCreatedByCount} organization posts don't have createdBy set. These may be legacy posts.`);
      }

      log.success('Migration verification passed!');
    });

    // Step 6: Final summary
    log.title('Migration completed successfully!');
    log.info('Summary:');
    log.info(`• Total posts migrated: ${totalCount}`);
    log.info('• All organization posts now have:');
    log.info('  - userId: null (posts attributed to organization)');
    log.info('  - organizationId: set (organization ownership)');
    log.info('  - createdBy: set (user who created the post)');
    
  } catch (error) {
    log.error(`Migration failed: ${error}`);
    log.error('Transaction has been rolled back. No changes were made to the database.');
    process.exit(1);
  }
}

// Add rollback function for safety
async function rollbackMigration() {
  log.title('Starting rollback: Organization Posts Phase 1');

  try {
    await db.transaction(async (tx: NodePgDatabase<typeof schema>) => {
      // Restore userId from createdBy for organization posts
      log.step('Restoring userId from createdBy field...');
      
      const restoreUserId = await tx.execute(sql`
        UPDATE ${posts}
        SET user_id = created_by
        WHERE organization_id IS NOT NULL
          AND user_id IS NULL
          AND created_by IS NOT NULL
      `);

      log.success(`Restored userId for ${restoreUserId.rowCount} posts`);

      // Clear createdBy field for organization posts that now have userId
      log.step('Clearing createdBy field...');
      
      const clearCreatedBy = await tx.execute(sql`
        UPDATE ${posts}
        SET created_by = NULL
        WHERE organization_id IS NOT NULL
          AND user_id IS NOT NULL
          AND created_by = user_id
      `);

      log.success(`Cleared createdBy for ${clearCreatedBy.rowCount} posts`);
    });

    log.success('Rollback completed successfully!');
    
  } catch (error) {
    log.error(`Rollback failed: ${error}`);
    process.exit(1);
  }
}

// Check command line arguments
// Main execution
const command = process.argv[2];

if (command === '--rollback') {
  log.info('Running in ROLLBACK mode...');
  rollbackMigration().catch((error) => {
    log.error(`Failed to execute rollback: ${error}`);
    process.exit(1);
  });
} else if (command === '--help') {
  console.log('Organization Posts Migration Script - Phase 1');
  console.log('');
  console.log('Usage:');
  console.log('  tsx migration-organization-posts-phase1.ts         Run the migration');
  console.log('  tsx migration-organization-posts-phase1.ts --rollback   Rollback the migration');
  console.log('  tsx migration-organization-posts-phase1.ts --help       Show this help message');
  console.log('');
  console.log('Environment variables:');
  console.log('  DATABASE_URL    PostgreSQL connection string (required)');
} else {
  // Run the migration
  migrateOrganizationPosts().catch((error) => {
    log.error(`Failed to execute migration: ${error}`);
    process.exit(1);
  });
}