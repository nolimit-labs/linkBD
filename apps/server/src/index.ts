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

dotenv.config()

// Initialize Hono app
const app = new Hono()

// Simple rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Custom rate limiting middleware
const rateLimit = async (c: any, next: any) => {
  const ip = c.req.header('CF-Connecting-IP') || 
             c.req.header('X-Forwarded-For') || 
             c.req.header('X-Real-IP') || 
             'unknown'
  
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const limit = 100 // 100 requests per window
  
  const key = `rate_limit:${ip}`
  const current = rateLimitStore.get(key)
  
  if (!current || now > current.resetTime) {
    // New window or expired window
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
  } else if (current.count >= limit) {
    // Rate limit exceeded
    return c.json({ error: 'Too many requests, please try again later' }, 429)
  } else {
    // Increment count
    current.count++
    rateLimitStore.set(key, current)
  }
  
  await next()
}

// Parse CORS origins properly (same logic as auth.ts)
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3001', 'http://localhost:3000'];

// Middleware
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', secureHeaders())

// Rate limiting middleware
app.use('*', rateLimit)

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

// Start the server
const port = process.env.PORT || 3002
console.log(`📝 linkBD API starting on port ${port}`)

serve({
  fetch: app.fetch,
  hostname: '::',
  port: port as number,
}, (info) => {
  console.log(`🚀 Server is running on http://localhost:${info.port}`)
  console.log(`📊 Health check: http://localhost:${info.port}/api/health`)
  console.log(`📝 API info: http://localhost:${info.port}/api`)
})

export default app 