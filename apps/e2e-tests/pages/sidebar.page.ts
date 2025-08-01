import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class SidebarPage extends BasePage {
  // Page URLs
  // static readonly DASHBOARD_URL = '/dashboard';
  // static readonly ITEMS_URL = '/items';
  // static readonly ACTIVITY_URL = '/activity';
  // static readonly SETTINGS_URL = '/settings';

  // Locators object - all locator selectors defined at the top
  private readonly Locators = {
    // Sidebar trigger
    SIDEBAR_TRIGGER: '[data-sidebar="trigger"]',
    
    // Sidebar container
    SIDEBAR: '[data-sidebar="sidebar"]',
    
    // Navigation menu items (using Link components with specific paths)
    DASHBOARD_LINK: 'a[href="/dashboard"]',
    ITEMS_LINK: 'a[href="/items"]',
    ACTIVITY_LINK: 'a[href="/activity"]',
    
    // Upgrade button
    UPGRADE_BUTTON: '[data-testid="sidebar-upgrade-button"]',
    
    // Organization dropdown in footer
    ORGANIZATION_DROPDOWN_TRIGGER: '.flex.items-center.gap-3.min-w-0.flex-1',
    ORGANIZATION_NAME: 'p.text-sm.font-medium.truncate',
    ORGANIZATION_SLUG: 'p.text-xs.text-muted-foreground',
    
    // Dropdown menu items
    SETTINGS_DROPDOWN_ITEM: 'a[href="/settings"]',
    
    // Settings button (when no organization)
    SETTINGS_BUTTON: 'a[href="/settings"] button',
  };

  // Page elements - public readonly properties for direct access
  readonly sidebarTrigger: Locator;
  readonly sidebar: Locator;
  readonly dashboardLink: Locator;
  readonly itemsLink: Locator;
  readonly activityLink: Locator;
  readonly upgradeButton: Locator;
  readonly organizationDropdownTrigger: Locator;
  readonly organizationName: Locator;
  readonly organizationSlug: Locator;
  readonly settingsDropdownItem: Locator;
  readonly settingsButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize all elements using Locators object
    this.sidebarTrigger = this.page.locator(this.Locators.SIDEBAR_TRIGGER);
    this.sidebar = this.page.locator(this.Locators.SIDEBAR);
    this.dashboardLink = this.page.locator(this.Locators.DASHBOARD_LINK);
    this.itemsLink = this.page.locator(this.Locators.ITEMS_LINK);
    this.activityLink = this.page.locator(this.Locators.ACTIVITY_LINK);
    this.upgradeButton = this.page.locator(this.Locators.UPGRADE_BUTTON);
    this.organizationDropdownTrigger = this.page.locator(this.Locators.ORGANIZATION_DROPDOWN_TRIGGER);
    this.organizationName = this.page.locator(this.Locators.ORGANIZATION_NAME);
    this.organizationSlug = this.page.locator(this.Locators.ORGANIZATION_SLUG);
    this.settingsDropdownItem = this.page.locator(this.Locators.SETTINGS_DROPDOWN_ITEM);
    this.settingsButton = this.page.locator(this.Locators.SETTINGS_BUTTON);
  }

  /**
   * Open the sidebar if it's closed (mobile view)
   */
  async openSidebar(): Promise<void> {
    // Check if sidebar is visible
    const isVisible = await this.sidebar.isVisible({ timeout: 1000 });
    
    if (!isVisible) {
      await this.sidebarTrigger.click();
      await this.sidebar.waitFor({ state: 'visible', timeout: 5000 });
      console.log('✅ Opened sidebar');
    }
  }

  /**
   * Close the sidebar (mobile view)
   */
  async closeSidebar(): Promise<void> {
    const isVisible = await this.sidebar.isVisible({ timeout: 1000 });
    
    if (isVisible) {
      // Click outside or use trigger to close
      await this.sidebarTrigger.click();
      await this.page.waitForTimeout(500); // Wait for animation
      console.log('✅ Closed sidebar');
    }
  }

  /**
   * Navigate to Dashboard
   */
  async navigateToDashboard(): Promise<void> {
    await this.openSidebar();
    await this.dashboardLink.click();
    await expect(this.page).toHaveURL(/\/dashboard/);
    console.log('✅ Navigated to Dashboard');
  }

  /**
   * Navigate to Items
   */
  async navigateToItems(): Promise<void> {
    await this.openSidebar();
    await this.itemsLink.click();
    await expect(this.page).toHaveURL(/\/items/);
    console.log('✅ Navigated to Items');
  }


  /**
   * Navigate to Activity
   */
  async navigateToActivity(): Promise<void> {
    await this.openSidebar();
    await this.activityLink.click();
    await expect(this.page).toHaveURL(/\/activity/);
    console.log('✅ Navigated to Activity');
  }

  /**
   * Click upgrade button if available
   * @returns true if upgrade button was clicked, false if not available
   */
  async clickUpgradeButton(): Promise<boolean> {
    await this.openSidebar();
    
    if (await this.upgradeButton.isVisible({ timeout: 2000 })) {
      await this.upgradeButton.click();
      console.log('✅ Clicked upgrade button');
      return true;
    }
    
    console.log('ℹ️ Upgrade button not available (user may already be on premium)');
    return false;
  }

  /**
   * Navigate to Settings via dropdown menu
   */
  async navigateToSettings(): Promise<void> {
    await this.openSidebar();
    
    // Check if organization dropdown is available
    if (await this.organizationDropdownTrigger.isVisible({ timeout: 2000 })) {
      await this.organizationDropdownTrigger.click();
      await this.settingsDropdownItem.waitFor({ state: 'visible', timeout: 5000 });
      await this.settingsDropdownItem.click();
    } else if (await this.settingsButton.isVisible({ timeout: 2000 })) {
      // Fallback to direct settings button if no organization
      await this.settingsButton.click();
    }
    
    await expect(this.page).toHaveURL(/\/settings/);
    console.log('✅ Navigated to Settings');
  }

  /**
   * Verify organization info in sidebar footer
   */
  async verifyOrganizationInfo(expectedData: { name: string; slug: string }): Promise<void> {
    await this.openSidebar();
    await expect(this.organizationName).toHaveText(expectedData.name);
    await expect(this.organizationSlug).toHaveText(expectedData.slug);
    console.log('✅ Verified organization info in sidebar');
  }

  /**
   * Check if sidebar is open
   * @returns true if sidebar is visible
   */
  async isSidebarOpen(): Promise<boolean> {
    return await this.sidebar.isVisible({ timeout: 1000 });
  }

  /**
   * Navigate to any page via sidebar
   * @param page - The page to navigate to
   */
  async navigateToPage(page: 'dashboard' | 'items' | 'activity' | 'settings'): Promise<void> {
    switch (page) {
      case 'dashboard':
        await this.navigateToDashboard();
        break;
      case 'items':
        await this.navigateToItems();
        break;
      case 'activity':
        await this.navigateToActivity();
        break;
      case 'settings':
        await this.navigateToSettings();
        break;
      default:
        throw new Error(`Unknown page: ${page}`);
    }
  }
}