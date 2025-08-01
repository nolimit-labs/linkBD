import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

/**
 * Advance test clock for a customer's subscription by specified days
 * @param customerId - The customer ID whose subscription to advance
 * @param days - Number of days to advance
 */
export async function advanceTestClock(customerId: string, days: number): Promise<void> {
  try {
    // Get customer's active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1
    });
    
    if (subscriptions.data.length === 0) {
      throw new Error('No active subscription found for customer');
    }
    
    const subscription = subscriptions.data[0];
    const subscriptionId = subscription.id;
    
    console.log(`✅ Found subscription: ${subscriptionId}`);
    
    // Create a test clock starting from current time
    const currentTime = Math.floor(Date.now() / 1000);
    const testClock = await stripe.testHelpers.testClocks.create({
      frozen_time: currentTime,
      name: `E2E Test - ${customerId}`
    });
    
    console.log(`✅ Created test clock: ${testClock.id}`);
    
    // Attach the subscription to the test clock
    await stripe.subscriptions.update(subscriptionId, {
      test_clock: testClock.id
    } as any);
    
    console.log(`✅ Attached subscription to test clock`);
    
    // Calculate future time
    const futureTime = currentTime + (days * 24 * 60 * 60);
    
    // Advance the clock
    await stripe.testHelpers.testClocks.advance(testClock.id, {
      frozen_time: futureTime
    });
    
    console.log(`✅ Advanced test clock by ${days} days for subscription ${subscriptionId}`);
    
    // Wait for advancement to complete
    let status = 'advancing';
    while (status === 'advancing') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const updatedClock = await stripe.testHelpers.testClocks.retrieve(testClock.id);
      status = updatedClock.status;
    }
    
    console.log('✅ Test clock advancement completed');
  } catch (error) {
    console.error('❌ Failed to advance test clock:', error);
    throw error;
  }
}