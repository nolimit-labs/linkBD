# TodoApp Admin CLI

A modular command-line interface for managing the TodoApp database and Stripe integration.

## Features

### Database Management
- View database information and table statistics
- Seed subscription plans
- Delete all data (preserves table structure)
- Drop all tables
- Run database migrations
- Get backup commands

### Stripe Management
- List Stripe customers
- List Stripe subscriptions
- Search customers by email
- Delete Stripe customers
- Cancel Stripe subscriptions
- Sync Stripe data to database

## Usage

Run the CLI tool:

```bash
pnpm db:admin
```

Navigate through menus using:
- ↑/↓ arrow keys to move
- Enter to select
- Ctrl+C to exit

## Environment Variables

For Stripe functionality, ensure you have:
```env
STRIPE_SECRET_KEY=sk_test_...
```

## Architecture

The CLI is organized into modules:

```
cli/
├── index.ts          # Main entry point and menu system
├── modules/
│   ├── database.ts   # Database operations
│   └── stripe.ts     # Stripe operations
└── utils/
    ├── logger.ts     # Colored console logging
    └── menu.ts       # Menu navigation system
```

## Adding New Features

To add a new module:

1. Create a new file in `modules/`
2. Export a class with your operations
3. Add menu items in `index.ts`
4. Create a handler function for your submenu

Example:
```typescript
// modules/analytics.ts
export class AnalyticsAdmin {
  async generateReport() {
    // Implementation
  }
}

// In index.ts, add to menu items:
{ label: 'Analytics', icon: '📊', action: 'analytics', description: 'View analytics' }
```