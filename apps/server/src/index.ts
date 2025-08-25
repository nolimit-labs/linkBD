import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import postsRoutes from './routes/posts'
import { auth } from './auth'
import userRoutes from './routes/user'
import profileRoutes from './routes/profile'
import storageRoutes from './routes/storage'
import searchRoutes from './routes/search'
import { prettyJSON } from 'hono/pretty-json'
import { secureHeaders } from 'hono/secure-headers'
import organizationsRoutes from './routes/organizations'
import dotenv from 'dotenv'
import { rateLimiter } from 'hono-rate-limiter'
import { createHash } from 'crypto'
import adminRoutes from './routes/admin'

dotenv.config()

// Initialize Hono app
const app = new Hono()

// Creating Rate Limiter
const sha = (s: string) => createHash('sha256').update(s).digest('hex');

const keyGenerator = (c: any) => {
  // if you’ve put your Better-Auth session on context earlier:
  const userId = c.get?.('session')?.userId as string | undefined;
  if (userId) return `uid:${userId}`;

  // programmatic callers: x-api-key or Authorization
  const apiKey = c.req.header('x-api-key') || c.req.header('authorization');
  if (apiKey) return `key:${sha(apiKey)}`;

  // last resort: client IP (trust headers from *your* proxy/CDN)
  const xfwd = c.req.header('x-forwarded-for');
  const first = xfwd?.split(',')[0]?.trim();
  const ip =
    first ||
    c.req.header('cf-connecting-ip') ||
    c.req.header('x-real-ip') ||
    'unknown';

  return `ip:${ip}`;
};

// Build the limiter (memory store by default; great for dev/single instance)
const limiter = rateLimiter({
  windowMs: 60_000,              // 1 minute window
  limit: 100,                    // 100 req/min
  standardHeaders: 'draft-7',    // adds RateLimit-* headers
  keyGenerator,
});

// Parse CORS origins properly (same logic as auth.ts)
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3001', 'http://localhost:3000'];

// Middleware
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', secureHeaders())

app.use('*', async (c, next) => {
  if (c.req.method === 'OPTIONS') return next();
  return limiter(c, next);
});

app.use('*', cors({
  origin: corsOrigins, // Allow multiple origins
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['*'],
  credentials: true,
}))


// Health check endpoint - moved to /api/health
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    message: 'linkBD API is running',
    timestamp: new Date().toISOString()
  })
})

// Auth routes from BetterAuth
app.all('/api/auth/*', async (c) => {
  const res = await auth.handler(c.req.raw);
  return new Response(res.body, { status: res.status, headers: res.headers });
});

// Mount route handlers and create routes for RPC
const routes = app
  .route('/api/user', userRoutes)
  .route('/api/profile', profileRoutes)
  .route('/api/posts', postsRoutes)
  .route('/api/storage', storageRoutes)
  .route('/api/search', searchRoutes)
  .route('/api/organizations', organizationsRoutes)
  .route('/api/admin', adminRoutes)

// Export AppType for RPC client usage in client 
export type AppType = typeof routes

// 404 handler
app.notFound((c) => {
  return c.json({ 
    success: false, 
    error: 'Endpoint not found',
    message: 'The requested resource does not exist'
  }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err)
  return c.json({ 
    success: false, 
    error: 'Internal server error',
    message: 'Something went wrong on our end'
  }, 500)
})

const port = Number(process.env.PORT) || 3005;
console.log(`📝 Simple Todo App API starting on port ${port}`);

export default {
  fetch: app.fetch,
  port,
  hostname: '::'
};