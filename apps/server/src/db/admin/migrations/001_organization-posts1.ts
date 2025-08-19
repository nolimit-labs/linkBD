/**
 * Migration Script - Phase 1: Organization Posts
 * 
 * This migration script:
 * 1. Populates the createdBy field with userId for ALL posts
 * 2. For posts with organizationId, removes userId to make them organization-only posts
 * 
 * Prerequisites:
 * - createdBy field must already exist in the posts table
 * - userId field must be nullable in the schema
 * 
 * Usage:
 * 1. Run this script in a test environment first
 * 2. Backup your database before running in production
 * 3. Execute: tsx 001_organization-posts1.ts
 */

import { sql, and, isNotNull } from 'drizzle-orm';
import { db } from '../../index';
import { posts } from '../../schema';
import { log } from '../cli/utils/logger'; // TODO: Remove this
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../schema';

async function migrateOrganizationPosts() {
  log.title('Starting migration: Organization Posts Phase 1');

  try {
    // Step 1: Count all posts and organization posts
    const allPostsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(isNotNull(posts.userId));

    const orgPostsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(
        and(
          isNotNull(posts.organizationId),
          isNotNull(posts.userId)
        )
      );

    const totalPosts = Number(allPostsResult[0]?.count || 0);
    const orgPosts = Number(orgPostsResult[0]?.count || 0);
    
    log.info(`Found ${totalPosts} total posts with userId`);
    log.info(`Found ${orgPosts} organization posts that will become org-only`);

    if (totalPosts === 0) {
      log.warning('No posts found. Exiting...');
      return;
    }

    // Step 2: Begin transaction for safety
    log.step('Starting database transaction...');
    
    // Execute migration in a transaction
    await db.transaction(async (tx: NodePgDatabase<typeof schema>) => {
      // Step 3: Populate createdBy for ALL posts with userId
      log.step('Populating createdBy field for ALL posts...');
      
      const updateAllCreatedBy = await tx.execute(sql`
        UPDATE ${posts}
        SET created_by = user_id
        WHERE user_id IS NOT NULL
          AND created_by IS NULL
      `);

      log.success(`Updated createdBy for ${updateAllCreatedBy.rowCount} posts`);

      // Step 4: Remove userId for organization posts (make them org-only)
      log.step('Removing userId from organization posts...');
      
      const removeUserId = await tx.execute(sql`
        UPDATE ${posts}
        SET user_id = NULL
        WHERE organization_id IS NOT NULL
          AND created_by IS NOT NULL
      `);

      log.success(`Removed userId from ${removeUserId.rowCount} organization posts`);

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
    log.info(`• Total posts updated: ${totalPosts}`);
    log.info(`• Organization posts converted: ${orgPosts}`);
    log.info('• All posts now have:');
    log.info('  - createdBy: populated with original userId');
    log.info('• Organization posts additionally have:');
    log.info('  - userId: null (posts attributed to organization)');
    log.info('  - organizationId: set (organization ownership)');
    
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
      log.step('Restoring userId for organization posts...');
      
      const restoreUserId = await tx.execute(sql`
        UPDATE ${posts}
        SET user_id = created_by
        WHERE organization_id IS NOT NULL
          AND user_id IS NULL
          AND created_by IS NOT NULL
      `);

      log.success(`Restored userId for ${restoreUserId.rowCount} organization posts`);

      // Clear createdBy field for ALL posts
      log.step('Clearing createdBy field for all posts...');
      
      const clearCreatedBy = await tx.execute(sql`
        UPDATE ${posts}
        SET created_by = NULL
        WHERE created_by IS NOT NULL
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