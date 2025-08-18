import { Page, expect, Locator } from '@playwright/test';

export class FeedPage {
  // Locator constants
  private static readonly LOCATORS = {
    // Page routes
    FEED_PAGE: '/feed',
    
    // Feed buttons
    PUBLIC_FEED_BUTTON: 'button:has-text("Public")',
    MY_POSTS_BUTTON: 'button:has-text("My Posts")',
    
    // New post dialog
    NEW_POST_BUTTON: 'button:has-text("New Post")',
    POST_CONTENT_TEXTAREA: 'textarea[placeholder*="Share something"]',
    VISIBILITY_SELECT: 'select',
    IMAGE_INPUT: 'input[type="file"]',
    POST_BUTTON: 'button[type="submit"]:has-text("Post")',
    
    // Post elements
    POST_CARD: '[data-testid="post-card"]',
    POST_CONTENT: '[data-testid="post-content"]',
    LIKE_BUTTON: '[data-testid="like-button"]',
    POST_IMAGE: '[data-testid="post-image"]',
  };

  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to feed page
   */
  async goToFeed(): Promise<void> {
    await this.page.goto(FeedPage.LOCATORS.FEED_PAGE);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Open new post dialog
   */
  async openNewPostDialog(): Promise<void> {
    await this.page.click(FeedPage.LOCATORS.NEW_POST_BUTTON);
    // Wait for dialog to open
    await this.page.waitForSelector(FeedPage.LOCATORS.POST_CONTENT_TEXTAREA, { state: 'visible' });
  }

  /**
   * Create a new post
   */
  async createPost(content: string, options?: {
    visibility?: 'public' | 'organization' | 'private';
    imagePath?: string;
  }): Promise<void> {
    // Open dialog
    await this.openNewPostDialog();
    
    // Fill content
    await this.page.fill(FeedPage.LOCATORS.POST_CONTENT_TEXTAREA, content);
    
    // Set visibility if provided
    if (options?.visibility) {
      await this.page.selectOption(FeedPage.LOCATORS.VISIBILITY_SELECT, options.visibility);
    }
    
    // Add image if provided
    if (options?.imagePath) {
      await this.page.setInputFiles(FeedPage.LOCATORS.IMAGE_INPUT, options.imagePath);
    }
    
    // Submit post
    await this.page.click(FeedPage.LOCATORS.POST_BUTTON);
    
    // Wait for dialog to close and post to appear
    await this.page.waitForSelector(FeedPage.LOCATORS.POST_CONTENT_TEXTAREA, { state: 'hidden' });
  }

  /**
   * Switch to a different feed view
   */
  async switchFeed(feedType: 'public' | 'my-posts'): Promise<void> {
    if (feedType === 'public') {
      await this.page.click(FeedPage.LOCATORS.PUBLIC_FEED_BUTTON);
    } else if (feedType === 'my-posts') {
      await this.page.click(FeedPage.LOCATORS.MY_POSTS_BUTTON);
    }
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get all posts on the current page
   */
  async getPosts(): Promise<Locator[]> {
    const posts = await this.page.locator(FeedPage.LOCATORS.POST_CARD).all();
    return posts;
  }

  /**
   * Get post content by index
   */
  async getPostContent(index: number): Promise<string | null> {
    const posts = await this.getPosts();
    if (index >= posts.length) return null;
    
    const contentElement = posts[index].locator(FeedPage.LOCATORS.POST_CONTENT);
    return await contentElement.textContent();
  }

  /**
   * Find post by content
   */
  async findPostByContent(content: string): Promise<Locator | null> {
    const posts = await this.getPosts();
    
    for (const post of posts) {
      const postContent = await post.locator(FeedPage.LOCATORS.POST_CONTENT).textContent();
      if (postContent?.includes(content)) {
        return post;
      }
    }
    
    return null;
  }

  /**
   * Like a post by index
   */
  async likePost(index: number): Promise<void> {
    const posts = await this.getPosts();
    if (index >= posts.length) throw new Error(`Post at index ${index} not found`);
    
    await posts[index].locator(FeedPage.LOCATORS.LIKE_BUTTON).click();
  }

  /**
   * Assert that a post with specific content exists
   */
  async expectPostExists(content: string): Promise<void> {
    const post = await this.findPostByContent(content);
    expect(post).toBeTruthy();
  }

  /**
   * Assert that the feed page is loaded
   */
  async expectFeedPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/feed/);
    await expect(this.page.locator(FeedPage.LOCATORS.NEW_POST_BUTTON)).toBeVisible();
  }

  /**
   * Wait for posts to load
   */
  async waitForPosts(): Promise<void> {
    // Wait for at least one post or the empty state
    await this.page.waitForSelector(`${FeedPage.LOCATORS.POST_CARD}, text=/No posts/i`, {
      state: 'visible',
      timeout: 10000
    });
  }
}