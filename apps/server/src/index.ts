import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import todosRoutes from './routes/todos'
import { auth } from './auth'
import userRoutes from './routes/user'
import storageRoutes from './routes/storage'
import { prettyJSON } from 'hono/pretty-json'
import { secureHeaders } from 'hono/secure-headers'

import dotenv from 'dotenv'

dotenv.config()

// Initialize Hono app
const app = new Hono()

const corsOrigin = process.env.CORS_ORIGINS || 'http://localhost:3001'

// Middleware
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', secureHeaders())
app.use('*', cors(
  {
  origin: [corsOrigin], // Allow our frontend
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['*'],
  credentials: true, // This is the key fix!
}
))


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
  .route('/api/todos', todosRoutes)
  .route('/api/storage', storageRoutes)

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