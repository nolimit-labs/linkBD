import { createMiddleware } from 'hono/factory'
import { auth } from '../auth.js'
import type { Session } from '../auth.js'

export type AuthVariables = {
  session: Session,
}

// Middleware for user authentication only (no organization required)
export const authMiddleware = createMiddleware(async (c, next) => {
  try {
    const authSession = await auth.api.getSession({
      headers: c.req.raw.headers
    })
    
    // Check if user is authenticated
    if (!authSession?.session || !authSession?.user) {
      return c.json({ error: 'Authentication required' }, 401)
    }
    
    // Add session info to context
    c.set('session', authSession)
    
    await next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return c.json({ error: 'Authentication failed' }, 401)
  }
})
// // Middleware for full authentication and organization validation (user and organization)
// export const orgMiddleware = createMiddleware(async (c, next) => {
//   try {
//     const authSession = await auth.api.getSession({
//       headers: c.req.raw.headers
//     })
    
//     // Check if user is authenticated
//     if (!authSession?.session || !authSession?.user) {
//       return c.json({ error: 'Authentication required' }, 401)
//     }
    
//     // Check if user has an active organization
//     if (!authSession.session.activeOrganizationId) {
//       return c.json({ error: 'No active organization found' }, 400)
//     }
    
//     // Add both user and organizationId to context
//     c.set('user', authSession.user)
//     c.set('organizationId', authSession.session.activeOrganizationId)
    
//     await next()
//   } catch (error) {
//     console.error('Auth middleware error:', error)
//     return c.json({ error: 'Authentication failed' }, 401)
//   }
// })
export const adminMiddleware = createMiddleware(async (c, next) => {
  try {
    const authSession = await auth.api.getSession({
      headers: c.req.raw.headers
    })
    
    // Check if user is authenticated
    if (!authSession?.session || !authSession?.user || authSession.user.role !== 'admin') {
      return c.json({ error: 'Admin authentication required' }, 401)
    }
    
    // Add session info to context
    c.set('session', authSession)
    
    await next()
  } catch (error) {
    return c.json({ error: 'Admin authentication failed' }, 401)
  }
})