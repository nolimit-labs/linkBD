#!/usr/bin/env node

import { MenuNavigator, MenuItem, confirm, waitForKey } from './utils/menu.js';
import { log } from './utils/logger.js';
import { DatabaseAdmin } from './modules/database.js';
import { StripeAdmin } from './modules/stripe.js';

// Main menu items
const mainMenuItems: MenuItem[] = [
  { label: 'Database Management', icon: '🗄️', action: 'database', description: 'Manage database tables and data' },
  { label: 'Stripe Management', icon: '💳', action: 'stripe', description: 'Manage Stripe customers and subscriptions' },
  { label: 'Exit', icon: '🚪', action: 'exit', description: 'Close the admin tool' },
];

// Database submenu items
const databaseMenuItems: MenuItem[] = [
  { label: 'Show database info', icon: '📊', action: 'info', description: 'View tables, row counts, and connection details' },
  { label: 'Delete all data', icon: '🧹', action: 'deleteData', description: 'Clear all rows from tables (keep structure)' },
  { label: 'Drop all tables', icon: '💥', action: 'dropTables', description: 'Remove all table structures and data' },
  { label: 'Run migrations', icon: '🔄', action: 'migrate', description: 'Push schema changes with drizzle-kit' },
  { label: 'Backup database', icon: '💾', action: 'backup', description: 'Get PostgreSQL backup commands' },
  { label: 'Back to main menu', icon: '⬅️', action: 'back', description: 'Return to main menu' },
];

// Stripe submenu items
const stripeMenuItems: MenuItem[] = [
  { label: 'List customers', icon: '👥', action: 'listCustomers', description: 'View Stripe customers' },
  { label: 'List subscriptions', icon: '📋', action: 'listSubscriptions', description: 'View Stripe subscriptions' },
  { label: 'Search customer', icon: '🔍', action: 'searchCustomer', description: 'Find customer by email' },
  { label: 'Delete customer by ID', icon: '🗑️', action: 'deleteCustomer', description: 'Delete a specific Stripe customer' },
  { label: 'Delete ALL customers', icon: '💥', action: 'deleteAllCustomers', description: 'Delete all Stripe customers (DANGER!)' },
  { label: 'Cancel subscription by ID', icon: '❌', action: 'cancelSubscription', description: 'Cancel a specific subscription' },
  { label: 'Cancel ALL subscriptions', icon: '🚫', action: 'cancelAllSubscriptions', description: 'Cancel all active subscriptions (DANGER!)' },
  { label: 'Sync subscriptions', icon: '🔄', action: 'syncSubscriptions', description: 'Sync Stripe data to database' },
  { label: 'Back to main menu', icon: '⬅️', action: 'back', description: 'Return to main menu' },
];

// Get user input
async function getUserInput(prompt: string): Promise<string> {
  console.log(`\n${prompt}`);
  process.stdout.write('> ');
  
  return new Promise((resolve) => {
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim());
    });
  });
}

// Database menu handler
async function handleDatabaseMenu(): Promise<boolean> {
  const admin = new DatabaseAdmin();
  const navigator = new MenuNavigator(databaseMenuItems, '🗄️  Database Management');
  
  const choice = await navigator.getSelection();
  
  switch (choice) {
    case 'info':
      await admin.showInfo();
      await waitForKey();
      break;
      
    case 'deleteData':
      if (await confirm('Delete all data from all tables?')) {
        await admin.deleteAllData();
      } else {
        log.info('Operation cancelled');
      }
      await waitForKey();
      break;
      
    case 'dropTables':
      if (await confirm('Drop all tables? This cannot be undone!')) {
        if (await confirm('Are you absolutely sure? This will delete everything!')) {
          await admin.dropAllTables();
        } else {
          log.info('Operation cancelled');
        }
      } else {
        log.info('Operation cancelled');
      }
      await waitForKey();
      break;
      
    case 'migrate':
      await admin.runMigrations();
      await waitForKey();
      break;
      
    case 'backup':
      await admin.backupDatabase();
      await waitForKey();
      break;
      
    case 'back':
      return false;
  }
  
  return true;
}

// Stripe menu handler
async function handleStripeMenu(): Promise<boolean> {
  const stripe = new StripeAdmin();
  const navigator = new MenuNavigator(stripeMenuItems, '💳  Stripe Management');
  
  const choice = await navigator.getSelection();
  
  switch (choice) {
    case 'listCustomers':
      process.stdin.setRawMode(false);
      const limitStr = await getUserInput('How many customers to show? (default: 10)');
      const limit = parseInt(limitStr) || 10;
      await stripe.listCustomers(limit);
      await waitForKey();
      break;
      
    case 'listSubscriptions':
      process.stdin.setRawMode(false);
      const subLimitStr = await getUserInput('How many subscriptions to show? (default: 10)');
      const subLimit = parseInt(subLimitStr) || 10;
      await stripe.listSubscriptions(subLimit);
      await waitForKey();
      break;
      
    case 'searchCustomer':
      process.stdin.setRawMode(false);
      const email = await getUserInput('Enter customer email to search:');
      if (email) {
        await stripe.searchCustomer(email);
      } else {
        log.warning('No email provided');
      }
      await waitForKey();
      break;
      
    case 'deleteCustomer':
      process.stdin.setRawMode(false);
      const customerId = await getUserInput('Enter Stripe customer ID to delete:');
      if (customerId) {
        if (await confirm(`Delete customer ${customerId}?`)) {
          await stripe.deleteCustomer(customerId);
        } else {
          log.info('Operation cancelled');
        }
      } else {
        log.warning('No customer ID provided');
      }
      await waitForKey();
      break;
      
    case 'deleteAllCustomers':
      if (await confirm('Delete ALL Stripe customers? This cannot be undone!')) {
        if (await confirm('Are you ABSOLUTELY SURE? This will delete ALL customers and their subscriptions!')) {
          await stripe.deleteAllCustomers();
        } else {
          log.info('Operation cancelled');
        }
      } else {
        log.info('Operation cancelled');
      }
      await waitForKey();
      break;
      
    case 'cancelSubscription':
      process.stdin.setRawMode(false);
      const subscriptionId = await getUserInput('Enter Stripe subscription ID to cancel:');
      if (subscriptionId) {
        if (await confirm(`Cancel subscription ${subscriptionId}?`)) {
          await stripe.cancelSubscription(subscriptionId);
        } else {
          log.info('Operation cancelled');
        }
      } else {
        log.warning('No subscription ID provided');
      }
      await waitForKey();
      break;
      
    case 'cancelAllSubscriptions':
      if (await confirm('Cancel ALL active Stripe subscriptions?')) {
        if (await confirm('Are you SURE? This will cancel ALL active subscriptions!')) {
          await stripe.cancelAllSubscriptions();
        } else {
          log.info('Operation cancelled');
        }
      } else {
        log.info('Operation cancelled');
      }
      await waitForKey();
      break;
      
    case 'syncSubscriptions':
      if (await confirm('Sync all Stripe subscriptions to database?')) {
        await stripe.syncSubscriptions();
      } else {
        log.info('Operation cancelled');
      }
      await waitForKey();
      break;
      
    case 'back':
      return false;
  }
  
  return true;
}

// Main CLI function
async function runCLI(): Promise<void> {
  const mainNavigator = new MenuNavigator(mainMenuItems, '🛠️  TodoApp Admin CLI');
  
  while (true) {
    try {
      const choice = await mainNavigator.getSelection();
      
      switch (choice) {
        case 'database':
          let inDatabaseMenu = true;
          while (inDatabaseMenu) {
            inDatabaseMenu = await handleDatabaseMenu();
          }
          break;
          
        case 'stripe':
          let inStripeMenu = true;
          while (inStripeMenu) {
            try {
              inStripeMenu = await handleStripeMenu();
            } catch (error: any) {
              if (error.message.includes('STRIPE_SECRET_KEY')) {
                log.error('Stripe module requires STRIPE_SECRET_KEY in environment variables');
                await waitForKey();
                inStripeMenu = false;
              } else {
                throw error;
              }
            }
          }
          break;
          
        case 'exit':
          console.clear();
          log.info('Thanks for using TodoApp Admin CLI! 👋');
          process.exit(0);
          
        default:
          log.error('Invalid choice.');
          await waitForKey();
          break;
      }
      
    } catch (error: any) {
      log.error(`CLI Error: ${error.message}`);
      await waitForKey();
    }
  }
}

// Handle CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runCLI()
    .catch((error) => {
      console.clear();
      log.error(`CLI failed: ${error.message}`);
      process.exit(1);
    });
}

export { runCLI };