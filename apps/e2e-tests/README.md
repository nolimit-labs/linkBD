# E2E Testing Suite

Simple end-to-end tests for the Inventory Manager application using Playwright.

## Quick Start

```bash
# Run all tests
pnpm test

# Run with browser visible
pnpm test --headed

# Run specific test
pnpm test tests/login.spec.ts
```

## Test Structure

```
apps/e2e-tests/
├── tests/
│   ├── auth.spec.ts     # Basic auth tests
│   ├── login.spec.ts    # Login scenarios
│   └── products.spec.ts # Product tests
├── pages/
│   ├── base.page.ts     # Base page class
│   └── login.page.ts    # Login page interactions
└── utils/
    ├── test-data.ts     # Test users and data
    └── helpers.ts       # Login/logout helpers
```

## Adding New Users

To add a new test user, edit `utils/test-data.ts`:

```typescript
export const testUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'AdminTest123!',
    displayName: 'Admin User',
  },
  
  // Add your new user here
  newUser: {
    email: 'newuser@test.com',
    password: 'NewUserTest123!',
    displayName: 'New User',
  },
};
```

## Simple Usage

```typescript
import { testUsers } from '../utils/test-data';
import { loginAs, logout } from '../utils/helpers';

test('my test', async ({ page }) => {
  // Login as any user
  await loginAs(page, testUsers.admin);
  
  // Do your test stuff...
  
  // Logout when done
  await logout(page);
});
```

## Available Test Users

- `testUsers.admin` - Admin user
- `testUsers.user` - Standard user  
- `testUsers.invalid` - Invalid credentials (for testing failures)

## Configuration

- **Base URL**: Set via `BASE_URL` env var (default: http://localhost:3005)
- **Auto-start**: Automatically starts dev server before tests
- **Browser**: Chrome only for simplicity 