import 'dotenv/config';

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

const connectionString = process.env.DATABASE_URL!;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

let caCert = process.env.PG_CA_CERT;
if (!caCert) {
  throw new Error('PG_CA_CERT is not set');
}
 caCert = caCert.replace(/\\n/g, "\n")

// Create postgres connection pool
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // This is ok we use Railway Private Networking
  }
});

// Create drizzle instance  
const db = drizzle(pool, { schema });

// Export schema
export { db, schema };

