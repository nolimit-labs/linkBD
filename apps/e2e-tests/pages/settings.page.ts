import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class SettingsPage extends BasePage {
  // Page URLs
  static readonly SETTINGS_URL = '/settings';
  static readonly DASHBOARD_URL = '/dashboard';

  // Locators object - all locator selectors defined at the top
  private readonly Locators = {
    SETTINGS_HEADING: { role: 'heading', options: { name: 'Settings' } },
    DEVELOPER_TAB: { role: 'tab', options: { name: 'Developer' } },
    ORGANIZATION_TAB: { role: 'tab', options: { name: 'Organization' } },
    CURRENT_USER_CARD: '[data-testid="current-user-card"]',
    CURRENT_ORG_CARD: '[data-testid="current-organization-card"]',
    SUBSCRIPTION_CARD: '[data-testid="organization-subscription-card"]',
    USER_NAME: '[data-testid="user-name"]',
    USER_EMAIL: '[data-testid="user-email"]',
    USER_CONVEX_ID: '[data-testid="user-convex-id"]',
    ORG_NAME: '[data-testid="org-name"]',
    ORG_SLUG: '[data-testid="org-slug"]',
    ORG_CONVEX_ID: '[data-testid="org-convex-id"]',
    STRIPE_CUSTOMER_ID: '[data-testid="org-stripe-customer-id"]',
    UPGRADE_BUTTON: '[data-testid="sidebar-upgrade-button"]',
    PRO_PLAN_BUTTON: '[data-testid="upgrade-to-premium-button"]',
    MANAGE_BILLING_BUTTON: 'button:has-text("Manage Billing")',
    BILLING_PORTAL_LINK: '[data-testid="billing-portal-link"]',
    SUBSCRIPTION_PLAN_NAME: '[data-testid="subscription-plan-name"]',
    SUBSCRIPTION_PRICE: '[data-testid="subscription-price"]',
    SUBSCRIPTION_STRIPE_PRICE_ID: '[data-testid="subscription-stripe-price-id"]',
    SUBSCRIPTION_STRIPE_PRODUCT_ID: '[data-testid="subscription-stripe-product-id"]',
    SUBSCRIPTION_DATE: '[data-testid="subscription-date"]',
    SUBSCRIPTION_STATUS: '[data-testid="subscription-status"]',
    SUBSCRIPTION_PLAN_ID: '[data-testid="subscription-plan-id"]',
    NO_SUBSCRIPTION: '[data-testid="no-subscription"]',
    USER_PERMISSIONS_CARD: '[data-testid="current-user-permissions-card"]',
    PERMISSIONS_COUNT: '[data-testid="permissions-count"]',
    NO_PERMISSIONS: '[data-testid="no-permissions"]',
  };

  // Page elements - public readonly properties for direct access
  readonly settingsHeading: Locator;
  readonly developerTab: Locator;
  readonly organizationTab: Locator;
  readonly currentUserCard: Locator;
  readonly currentOrgCard: Locator;
  readonly subscriptionCard: Locator;
  readonly userName: Locator;
  readonly userEmail: Locator;
  readonly userConvexId: Locator;
  readonly orgName: Locator;
  readonly orgSlug: Locator;
  readonly orgConvexId: Locator;
  readonly stripeCustomerId: Locator;
  readonly upgradeButton: Locator;
  readonly proPlanButton: Locator;
  readonly manageBillingButton: Locator;
  readonly billingPortalLink: Locator;
  readonly subscriptionPlanName: Locator;
  readonly subscriptionPrice: Locator;
  readonly subscriptionStripePriceId: Locator;
  readonly subscriptionStripeProductId: Locator;
  readonly subscriptionDate: Locator;
  readonly subscriptionStatus: Locator;
  readonly subscriptionPlanId: Locator;
  readonly noSubscription: Locator;
  readonly userPermissionsCard: Locator;
  readonly permissionsCount: Locator;
  readonly noPermissions: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize all elements using Locators object
    this.settingsHeading = this.page.getByRole(this.Locators.SETTINGS_HEADING.role as any, this.Locators.SETTINGS_HEADING.options);
    this.developerTab = this.page.getByRole(this.Locators.DEVELOPER_TAB.role as any, this.Locators.DEVELOPER_TAB.options);
    this.organizationTab = this.page.getByRole(this.Locators.ORGANIZATION_TAB.role as any, this.Locators.ORGANIZATION_TAB.options);
    this.currentUserCard = this.page.locator(this.Locators.CURRENT_USER_CARD);
    this.currentOrgCard = this.page.locator(this.Locators.CURRENT_ORG_CARD);
    this.subscriptionCard = this.page.locator(this.Locators.SUBSCRIPTION_CARD);
    this.userName = this.page.locator(this.Locators.USER_NAME);
    this.userEmail = this.page.locator(this.Locators.USER_EMAIL);
    this.userConvexId = this.page.locator(this.Locators.USER_CONVEX_ID);
    this.orgName = this.page.locator(this.Locators.ORG_NAME);
    this.orgSlug = this.page.locator(this.Locators.ORG_SLUG);
    this.orgConvexId = this.page.locator(this.Locators.ORG_CONVEX_ID);
    this.stripeCustomerId = this.page.locator(this.Locators.STRIPE_CUSTOMER_ID);
    this.upgradeButton = this.page.locator(this.Locators.UPGRADE_BUTTON);
    this.proPlanButton = this.page.locator(this.Locators.PRO_PLAN_BUTTON);
    this.manageBillingButton = this.page.locator(this.Locators.MANAGE_BILLING_BUTTON);
    this.billingPortalLink = this.page.locator(this.Locators.BILLING_PORTAL_LINK);
    this.subscriptionPlanName = this.page.locator(this.Locators.SUBSCRIPTION_PLAN_NAME);
    this.subscriptionPrice = this.page.locator(this.Locators.SUBSCRIPTION_PRICE);
    this.subscriptionStripePriceId = this.page.locator(this.Locators.SUBSCRIPTION_STRIPE_PRICE_ID);
    this.subscriptionStripeProductId = this.page.locator(this.Locators.SUBSCRIPTION_STRIPE_PRODUCT_ID);
    this.subscriptionDate = this.page.locator(this.Locators.SUBSCRIPTION_DATE);
    this.subscriptionStatus = this.page.locator(this.Locators.SUBSCRIPTION_STATUS);
    this.subscriptionPlanId = this.page.locator(this.Locators.SUBSCRIPTION_PLAN_ID);
    this.noSubscription = this.page.locator(this.Locators.NO_SUBSCRIPTION);
    this.userPermissionsCard = this.page.locator(this.Locators.USER_PERMISSIONS_CARD);
    this.permissionsCount = this.page.locator(this.Locators.PERMISSIONS_COUNT);
    this.noPermissions = this.page.locator(this.Locators.NO_PERMISSIONS);
  }

  /**
   * Navigate to settings page
   */
  async goToSettings(): Promise<void> {
    await this.page.goto(SettingsPage.SETTINGS_URL);
    await this.waitForLoadState();
  }

  /**
   * Navigate to dashboard page
   */
  async goToDashboard(): Promise<void> {
    await this.page.goto(SettingsPage.DASHBOARD_URL);
    await this.waitForLoadState();
  }

  /**
   * Navigate to settings and verify page loaded
   */
  async navigateToSettings(): Promise<void> {
    await this.goToSettings();
    await expect(this.page).toHaveURL(/\/settings/);
    await expect(this.settingsHeading).toBeVisible();
  }

  /**
   * Click developer tab if available
   * @returns true if developer tab was clicked, false if not available
   */
  async clickDeveloperTab(): Promise<boolean> {
    const developerTabVisible = await this.developerTab.isVisible({ timeout: 2000 });
    if (developerTabVisible) {
      await this.developerTab.click();
    } else if (await this.page.locator('button:has-text("Developer")').isVisible({ timeout: 2000 })) {
      await this.page.locator('button:has-text("Developer")').click();
    } else {
      return false;
    }
    await this.page.waitForSelector('text=Developer Information', { timeout: 10000 });
    return true;
  }

  /**
   * Click organization tab
   */
  async clickOrganizationTab(): Promise<void> {
    if (await this.organizationTab.isVisible({ timeout: 2000 })) {
      await this.organizationTab.click();
    } else if (await this.page.locator('button:has-text("Organization")').isVisible({ timeout: 2000 })) {
      await this.page.locator('button:has-text("Organization")').click();
    }
    await this.page.waitForSelector('text=Organization', { timeout: 10000 });
  }

  /**
   * Verify current user card data and return user Convex ID
   */
  async verifyCurrentUserCard(expectedData?: { name?: string; email?: string }): Promise<string> {
    await expect(this.currentUserCard).toBeVisible();
    
    // Get and verify user Convex ID exists and matches pattern
    const userConvexId = await this.userConvexId.textContent();
    expect(userConvexId).toBeTruthy();
    expect(userConvexId).toMatch(/^[a-z0-9]+$/); // Convex IDs are alphanumeric
    
    // Verify optional expected data if provided
    if (expectedData?.name) {
      await expect(this.userName).toHaveText(expectedData.name);
    }
    if (expectedData?.email) {
      await expect(this.userEmail).toHaveText(expectedData.email);
    }

    console.log(`✅ User Convex ID: ${userConvexId}`);
    
    return userConvexId || '';
  }

  /**
   * Verify current organization card data and return org Convex ID
   */
  async verifyCurrentOrganizationCard(expectedData?: { name?: string; slug?: string }): Promise<string> {
    await expect(this.currentOrgCard).toBeVisible();
    
    // Get and verify organization Convex ID exists and matches pattern
    const orgConvexId = await this.orgConvexId.textContent();
    expect(orgConvexId).toBeTruthy();
    expect(orgConvexId).toMatch(/^[a-z0-9]+$/); // Convex IDs are alphanumeric
    
    // Verify optional expected data if provided
    if (expectedData?.name) {
      await expect(this.orgName).toHaveText(expectedData.name);
    }
    if (expectedData?.slug) {
      await expect(this.orgSlug).toHaveText(expectedData.slug);
    }

    console.log(`✅ Organization Convex ID: ${orgConvexId}`);
    
    return orgConvexId || '';
  }

  /**
   * Verify organization subscription card data and return subscription details
   */
  async verifyOrganizationSubscriptionCard(expectedData?: {
    planName?: string;
    status?: string;
    price?: string;
    stripePriceId?: string;
    stripeProductId?: string;
  }): Promise<{ planName: string; status: string }> {
    await expect(this.subscriptionCard).toBeVisible();
    
    // Get subscription plan name and status
    const planName = await this.subscriptionPlanName.textContent();
    const status = await this.subscriptionStatus.textContent();
    
    expect(planName).toBeTruthy();
    expect(status).toBeTruthy();
    
    // Verify expected data if provided
    if (expectedData?.planName) {
      expect(planName).toBe(expectedData.planName);
    }
    if (expectedData?.status) {
      expect(status).toBe(expectedData.status);
    }
    if (expectedData?.price) {
      await expect(this.subscriptionPrice).toHaveText(expectedData.price);
    }
    if (expectedData?.stripePriceId) {
      await expect(this.subscriptionStripePriceId).toHaveText(expectedData.stripePriceId);
    }
    if (expectedData?.stripeProductId) {
      await expect(this.subscriptionStripeProductId).toHaveText(expectedData.stripeProductId);
    }
    
    // Verify subscription date exists
    await expect(this.subscriptionDate).not.toBeEmpty();

    console.log(`✅ Subscription plan name: ${planName}`);
    console.log(`✅ Subscription status: ${status}`);
    
    return { 
      planName: planName || '', 
      status: status || '' 
    };
  }

  /**
   * Verify user permissions card exists and permissions are visible
   */
  async verifyUserPermissionsCard(): Promise<void> {
    await expect(this.userPermissionsCard).toBeVisible();
    
    // Check if permissions exist or no permissions message is shown
    const hasPermissions = await this.permissionsCount.isVisible();
    const noPermissions = await this.noPermissions.isVisible();
    
    // Either should have permissions count or no permissions message
    expect(hasPermissions || noPermissions).toBe(true);
    
    if (hasPermissions) {
      // If permissions exist, verify count is not empty
      await expect(this.permissionsCount).not.toBeEmpty();
    }
  }

  /**
   * Verify organization memberships section exists
   */
  async verifyOrganizationMemberships(): Promise<void> {
    await expect(this.page.getByText('Organization Memberships').first()).toBeVisible();
    await expect(this.page.getByText('All organization memberships for current user')).toBeVisible();
  }

  /**
   * Start upgrade flow by clicking upgrade button and selecting pro plan
   */
  async startUpgradeFlow(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.upgradeButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.upgradeButton.click();
    
    await this.proPlanButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.proPlanButton.click();
    
    await this.page.waitForURL(/checkout\.stripe\.com/, { timeout: 15000 });
  }

  /**
   * Navigate to billing portal
   */
  async navigateToBillingPortal(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    
    if (await this.manageBillingButton.isVisible({ timeout: 5000 })) {
      await this.manageBillingButton.click();
      console.log('✅ Clicked manage billing button');
    } else if (await this.billingPortalLink.isVisible({ timeout: 5000 })) {
      await this.billingPortalLink.click();
      console.log('✅ Clicked billing portal link');
    } else {
      throw new Error('Could not find billing management button or link');
    }
    
    await this.page.waitForURL(/billing\.stripe\.com/, { timeout: 15000 });
  }


}