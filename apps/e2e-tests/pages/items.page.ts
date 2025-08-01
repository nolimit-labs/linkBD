import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export interface ItemData {
  name: string;
  description: string;
  price?: string;
}

export class ItemsPage extends BasePage {
  // 1. Static URLs - Define page routes
  static readonly ITEMS_PAGE_URL = '/items';
  static readonly ITEM_DETAIL_URL_PATTERN = /\/items\/.+$/;

  // 2. Locators Object - Centralize all selectors at the top
  private readonly Locators = {
    // Search and Filter
    SEARCH_INPUT: 'input[placeholder="Search items..."]',
    SEARCH_CLEAR_BUTTON: 'button:has(svg.h-3.w-3)',
    
    // Dialog and Form Containers
    ADD_ITEM_BUTTON: '[data-testid="add-item-button"]',
    ADD_ITEM_DIALOG: '[data-testid="add-item-dialog"]',
    ADD_ITEM_FORM: '[data-testid="add-item-form"]',
    EDIT_ITEM_FORM: '[data-testid="edit-item-form"]',
    
    // Form Field Elements
    NAME_INPUT: '[data-testid="input-name"]',
    DESCRIPTION_FIELD: '[data-testid="textarea-description"]',
    PRICE_INPUT: '[data-testid="input-price"]',
    
    // Submit Buttons
    CREATE_SUBMIT_BUTTON: '[data-testid="create-item-submit"]',
    UPDATE_SUBMIT_BUTTON: '[data-testid="update-item-submit"]',
    
    // Table Elements
    ITEMS_TABLE: '[data-testid="items-table"]',
    
    // Validation Elements
    VALIDATION_ERROR: '[data-invalid], .text-destructive, [role="alert"]',
    
    // Alternative selectors (fallbacks)
    ALT_NAME_INPUT: 'input[name="name"]',
    ALT_DESCRIPTION_FIELD: 'textarea[name="description"]',
    ALT_PRICE_INPUT: 'input[name="price"]',
    
    // Placeholder-based selectors (second fallback)
    PLACEHOLDER_NAME: 'input[placeholder*="name"]',
    PLACEHOLDER_DESCRIPTION: 'textarea[placeholder*="description"]',
    PLACEHOLDER_PRICE: 'input[placeholder*="price"]',
    
    // Action buttons in table rows
    ITEM_ACTIONS_PREFIX: '[data-testid^="item-actions-"]',
    EDIT_ITEM_PREFIX: '[data-testid^="edit-item-"]',
    DELETE_ITEM_PREFIX: '[data-testid^="delete-item-"]',
  };

  // 3. Page Elements - Public readonly Locator properties
  readonly searchInput: Locator;
  readonly searchClearButton: Locator;
  readonly addItemButton: Locator;
  readonly addItemDialog: Locator;
  readonly addItemForm: Locator;
  readonly editItemForm: Locator;
  readonly nameInput: Locator;
  readonly descriptionField: Locator;
  readonly priceInput: Locator;
  readonly createSubmitButton: Locator;
  readonly updateSubmitButton: Locator;
  readonly itemsTable: Locator;
  readonly validationError: Locator;

  // 4. Constructor - Initialize all locators
  constructor(page: Page) {
    super(page);
    
    // Initialize all elements using the Locators object
    this.searchInput = this.page.locator(this.Locators.SEARCH_INPUT);
    this.searchClearButton = this.page.locator(this.Locators.SEARCH_CLEAR_BUTTON);
    this.addItemButton = this.page.locator(this.Locators.ADD_ITEM_BUTTON);
    this.addItemDialog = this.page.locator(this.Locators.ADD_ITEM_DIALOG);
    this.addItemForm = this.page.locator(this.Locators.ADD_ITEM_FORM);
    this.editItemForm = this.page.locator(this.Locators.EDIT_ITEM_FORM);
    this.nameInput = this.page.locator(this.Locators.NAME_INPUT);
    this.descriptionField = this.page.locator(this.Locators.DESCRIPTION_FIELD);
    this.priceInput = this.page.locator(this.Locators.PRICE_INPUT);
    this.createSubmitButton = this.page.locator(this.Locators.CREATE_SUBMIT_BUTTON);
    this.updateSubmitButton = this.page.locator(this.Locators.UPDATE_SUBMIT_BUTTON);
    this.itemsTable = this.page.locator(this.Locators.ITEMS_TABLE);
    this.validationError = this.page.locator(this.Locators.VALIDATION_ERROR);
  }

  // 5. Navigation Methods - Simple goto methods first
  async goToItems(): Promise<void> {
    await this.page.goto(ItemsPage.ITEMS_PAGE_URL);
    await this.waitForLoadState();
  }

  // 6. Complex Navigation - Navigation with verification
  async navigateToItemsPage(): Promise<void> {
    await this.goToItems();
    await expect(this.page).toHaveURL(/\/items/);
    await expect(this.addItemButton).toBeVisible({ timeout: 10000 });
  }

  /**
   * Assert that the items page is loaded
   */
  async expectToBeOnItemsPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/items/);
  }

  /**
   * Search for items by typing in the search input
   */
  async searchForItem(searchTerm: string) {
    console.log(`Searching for: ${searchTerm}`);
    await this.searchInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.searchInput.fill(searchTerm);
    // Wait a bit for the search to take effect
    await this.page.waitForTimeout(1000);
  }

  /**
   * Clear the search input
   */
  async clearSearch() {
    const isSearchActive = await this.searchClearButton.isVisible({ timeout: 1000 });
    if (isSearchActive) {
      await this.searchClearButton.click();
      console.log('Search cleared');
    }
  }

  /**
   * Click the add item button to open the add item dialog
   */
  async clickAddItem() {
    await this.addItemButton.click();
    
    // Wait for dialog to appear
    await expect(this.addItemDialog).toBeVisible();
    await expect(this.addItemForm).toBeVisible();
  }

  // 7. Action Methods - User interactions
  /**
   * Fill name input with fallback strategies
   */
  async fillName(name: string): Promise<void> {
    console.log(`Filling name field: ${name}`);
    
    // Clear field first
    await this.nameInput.clear();
    await this.nameInput.fill(name);
    console.log('✅ Name field filled');
  }

  /**
   * Fill description field with fallback strategies
   */
  async fillDescription(description: string): Promise<void> {
    console.log(`Filling description field: ${description}`);
    
    await this.descriptionField.clear();
    await this.descriptionField.fill(description);
    console.log('✅ Description field filled');
  }

  /**
   * Fill price input (optional field)
   */
  async fillPrice(price: string): Promise<void> {
    console.log(`Filling price field: ${price}`);
    
    await this.priceInput.clear();
    await this.priceInput.fill(price);
    console.log('✅ Price field filled');
  }


  /**
   * Fill out the item form with the provided data using robust methods
   */
  async fillItemForm(itemData: ItemData): Promise<void> {
    // Required fields
    await this.fillName(itemData.name);
    await this.fillDescription(itemData.description);
    
    // Optional fields
    if (itemData.price) {
      await this.fillPrice(itemData.price);
    }
    
    console.log('✅ Item form filled with provided data');
  }

  /**
   * Submit the create item form with error handling
   */
  async submitCreateForm(): Promise<void> {
    console.log('Submitting create form...');
    
    try {
      // Wait for submit button to be visible
      await this.createSubmitButton.waitFor({ state: 'visible', timeout: 5000 });
      
      // Click submit
      await this.createSubmitButton.click();
      await this.waitForLoadState();
      
      // Wait for dialog to close (success indicator)
      await expect(this.addItemDialog).not.toBeVisible({ timeout: 10000 });
      console.log('Create form submitted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to submit create form: ${errorMessage}`);
    }
  }

  /**
   * Submit the update item form with error handling
   */
  async submitUpdateForm(): Promise<void> {
    console.log('Submitting update form...');
    
    try {
      // Wait for submit button to be visible
      await this.updateSubmitButton.waitFor({ state: 'visible', timeout: 5000 });
      
      // Click submit
      await this.updateSubmitButton.click();
      await this.waitForLoadState();
      
      console.log('Update form submitted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to submit update form: ${errorMessage}`);
    }
  }

  /**
   * Add a new item using the complete flow
   */
  async addItem(itemData: ItemData) {
    await this.clickAddItem();
    await this.fillItemForm(itemData);
    await this.submitCreateForm();
  }

  /**
   * Navigate to edit page for an item by clicking its actions menu
   */
  async navigateToEditItem(itemName: string) {
    // Find the item row
    const itemRow = this.page.locator(`tr:has-text("${itemName}")`);
    
    // Click the actions button for that row
    const actionsButton = itemRow.locator('[data-testid^="item-actions-"]');
    await actionsButton.click();
    
    // Click the edit link in the dropdown
    const editLink = this.page.locator('[data-testid^="edit-item-"]');
    await editLink.click();
    
    // Wait for navigation to edit page
    await this.page.waitForURL(/\/items\/.*$/);
    await expect(this.editItemForm).toBeVisible();
  }

  /**
   * Update an existing item (complete flow)
   */
  async updateItem(originalName: string, newData: ItemData) {
    await this.navigateToEditItem(originalName);
    await this.fillItemForm(newData);
    await this.submitUpdateForm();
    
    // Navigate back to items page
    await this.goToItems();
  }

  /**
   * Delete an item by clicking its actions menu
   */
  async deleteItemByName(itemName: string) {
    // Find the item row
    const itemRow = this.page.locator(`tr:has-text("${itemName}")`);
    
    // Click the actions button for that row
    const actionsButton = itemRow.locator('[data-testid^="item-actions-"]');
    await actionsButton.click();
    
    // Click the delete button in the dropdown
    const deleteButton = this.page.locator('[data-testid^="delete-item-"]');
    await deleteButton.click();
    
    await this.waitForLoadState();
  }

  // 8. Verification Methods - Data validation
  /**
   * Assert that an item with the given name is visible
   */
  async expectItemToBeVisible(itemName: string): Promise<void> {
    await expect(this.page.locator(`text=${itemName}`)).toBeVisible({ timeout: 10000 });
    console.log(`✅ Item "${itemName}" is visible`);
  }

  /**
   * Assert that an item with the given name is not visible
   */
  async expectItemNotToBeVisible(itemName: string): Promise<void> {
    await expect(this.page.locator(`text=${itemName}`)).not.toBeVisible();
    console.log(`✅ Item "${itemName}" is not visible`);
  }

  /**
   * Assert that item details are visible
   */
  async expectItemDetails(itemData: ItemData): Promise<void> {
    await this.expectItemToBeVisible(itemData.name);
    await expect(this.page.locator(`text=${itemData.description}`)).toBeVisible();
    
    if (itemData.price) {
      await expect(this.page.locator(`text=$${itemData.price}`)).toBeVisible();
    }
    
    console.log(`✅ Item details verified for "${itemData.name}"`);
  }

  /**
   * Assert that the items table is visible
   */
  async expectItemsListToBeVisible(): Promise<void> {
    await expect(this.itemsTable).toBeVisible();
    console.log('✅ Items table is visible');
  }

  /**
   * Assert validation error is shown
   */
  async expectValidationError(): Promise<void> {
    await expect(this.validationError.first()).toBeVisible();
    console.log('✅ Validation error is visible');
  }

  /**
   * Verify the create item form is displayed correctly
   */
  async verifyCreateItemFormIsDisplayed(): Promise<void> {
    await expect(this.addItemDialog).toBeVisible();
    await expect(this.nameInput).toBeVisible();
    await expect(this.descriptionField).toBeVisible();
    await expect(this.createSubmitButton).toBeVisible();
    console.log('✅ Create item form is displayed correctly');
  }

  /**
   * Verify form validation for required fields
   */
  async verifyRequiredFieldValidation(): Promise<void> {
    // Click submit without filling fields
    await this.createSubmitButton.click();
    
    // Check that form didn't close (validation prevented submission)
    await expect(this.addItemDialog).toBeVisible();
    
    // Look for validation messages
    const validationErrors = await this.validationError.count();
    expect(validationErrors).toBeGreaterThan(0);
    
    console.log('✅ Required field validation is working');
  }

  /**
   * Verify that an item exists in the gallery view with all its attributes (simplified)
   * @param itemName - The name of the item
   * @param description - The description of the item  
   * @param price - The price (without $)
   */
  async verifyItemInTable(params: {
    itemName: string;
    description: string;
    price: string;
  }): Promise<void> {
    const { itemName, price } = params;
    
    console.log(`Verifying item "${itemName}" exists in gallery view...`);
    
    // Find the gallery card containing the item name
    const itemCard = this.page.locator('.group.relative.overflow-hidden.rounded-xl.border').filter({
      hasText: itemName
    });
    
    // Verify the card exists
    await expect(itemCard).toBeVisible({ timeout: 10000 });
    
    // Verify item name is displayed in the card
    await expect(itemCard.locator('h3').filter({ hasText: itemName })).toBeVisible();
    
    // Verify price is displayed
    await expect(itemCard.locator(`text="$${price}"`)).toBeVisible();
    
    // Verify action buttons exist (they should be present but might be hidden until hover)
    const editButton = itemCard.locator(`[data-testid^="edit-item-"]`);
    const deleteButton = itemCard.locator(`[data-testid^="delete-item-"]`);
    
    // The buttons exist in the DOM even if not immediately visible
    await expect(editButton).toBeInViewport();
    await expect(deleteButton).toBeInViewport();
    
    console.log(`✅ Item "${itemName}" verified successfully in gallery view`);
  }

  /**
   * Verify multiple items exist in the gallery view (useful for seed data verification)
   */
  async verifyMultipleItemsInTable(items: Array<{
    itemName: string;
    description: string;
    price: string;
  }>): Promise<void> {
    console.log(`Verifying ${items.length} items in gallery view...`);
    
    for (const item of items) {
      await this.verifyItemInTable(item);
    }
    
    console.log(`✅ All ${items.length} items verified successfully in gallery view`);
  }
}