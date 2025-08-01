import Stripe from 'stripe';
import { log } from '../utils/logger.js';
import { db } from '../../../index.js';
import { eq } from 'drizzle-orm';
import { user, subscription } from '../../../schema.js';
import dotenv from 'dotenv';

dotenv.config();

export class StripeAdmin {
  private stripe: Stripe;

  constructor() {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY not found in environment variables');
    }
    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2025-03-31.basil',
    });
  }

  // List all Stripe customers
  async listCustomers(limit: number = 10): Promise<void> {
    log.title('STRIPE CUSTOMERS');
    
    try {
      log.step('Fetching customers from Stripe...');
      const customers = await this.stripe.customers.list({ limit });
      
      if (customers.data.length === 0) {
        log.warning('No customers found in Stripe');
        return;
      }

      console.log(`\nFound ${customers.data.length} customers (showing up to ${limit}):\n`);
      
      for (const customer of customers.data) {
        console.log(`ID: ${customer.id}`);
        console.log(`Email: ${customer.email || 'No email'}`);
        console.log(`Name: ${customer.name || 'No name'}`);
        console.log(`Created: ${new Date(customer.created * 1000).toLocaleString()}`);
        
        // Check if customer exists in our database
        if (customer.metadata?.userId) {
          const dbUser = await db
            .select()
            .from(user)
            .where(eq(user.id, customer.metadata.userId))
            .limit(1);
          
          if (dbUser.length > 0) {
            console.log(`DB User: ${dbUser[0].name} (${dbUser[0].email})`);
          }
        }
        
        console.log('---');
      }
      
      if (customers.has_more) {
        log.info(`More customers available. Total: ${customers.data.length}+`);
      }
      
    } catch (error: any) {
      log.error(`Failed to fetch customers: ${error.message}`);
    }
  }

  // List all Stripe subscriptions
  async listSubscriptions(limit: number = 10): Promise<void> {
    log.title('STRIPE SUBSCRIPTIONS');
    
    try {
      log.step('Fetching subscriptions from Stripe...');
      const subscriptions = await this.stripe.subscriptions.list({ 
        limit,
        expand: ['data.customer']
      });
      
      if (subscriptions.data.length === 0) {
        log.warning('No subscriptions found in Stripe');
        return;
      }

      console.log(`\nFound ${subscriptions.data.length} subscriptions (showing up to ${limit}):\n`);
      
      for (const sub of subscriptions.data) {
        const customer = sub.customer as Stripe.Customer;
        const priceId = sub.items.data[0]?.price?.id || 'Unknown';
        const productId = typeof sub.items.data[0]?.price?.product === 'string' 
          ? sub.items.data[0]?.price?.product 
          : sub.items.data[0]?.price?.product?.id || 'Unknown';
        
        console.log(`ID: ${sub.id}`);
        console.log(`Status: ${sub.status}`);
        console.log(`Customer: ${customer.email || customer.id}`);
        console.log(`Price ID: ${priceId}`);
        console.log(`Product ID: ${productId}`);
        console.log(`Amount: $${(sub.items.data[0]?.price?.unit_amount || 0) / 100}/${sub.items.data[0]?.price?.recurring?.interval || 'unknown'}`);
        console.log(`Created: ${new Date(sub.created * 1000).toLocaleString()}`);
        
        if (sub.current_period_end) {
          console.log(`Next billing: ${new Date(sub.current_period_end * 1000).toLocaleString()}`);
        }
        
        // Check if subscription exists in our database
        const dbSub = await db
          .select()
          .from(subscription)
          .where(eq(subscription.stripeSubscriptionId, sub.id))
          .limit(1);
        
        if (dbSub.length > 0) {
          console.log(`DB Status: Synced ✓`);
        } else {
          console.log(`DB Status: Not synced ⚠️`);
        }
        
        console.log('---');
      }
      
      if (subscriptions.has_more) {
        log.info(`More subscriptions available. Total: ${subscriptions.data.length}+`);
      }
      
    } catch (error: any) {
      log.error(`Failed to fetch subscriptions: ${error.message}`);
    }
  }

  // Delete a Stripe customer
  async deleteCustomer(customerId: string): Promise<void> {
    log.title('DELETE STRIPE CUSTOMER');
    
    try {
      log.step(`Fetching customer ${customerId}...`);
      const customer = await this.stripe.customers.retrieve(customerId);
      
      if (customer.deleted) {
        log.warning('Customer already deleted');
        return;
      }

      console.log(`\nCustomer to delete:`);
      console.log(`ID: ${customer.id}`);
      console.log(`Email: ${(customer as Stripe.Customer).email || 'No email'}`);
      
      // Cancel any active subscriptions first
      log.step('Checking for active subscriptions...');
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
        status: 'active'
      });
      
      if (subscriptions.data.length > 0) {
        log.warning(`Found ${subscriptions.data.length} active subscriptions`);
        for (const sub of subscriptions.data) {
          log.step(`Canceling subscription ${sub.id}...`);
          await this.stripe.subscriptions.cancel(sub.id);
          log.success(`Canceled subscription ${sub.id}`);
        }
      }
      
      log.step(`Deleting customer ${customerId}...`);
      await this.stripe.customers.del(customerId);
      log.success(`Customer ${customerId} deleted successfully`);
      
    } catch (error: any) {
      log.error(`Failed to delete customer: ${error.message}`);
    }
  }

  // Cancel a Stripe subscription
  async cancelSubscription(subscriptionId: string): Promise<void> {
    log.title('CANCEL STRIPE SUBSCRIPTION');
    
    try {
      log.step(`Fetching subscription ${subscriptionId}...`);
      const sub = await this.stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['customer']
      });
      
      if (sub.status === 'canceled') {
        log.warning('Subscription already canceled');
        return;
      }

      const customer = sub.customer as Stripe.Customer;
      console.log(`\nSubscription to cancel:`);
      console.log(`ID: ${sub.id}`);
      console.log(`Status: ${sub.status}`);
      console.log(`Customer: ${customer.email || customer.id}`);
      
      log.step(`Canceling subscription ${subscriptionId}...`);
      const canceled = await this.stripe.subscriptions.cancel(subscriptionId);
      
      log.success(`Subscription ${subscriptionId} canceled successfully`);
      console.log(`New status: ${canceled.status}`);
      
      // Update database
      log.step('Updating database...');
      await db
        .update(subscription)
        .set({ status: 'canceled' })
        .where(eq(subscription.stripeSubscriptionId, subscriptionId));
      
      log.success('Database updated');
      
    } catch (error: any) {
      log.error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  // Search for a customer by email
  async searchCustomer(email: string): Promise<void> {
    log.title('SEARCH STRIPE CUSTOMER');
    
    try {
      log.step(`Searching for customer with email: ${email}...`);
      const customers = await this.stripe.customers.search({
        query: `email:"${email}"`,
        limit: 10
      });
      
      if (customers.data.length === 0) {
        log.warning(`No customer found with email: ${email}`);
        return;
      }

      console.log(`\nFound ${customers.data.length} customer(s):\n`);
      
      for (const customer of customers.data) {
        console.log(`ID: ${customer.id}`);
        console.log(`Email: ${customer.email}`);
        console.log(`Name: ${customer.name || 'No name'}`);
        console.log(`Created: ${new Date(customer.created * 1000).toLocaleString()}`);
        
        // List their subscriptions
        const subs = await this.stripe.subscriptions.list({
          customer: customer.id,
          limit: 5
        });
        
        if (subs.data.length > 0) {
          console.log(`Subscriptions:`);
          for (const sub of subs.data) {
            console.log(`  - ${sub.id} (${sub.status})`);
          }
        }
        
        console.log('---');
      }
      
    } catch (error: any) {
      log.error(`Failed to search customer: ${error.message}`);
    }
  }

  // Delete all Stripe customers
  async deleteAllCustomers(): Promise<void> {
    log.title('DELETE ALL STRIPE CUSTOMERS');
    
    try {
      log.warning('This will delete ALL customers and their subscriptions!');
      
      let deleted = 0;
      let errors = 0;
      let hasMore = true;
      
      while (hasMore) {
        log.step('Fetching batch of customers...');
        const customers = await this.stripe.customers.list({ limit: 100 });
        
        if (customers.data.length === 0) {
          hasMore = false;
          break;
        }
        
        log.info(`Processing ${customers.data.length} customers...`);
        
        for (const customer of customers.data) {
          try {
            // Cancel active subscriptions first
            const subscriptions = await this.stripe.subscriptions.list({
              customer: customer.id,
              status: 'active',
              limit: 10
            });
            
            for (const sub of subscriptions.data) {
              log.step(`Canceling subscription ${sub.id}...`);
              await this.stripe.subscriptions.cancel(sub.id);
            }
            
            log.step(`Deleting customer ${customer.id} (${customer.email || 'no email'})...`);
            await this.stripe.customers.del(customer.id);
            deleted++;
          } catch (error: any) {
            errors++;
            log.error(`Failed to delete customer ${customer.id}: ${error.message}`);
          }
        }
        
        hasMore = customers.has_more;
      }
      
      log.success(`Deleted ${deleted} customers, ${errors} errors`);
      
    } catch (error: any) {
      log.error(`Failed to delete all customers: ${error.message}`);
    }
  }

  // Cancel all Stripe subscriptions
  async cancelAllSubscriptions(): Promise<void> {
    log.title('CANCEL ALL STRIPE SUBSCRIPTIONS');
    
    try {
      log.warning('This will cancel ALL active subscriptions!');
      
      let canceled = 0;
      let errors = 0;
      let hasMore = true;
      
      while (hasMore) {
        log.step('Fetching batch of subscriptions...');
        const subscriptions = await this.stripe.subscriptions.list({ 
          limit: 100,
          status: 'active'
        });
        
        if (subscriptions.data.length === 0) {
          hasMore = false;
          break;
        }
        
        log.info(`Processing ${subscriptions.data.length} subscriptions...`);
        
        for (const sub of subscriptions.data) {
          try {
            log.step(`Canceling subscription ${sub.id}...`);
            await this.stripe.subscriptions.cancel(sub.id);
            
            // Update database
            await db
              .update(subscription)
              .set({ status: 'canceled' })
              .where(eq(subscription.stripeSubscriptionId, sub.id));
              
            canceled++;
          } catch (error: any) {
            errors++;
            log.error(`Failed to cancel subscription ${sub.id}: ${error.message}`);
          }
        }
        
        hasMore = subscriptions.has_more;
      }
      
      log.success(`Canceled ${canceled} subscriptions, ${errors} errors`);
      
    } catch (error: any) {
      log.error(`Failed to cancel all subscriptions: ${error.message}`);
    }
  }

  // Sync subscriptions from Stripe to database
  async syncSubscriptions(): Promise<void> {
    log.title('SYNC STRIPE SUBSCRIPTIONS');
    
    try {
      log.step('Fetching all subscriptions from Stripe...');
      const subscriptions = await this.stripe.subscriptions.list({
        limit: 100,
        expand: ['data.customer']
      });
      
      log.info(`Found ${subscriptions.data.length} subscriptions to sync`);
      
      let synced = 0;
      let errors = 0;
      
      for (const stripeSub of subscriptions.data) {
        try {
          const customer = stripeSub.customer as Stripe.Customer;
          
          // Find user by email or stripe customer ID
          if (customer.email) {
            const dbUser = await db
              .select()
              .from(user)
              .where(eq(user.email, customer.email))
              .limit(1);
            
            if (dbUser.length > 0) {
              log.step(`Syncing subscription for ${customer.email}...`);
              
              // Check if subscription exists
              const existingSub = await db
                .select()
                .from(subscription)
                .where(eq(subscription.stripeSubscriptionId, stripeSub.id))
                .limit(1);
              
              if (existingSub.length === 0) {
                // Create new subscription record
                await db.insert(subscription).values({
                  id: crypto.randomUUID(),
                  referenceId: dbUser[0].id,
                  stripeSubscriptionId: stripeSub.id,
                  stripeCustomerId: customer.id,
                  status: stripeSub.status as any,
                  plan: stripeSub.items.data[0]?.price?.id || 'unknown',
                  periodStart: 'current_period_start' in stripeSub && stripeSub.current_period_start ? new Date(stripeSub.current_period_start * 1000) : null,
                  periodEnd: 'current_period_end' in stripeSub && stripeSub.current_period_end ? new Date(stripeSub.current_period_end * 1000) : null,
                  cancelAtPeriodEnd: stripeSub.cancel_at_period_end || false,
                });
                synced++;
                log.success(`Created subscription for ${customer.email}`);
              } else {
                // Update existing subscription
                await db
                  .update(subscription)
                  .set({
                    status: stripeSub.status as any,
                    periodStart: 'current_period_start' in stripeSub && stripeSub.current_period_start ? new Date(stripeSub.current_period_start * 1000) : null,
                    periodEnd: 'current_period_end' in stripeSub && stripeSub.current_period_end ? new Date(stripeSub.current_period_end * 1000) : null,
                    cancelAtPeriodEnd: stripeSub.cancel_at_period_end || false,
                  })
                  .where(eq(subscription.stripeSubscriptionId, stripeSub.id));
                synced++;
                log.success(`Updated subscription for ${customer.email}`);
              }
            } else {
              log.warning(`No user found for ${customer.email}`);
            }
          }
        } catch (error: any) {
          errors++;
          log.error(`Failed to sync subscription ${stripeSub.id}: ${error.message}`);
        }
      }
      
      log.success(`Sync complete: ${synced} synced, ${errors} errors`);
      
    } catch (error: any) {
      log.error(`Failed to sync subscriptions: ${error.message}`);
    }
  }
}