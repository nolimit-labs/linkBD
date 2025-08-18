import { readdir } from 'fs/promises';
import { join } from 'path';
import { spawn } from 'child_process';
import { log } from '../utils/logger.js';

export class CustomMigrationsAdmin {
  private readonly migrationsDir = join(process.cwd(), 'src/db/admin/migrations');

  // List all migration files
  async listMigrations(): Promise<string[]> {
    try {
      const files = await readdir(this.migrationsDir);
      return files
        .filter(file => file.endsWith('.ts'))
        .sort(); // Natural alphabetical sort works with 001, 002, etc.
    } catch (error) {
      log.warning('Migrations directory not found or empty');
      return [];
    }
  }

  // Show available migrations
  async showMigrations(): Promise<void> {
    log.title('CUSTOM DATA MIGRATIONS');
    
    const migrations = await this.listMigrations();
    
    if (migrations.length === 0) {
      log.warning('No custom migration files found');
      log.info('Create migration files in: src/db/admin/migrations/');
      log.info('Naming format: 001_feature-name.ts');
      return;
    }

    log.info(`Found ${migrations.length} migration files:\n`);
    
    migrations.forEach((file, index) => {
      const number = file.split('_')[0];
      const name = file.replace(/^\d+_/, '').replace('.ts', '');
      console.log(`  ${number}. ${name}`);
    });

    console.log('\nUsage:');
    console.log('  tsx src/db/admin/migrations/{filename}           # Run migration');
    console.log('  tsx src/db/admin/migrations/{filename} --rollback # Rollback migration');
    console.log('  tsx src/db/admin/migrations/{filename} --help     # Show help');
  }

  // Run a specific migration
  async runMigration(filename: string): Promise<void> {
    log.title(`RUN CUSTOM MIGRATION: ${filename}`);
    
    const migrationPath = join(this.migrationsDir, filename);
    
    try {
      log.step(`Running migration: ${filename}`);
      log.info('This will execute the custom data migration script');
      
      const child = spawn('npx', ['tsx', migrationPath], {
        stdio: 'inherit',
        shell: true
      });

      await new Promise<void>((resolve, reject) => {
        child.on('close', (code) => {
          if (code === 0) {
            log.success('Migration completed successfully!');
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

  // Rollback a specific migration
  async rollbackMigration(filename: string): Promise<void> {
    log.title(`ROLLBACK CUSTOM MIGRATION: ${filename}`);
    
    const migrationPath = join(this.migrationsDir, filename);
    
    try {
      log.step(`Rolling back migration: ${filename}`);
      log.warning('This will execute the rollback function of the migration script');
      
      const child = spawn('npx', ['tsx', migrationPath, '--rollback'], {
        stdio: 'inherit',
        shell: true
      });

      await new Promise<void>((resolve, reject) => {
        child.on('close', (code) => {
          if (code === 0) {
            log.success('Rollback completed successfully!');
            resolve();
          } else {
            log.error(`Rollback failed with exit code ${code}`);
            reject(new Error(`Process exited with code ${code}`));
          }
        });

        child.on('error', (error) => {
          log.error(`Failed to start rollback: ${error.message}`);
          reject(error);
        });
      });
      
    } catch (error: any) {
      log.error(`Rollback failed: ${error.message}`);
    }
  }

  // Show help for migrations
  async showHelp(): Promise<void> {
    log.title('CUSTOM MIGRATIONS HELP');
    
    console.log('Custom data migrations are separate from Drizzle schema migrations.');
    console.log('They handle data transformations, cleanups, and complex migrations.\n');
    
    console.log('Migration File Structure:');
    console.log('  src/db/admin/migrations/');
    console.log('  ├── 001_organization-posts-phase1.ts');
    console.log('  ├── 002_user-profile-cleanup.ts');
    console.log('  └── 003_storage-migration.ts\n');
    
    console.log('Naming Convention:');
    console.log('  {sequence}_{feature-name}{phase}.ts');
    console.log('  - Sequence: 3-digit zero-padded (001, 002, 003)');
    console.log('  - Feature: kebab-case description');
    console.log('  - Phase: optional for multi-phase migrations\n');
    
    console.log('Each migration file should include:');
    console.log('  ✓ Migration function');
    console.log('  ✓ Rollback function');
    console.log('  ✓ Command line argument handling');
    console.log('  ✓ Transaction safety');
    console.log('  ✓ Proper error handling');
    
    log.success('See backend best practices rule file for detailed standards');
  }
}