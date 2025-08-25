import { hc } from 'hono/client'
import type { AppType } from '@repo/server'

// Create the RPC client - connects to the root since routes are mounted with /api prefix
export const rpcClient = hc<AppType>('/') 