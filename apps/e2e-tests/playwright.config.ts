import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './tests',
  
  /* Test timeout for each test (including hooks and fixtures) */
  timeout: process.env.TEST_TIMEOUT ? Number(process.env.TEST_TIMEOUT) : 60000, // 60 seconds per test
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use */
  reporter: 'html',

  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    actionTimeout: 30000,    
    
    /* Run in headed mode by default (browser visible) */
    headless: process.env.CI ? true : false,

  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

}); 