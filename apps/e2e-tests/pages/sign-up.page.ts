import { Page, expect, Locator } from '@playwright/test';

export class SignUpPage {
  // Locator constants - organized at the top
  private static readonly LOCATORS = {
    // Base URL for the app
    
    // Form elements - using data-testid attributes
    NAME_INPUT: '[data-testid="signup-name-input"]',
    EMAIL_INPUT: '[data-testid="signup-email-input"]',
    PASSWORD_INPUT: '[data-testid="signup-password-input"]',
    SUBMIT_BUTTON: '[data-testid="signup-submit-button"]',
    
    // Page routes
    SIGNUP_ROUTE: '/sign-up',
    TODOS_ROUTE: '/todos',
  };

  // Page elements - private readonly properties
  private readonly page: Page;
  private readonly nameInput: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    this.nameInput = this.page.locator(SignUpPage.LOCATORS.NAME_INPUT);
    this.emailInput = this.page.locator(SignUpPage.LOCATORS.EMAIL_INPUT);
    this.passwordInput = this.page.locator(SignUpPage.LOCATORS.PASSWORD_INPUT);
    this.submitButton = this.page.locator(SignUpPage.LOCATORS.SUBMIT_BUTTON);
  }

  /**
   * Navigate to sign up page and wait for it to mount
   */
  async goToSignUp(): Promise<void> {
    await this.page.goto(`${SignUpPage.LOCATORS.SIGNUP_ROUTE}`);
    await this.page.waitForLoadState('networkidle');
    
    // Wait for the signup form to be visible
    await expect(this.nameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  /**
   * Fill out and submit the signup form
   */
  async signUp(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<void> {
    // Fill in the form fields
    await this.nameInput.fill(userData.name);
    await this.emailInput.fill(userData.email);
    await this.passwordInput.fill(userData.password);

    // Wait a moment before submitting
    await this.page.waitForTimeout(500);

    // Submit the form
    await this.submitButton.click();

    // Wait for navigation or success
    await this.page.waitForTimeout(2000);
  }

  /**
   * Assert user is signed in by checking URL navigation
   */
  async expectToBeSignedIn(): Promise<void> {
    // Wait for redirect to todos page after successful signup
    await expect(this.page).toHaveURL(new RegExp(`${SignUpPage.LOCATORS.TODOS_ROUTE}`), { timeout: 10000 });
  }

  /**
   * Assert user is on signup page (signed out)
   */
  async expectToBeSignedOut(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(SignUpPage.LOCATORS.SIGNUP_ROUTE));
  }

  /**
   * Wait for any error messages to appear
   */
  async waitForErrorMessage(): Promise<string | null> {
    try {
      // Look for toast error messages or form error messages
      const errorToast = this.page.locator('[data-sonner-toaster] [data-type="error"]');
      const formError = this.page.locator('.text-destructive');
      
      await Promise.race([
        errorToast.waitFor({ state: 'visible', timeout: 3000 }),
        formError.waitFor({ state: 'visible', timeout: 3000 })
      ]);
      
      // Return error text if found
      if (await errorToast.isVisible()) {
        return await errorToast.textContent();
      }
      if (await formError.isVisible()) {
        return await formError.textContent();
      }
      
      return null;
    } catch {
      // No error message found
      return null;
    }
  }
}