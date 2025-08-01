import { test, expect } from '@playwright/test';
import { clearBrowserData } from '../utils/helpers';
import { SignUpPage } from '../pages/sign-up.page';

/* Simple signup test for TodoApp using Better Auth
 * This test verifies the basic signup flow works correctly
 */

test.describe('User Signup Flow', () => {
  let signUpPage: SignUpPage;

  test.beforeEach(async ({ page }) => {
    await clearBrowserData(page);
    signUpPage = new SignUpPage(page);
  });

  test('should complete user signup successfully', async ({ page }) => {
    // Test data configuration
    const timestamp = Date.now();
    const TEST_USER = {
      name: 'Test User',
      email: `testuser${timestamp}@example.com`,
      password: 'TestPassword123!',
    };

    console.log('🧪 Test User Info:');
    console.log(`Name: ${TEST_USER.name}`);
    console.log(`Email: ${TEST_USER.email}`);
    console.log(`Password: ${TEST_USER.password}`);

    // Step 1: Navigate to signup page
    console.log('📝 Navigating to signup page...');
    await signUpPage.goToSignUp();
    console.log('✅ Successfully loaded signup page');

    // Step 2: Fill out and submit signup form
    console.log('🔐 Filling out signup form...');
    await signUpPage.signUp({
      name: TEST_USER.name,
      email: TEST_USER.email,
      password: TEST_USER.password,
    });
    console.log('✅ Signup form submitted');

    // Step 3: Verify successful signup and redirect
    console.log('🔍 Verifying successful signup...');
    await signUpPage.expectToBeSignedIn();
    console.log('✅ User successfully signed up and redirected to todos page');

    // Step 4: Verify we're on the todos page
    await expect(page).toHaveURL(/\/todos/);
    console.log('✅ Successfully navigated to todos page');

    // Step 5: Verify basic page content is loaded
    console.log('📋 Verifying todos page loads correctly...');
    
    // Wait for the todos page to load completely
    await page.waitForLoadState('networkidle');
    
    // Look for typical todos page elements (adjust selectors based on your actual page)
    const pageTitle = page.locator('h1, h2, [data-testid*="title"], [data-testid*="header"]').first();
    const todosContainer = page.locator('[data-testid*="todo"], .todo, main, [role="main"]').first();
    
    // Wait for at least one of these elements to be visible
    await Promise.race([
      pageTitle.waitFor({ state: 'visible', timeout: 5000 }),
      todosContainer.waitFor({ state: 'visible', timeout: 5000 }),
    ]);
    
    console.log('✅ Todos page content loaded successfully');
    console.log('🎉 Signup test completed successfully!');
  });

  test('should show error for invalid email', async ({ page }) => {
    const TEST_USER = {
      name: 'Test User',
      email: 'invalid-email', // Invalid email format
      password: 'TestPassword123!',
    };

    console.log('🧪 Testing invalid email validation...');

    // Navigate to signup page
    await signUpPage.goToSignUp();

    // Fill out form with invalid email
    await signUpPage.signUp(TEST_USER);

    // Check for error message (either form validation or toast)
    const errorMessage = await signUpPage.waitForErrorMessage();
    
    // Should either stay on signup page or show error
    const currentUrl = page.url();
    const isStillOnSignup = currentUrl.includes('/sign-up');
    const hasErrorMessage = errorMessage !== null;

    expect(isStillOnSignup || hasErrorMessage).toBe(true);
    console.log('✅ Invalid email validation working correctly');
  });

  test('should show error for weak password', async ({ page }) => {
    const TEST_USER = {
      name: 'Test User',
      email: `testuser${Date.now()}@example.com`,
      password: '123', // Too short password
    };

    console.log('🧪 Testing weak password validation...');

    // Navigate to signup page
    await signUpPage.goToSignUp();

    // Fill out form with weak password
    await signUpPage.signUp(TEST_USER);

    // Check for error message
    const errorMessage = await signUpPage.waitForErrorMessage();
    
    // Should either stay on signup page or show error
    const currentUrl = page.url();
    const isStillOnSignup = currentUrl.includes('/sign-up');
    const hasErrorMessage = errorMessage !== null;

    expect(isStillOnSignup || hasErrorMessage).toBe(true);
    console.log('✅ Weak password validation working correctly');
  });
});