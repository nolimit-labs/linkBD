import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class StripeBillingPortalPage extends BasePage {
  // Locator constants for Stripe Billing Portal
  private static readonly LOCATORS = {
    // Page verification
    BILLING_PORTAL_HEADER: 'h1',
    SUBSCRIPTION_SECTION: '[data-test="subscription-section"]',

    // Subscription management elements
    CANCEL_SUBSCRIPTION_BUTTON: '[data-test="cancel-subscription"]',
    CONFIRM_CANCELLATION_BUTTON: '[data-test="confirm"]',
    CANCELLATION_CONFIRMATION: '[data-test="cancellation-success"]',

    // Cancellation dialog
    CANCELLATION_DIALOG: '[role="dialog"]',
    CANCELLATION_REASON_NO_LONGER_NEED: 'input[value="no_longer_need"]',
    CANCELLATION_REASON_TEXT: 'label:has-text("I no longer need it")',
    CANCELLATION_CONFIRM_BUTTON: '[data-testid="confirm"]',

    // Navigation
    RETURN_TO_BUSINESS_LINK: '[data-testid="return-to-business-link"]',
    RETURN_TO_APP_BUTTON: 'a:has-text("Return")',
    BACK_BUTTON: 'button:has-text("Back")',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Verify we're on the Stripe billing portal page
   */
  async expectToBeOnBillingPortal(): Promise<void> {
    // Wait for billing portal to load
    await this.page.waitForURL(/billing\.stripe\.com/, { timeout: 15000 });

    console.log('✅ Successfully navigated to Stripe billing portal');

    // Wait for the page to load
    await this.waitForLoadState();
  }

  /**
   * Cancel the current subscription
   */
  async cancelSubscription(): Promise<void> {
    await this.waitForLoadState();

    // Look for the cancel subscription button/link
    const cancelButton = this.page.locator(
      StripeBillingPortalPage.LOCATORS.CANCEL_SUBSCRIPTION_BUTTON
    );

    // Wait for the cancel button to be available
    await cancelButton.waitFor({ state: 'visible', timeout: 10000 });
    await cancelButton.click();

    console.log('✅ Clicked cancel subscription button');

    // Look for confirmation button (Stripe usually has a confirmation step)
    const confirmButton = this.page.locator(
      StripeBillingPortalPage.LOCATORS.CONFIRM_CANCELLATION_BUTTON
    );
    await confirmButton.waitFor({ state: 'visible', timeout: 5000 });
    await confirmButton.click();
    console.log('✅ Clicked confirm cancellation button');

    // Handle cancellation reason dialog if it appears
    const cancellationDialog = this.page.locator(
      StripeBillingPortalPage.LOCATORS.CANCELLATION_DIALOG
    );
    if (await cancellationDialog.isVisible({ timeout: 5000 })) {
      console.log('✅ Cancellation dialog appeared');

      // Select "I no longer need it" reason
      const reasonRadio = this.page.locator(
        StripeBillingPortalPage.LOCATORS.CANCELLATION_REASON_NO_LONGER_NEED
      );
      const reasonLabel = this.page.locator(
        StripeBillingPortalPage.LOCATORS.CANCELLATION_REASON_TEXT
      );

      // Try clicking the radio button or its label
      if (await reasonRadio.isVisible({ timeout: 2000 })) {
        await reasonRadio.click();
      } else if (await reasonLabel.isVisible({ timeout: 2000 })) {
        await reasonLabel.click();
      }

      console.log('✅ Selected "I no longer need it" as cancellation reason');

      // Click the confirm button in the dialog
      const dialogConfirmButton = this.page.locator(
        StripeBillingPortalPage.LOCATORS.CANCELLATION_CONFIRM_BUTTON
      );
      await dialogConfirmButton.waitFor({ state: 'visible', timeout: 5000 });
      await dialogConfirmButton.click();

      console.log('✅ Confirmed cancellation reason');
    }

    console.log('✅ Subscription cancellation confirmed');
  }

  /**
   * Return to the main application from billing portal
   */
  async returnToApp(): Promise<void> {
    // Look for return to business link first (appears after cancellation)
    const returnToBusinessLink = this.page.locator(
      StripeBillingPortalPage.LOCATORS.RETURN_TO_BUSINESS_LINK
    );
    const returnButton = this.page.locator(
      StripeBillingPortalPage.LOCATORS.RETURN_TO_APP_BUTTON
    );
    const backButton = this.page.locator(
      StripeBillingPortalPage.LOCATORS.BACK_BUTTON
    );

    if (await returnToBusinessLink.isVisible({ timeout: 5000 })) {
      await returnToBusinessLink.click();
      console.log('✅ Clicked return to business link');
    } else if (await returnButton.isVisible({ timeout: 5000 })) {
      await returnButton.click();
      console.log('✅ Clicked return to app button');
    } else if (await backButton.isVisible({ timeout: 5000 })) {
      await backButton.click();
      console.log('✅ Clicked back button');
    } else {
      // If no specific return button, navigate back to the app manually
      const domain = process.env.BASE_URL || 'http://localhost:3005';
      await this.page.goto(`${domain}/settings`);
      console.log('✅ Manually navigated back to settings');
    }

    // Wait for the app to load
    await this.page.waitForURL(/localhost|\.com/);
    await this.waitForLoadState();
  }

  /**
   * Complete subscription cancellation flow and return to app
   */
  async completeCancellationFlow(): Promise<void> {
    await this.expectToBeOnBillingPortal();
    await this.cancelSubscription();
    await this.returnToApp();

    console.log('✅ Completed subscription cancellation flow');
  }
}
