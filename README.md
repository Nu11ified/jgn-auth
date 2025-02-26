# JGN Auth

A Cloudflare Workers app with Hono, Drizzle ORM for D1, and Better Auth for authentication.

## Quick Start

```bash
# Install dependencies
pnpm install

# Create local D1 database (first time only)
pnpm db:create
# Update wrangler.jsonc with the database ID from above

# Generate and apply migrations
pnpm generate
pnpm auth:generate
pnpm migrate:local
pnpm auth:migrate

# Start development server
pnpm dev
```

## Authentication

Better Auth endpoints are available at `/api/auth/*`:

- `/api/auth/sign-up` - Register new users
- `/api/auth/sign-in` - Log in existing users
- `/api/auth/sign-out` - Sign out
- `/api/auth/session` - Get current session
- `/api/auth/user` - Get current user

Check authentication status:

```typescript
// Example
const response = await fetch('/session');
const data = await response.json();
if (data.authenticated) {
  console.log('User:', data.user);
} else {
  console.log('Not authenticated');
}
```

## Deployment

```bash
# Deploy to Cloudflare Workers
pnpm deploy

# Apply migrations to production
pnpm migrate
pnpm auth:migrate
```

## Database Usage

```typescript
import { createDb } from '@/db';
import { users } from '@/db/schema';

// Example: Fetch all users
app.get('/users', async (c) => {
  const db = createDb(c.env.DB);
  return c.json(await db.select().from(users).all());
});
```

## Environment Variables

This project uses Cloudflare Workers for deployment, which handles environment variables differently than traditional Node.js applications:

### Development Environment
- Copy `.env.example` to `.env` (for local development only)
- Run `pnpm dev` to start the development server which will use these variables

### Production Environment
- Public variables: Add them to the `vars` section in `wrangler.jsonc`
- Secret variables: Use Wrangler's secret management system:
  ```
  npx wrangler secret put BETTER_AUTH_SECRET
  ```
  This command will prompt you to enter the secret value securely.

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| BETTER_AUTH_URL | The base URL of your application | `http://localhost:8787` (dev) or `https://your-app.workers.dev` (prod) |
| BETTER_AUTH_SECRET | Secret key for authentication (32+ chars) | (Set as a secret, not in your code) |

## Troubleshooting

### Command not found: wrangler

If you see `zsh: command not found: wrangler`, use the npm scripts provided:

```bash
# Instead of: wrangler d1 create jgn_auth_db
# Use:
pnpm db:create

# Instead of: wrangler dev
# Use:
pnpm dev
```

### Better Auth CLI errors

If you encounter errors with Better Auth CLI commands:

1. Make sure the `auth.config.ts` file exists in the project root
2. Ensure you run the CLI with the correct configuration: `pnpm auth:generate`
3. If you get "Couldn't read your auth config" errors, check that the auth instance is exported correctly
