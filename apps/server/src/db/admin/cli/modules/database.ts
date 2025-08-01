import { sql } from 'drizzle-orm';
import { db } from '../../../index.js';
import { spawn } from 'child_process';
import { log } from '../utils/logger.js';
// Subscription plans are now in constants - no seeding needed

export class DatabaseAdmin {
  // Get all table names from the database (PostgreSQL)
  async getTables(): Promise<string[]> {
    const result = await db.execute(sql`
      SELECT tablename as name 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    return result.rows.map((row: any) => row.name);
  }

  // Delete all data from all tables
  async deleteAllData(): Promise<void> {
    log.title('DELETE ALL DATA');
    
    const tables = await this.getTables();
    if (tables.length === 0) {
      log.warning('No tables found in database');
      return;
    }

    log.info(`Found ${tables.length} tables: ${tables.join(', ')}`);
    
    // Delete data from all tables in reverse dependency order
    const orderedTables = this.getTablesInDeleteOrder(tables);
    
    for (const table of orderedTables) {
      try {
        log.step(`Deleting all data from ${table}...`);
        // Quote table name to handle reserved keywords
        await db.execute(sql.raw(`DELETE FROM "${table}"`));
        
        // Reset sequences for PostgreSQL
        try {
          await db.execute(sql.raw(`ALTER SEQUENCE IF EXISTS "${table}_id_seq" RESTART WITH 1`));
        } catch {
          // Sequence might not exist, which is fine
        }
        
        log.success(`Cleared ${table}`);
      } catch (error: any) {
        log.error(`Failed to clear ${table}: ${error.message}`);
      }
    }

    // Vacuum database (PostgreSQL)
    log.step('Analyzing database...');
    await db.execute(sql`ANALYZE`);

    log.success('All data deleted successfully!');
  }

  // Drop all tables (structure + data)
  async dropAllTables(): Promise<void> {
    log.title('DROP ALL TABLES');
    
    const tables = await this.getTables();
    if (tables.length === 0) {
      log.warning('No tables found in database');
      return;
    }

    log.info(`Found ${tables.length} tables: ${tables.join(', ')}`);
    log.warning('This will permanently delete all table structures and data!');
    
    // Drop tables in reverse dependency order
    const orderedTables = this.getTablesInDeleteOrder(tables).reverse();
    
    for (const table of orderedTables) {
      try {
        log.step(`Dropping table ${table}...`);
        // Quote table name to handle reserved keywords
        await db.execute(sql.raw(`DROP TABLE IF EXISTS "${table}" CASCADE`));
        log.success(`Dropped ${table}`);
      } catch (error: any) {
        log.error(`Failed to drop ${table}: ${error.message}`);
      }
    }

    log.success('All tables dropped successfully!');
  }

  // Get tables in proper deletion order (dependencies first)
  private getTablesInDeleteOrder(tables: string[]): string[] {
    // Define dependency order for TodoApp schema
    const dependencyOrder = [
      'todos',                  // depends on user
      'subscription',           // depends on user
      'verification',           // depends on user
      'session',                // depends on user
      'account',                // depends on user
      'user',                   // base table
    ];

    // Filter to only existing tables and maintain order
    const orderedExisting = dependencyOrder.filter(table => tables.includes(table));
    
    // Add any remaining tables not in our predefined order
    const remaining = tables.filter(table => !dependencyOrder.includes(table));
    
    return [...orderedExisting, ...remaining];
  }

  // Show database information
  async showInfo(): Promise<void> {
    log.title('DATABASE INFORMATION');
    
    const tables = await this.getTables();
    
    log.info(`Database: PostgreSQL`);
    log.info(`Total tables: ${tables.length}`);
    
    if (tables.length > 0) {
      console.log('\nTables:');
      for (const table of tables) {
        try {
          // Quote table name to handle reserved keywords
          const countResult = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM "${table}"`));
          const count = (countResult.rows[0] as any)?.count || 0;
          console.log(`  • ${table}: ${count} rows`);
        } catch (error) {
          console.log(`  • ${table}: Error reading count`);
        }
      }
    }

    // Database connection info
    try {
      const dbResult = await db.execute(sql`SELECT current_database() as name`);
      const dbName = (dbResult.rows[0] as any)?.name;
      if (dbName) {
        log.info(`Database name: ${dbName}`);
      }
    } catch (error) {
      log.warning('Could not determine database name');
    }
  }

  // Run database migrations
  async runMigrations(): Promise<void> {
    log.title('RUN MIGRATIONS');
    
    log.step('Running drizzle-kit push...');
    log.info('This will generate and apply schema changes to the database');
    
    try {
      const child = spawn('pnpm', ['run', 'db:push'], {
        stdio: 'inherit',
        shell: true
      });

      await new Promise<void>((resolve, reject) => {
        child.on('close', (code) => {
          if (code === 0) {
            log.success('Schema pushed successfully!');
            resolve();
          } else {
            log.error(`Migration failed with exit code ${code}`);
            reject(new Error(`Process exited with code ${code}`));
          }
        });

        child.on('error', (error) => {
          log.error(`Failed to start migration: ${error.message}`);
          reject(error);
        });
      });
      
    } catch (error: any) {
      log.error(`Migration failed: ${error.message}`);
    }
  }

  // Backup database
  async backupDatabase(): Promise<void> {
    log.title('BACKUP DATABASE');
    
    log.step('PostgreSQL backup suggestions...');
    log.info('For PostgreSQL backup, use pg_dump:');
    log.info('pg_dump $DATABASE_URL > backup.sql');
    log.info('');
    log.info('Or for compressed backup:');
    log.info('pg_dump $DATABASE_URL | gzip > backup.sql.gz');
    log.info('');
    log.info('To restore:');
    log.info('psql $DATABASE_URL < backup.sql');
    
    log.success('Backup commands provided - run manually for safety');
  }

}