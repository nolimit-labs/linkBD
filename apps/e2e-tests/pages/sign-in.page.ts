import { Page, expect, Locator } from '@playwright/test';
import { createPageObjects } from '@clerk/testing/playwright/unstable';
import type { TestUser } from '../utils/test-users';

export class SignInPage {
  // Locator constants - organized at the top  
  private static readonly LOCATORS = {
    // Page routes
    LOGIN_PAGE: '/login',
    SIGN_IN_URL_PATTERN: /\/sign-in/,
    
    // Base URL for Clerk
    BASE_URL: 'http://localhost:3005'
  };

  // Page elements - private readonly properties
  private readonly page: Page;
  private readonly clerkPo: ReturnType<typeof createPageObjects>;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize Clerk page objects using static locators
    this.clerkPo = createPageObjects({ 
      page, 
      baseURL: SignInPage.LOCATORS.BASE_URL,
      useTestingToken: true 
    });
  }

  /**
   * Navigate to sign in page and wait for it to mount
   */
  async goToSignIn(): Promise<void> {
    await this.page.goto(SignInPage.LOCATORS.LOGIN_PAGE);
    await this.clerkPo.signIn.waitForMounted();
  }

  /**
   * Sign in with email and password using Clerk page objects
   */
  async signInWithCredentials(user: TestUser): Promise<void> {
    await this.clerkPo.signIn.signInWithEmailAndInstantPassword({
      email: user.email,
      password: user.password,
    });
  }

  /**
   * Assert user is signed in
   */
  async expectToBeSignedIn(): Promise<void> {
    await this.clerkPo.expect.toBeSignedIn();
  }

  /**
   * Assert user is signed out
   */
  async expectToBeSignedOut(): Promise<void> {
    await this.clerkPo.expect.toBeSignedOut();
  }

  /**
   * Assert user is on sign in page
   */
  async expectToBeOnSignInPage(): Promise<void> {
    await expect(this.page).toHaveURL(SignInPage.LOCATORS.SIGN_IN_URL_PATTERN);
  }
} 