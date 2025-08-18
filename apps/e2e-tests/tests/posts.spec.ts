import { test, expect } from '@playwright/test';
import { clearBrowserData } from '../utils/helpers';
import { SignUpPage } from '../pages/sign-up.page';
import { SignInPage } from '../pages/sign-in.page';
import { FeedPage } from '../pages/feed.page';
import { testUsers } from '../utils/test-users';

test.describe('Posts', () => {
  let signUpPage: SignUpPage;
  let signInPage: SignInPage;
  let feedPage: FeedPage;

  test.beforeEach(async ({ page }) => {
    await clearBrowserData(page);
    signUpPage = new SignUpPage(page);
    signInPage = new SignInPage(page);
    feedPage = new FeedPage(page);
  });


  test('should create and display a post with freeAccountNoOrg user', async ({ page }) => {
    const testUser = testUsers.freeAccountNoOrg;
    const timestamp = Date.now();
    const postContent = `Test post content ${timestamp} - Created by automated test`;

    console.log('🔐 Signing in with freeAccountNoOrg user...');
    
    // Step 1: Sign in with test user
    await signInPage.goToSignIn();
    await signInPage.signInWithCredentials(testUser);
    await signInPage.expectToBeSignedIn();
    console.log('✅ Successfully signed in');

    // Step 2: Navigate to feed page
    console.log('📝 Navigating to feed page...');
    await feedPage.goToFeed();
    await feedPage.expectFeedPageLoaded();
    console.log('✅ Feed page loaded');

    // Step 3: Create a new post
    console.log('🖊️ Creating new post...');
    await feedPage.createPost(postContent, {
      visibility: 'public'
    });
    console.log('✅ Post created successfully');

    // Step 4: Wait for posts to load
    await feedPage.waitForPosts();
    
    // Step 5: Switch to My Posts feed to verify the post
    console.log('🔄 Switching to My Posts feed...');
    await feedPage.switchFeed('my-posts');
    await page.waitForTimeout(2000); // Give time for the feed to refresh
    
    // Step 6: Verify the post exists
    console.log('🔍 Verifying post appears in feed...');
    await feedPage.expectPostExists(postContent);
    console.log('✅ Post found in feed');

    // Step 7: Verify post content
    const foundPost = await feedPage.findPostByContent(postContent);
    expect(foundPost).toBeTruthy();
    
    // Step 8: Get post content and verify it matches
    const firstPostContent = await feedPage.getPostContent(0);
    expect(firstPostContent).toContain(postContent);
    
    console.log('🎉 Post creation and display test completed successfully!');
  });

  
});