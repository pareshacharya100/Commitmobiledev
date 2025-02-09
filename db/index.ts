import pkg from 'pg';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '@db/schema';

const { Pool } = pkg;  // This ensures we use the correct syntax for importing the `Pool`

const DATABASE_URL =
  'postgres://postgres:Commit1212@database-1.cr0oqaqes3iv.us-east-1.rds.amazonaws.com:5432/postgres';

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
}

// Set up a connection pool
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for cloud-hosted databases
  },
});

// Initialize Drizzle ORM
export const db = drizzle(pool, { schema });

// Example query to test the connection (correct query usage)
(async () => {
  try {
    const result = await db.select().from(schema.users);
    //const result = await db.select().from(schema.users); // Corrected query method
    console.log('Connected to the database successfully:', result);
  } catch (error) {
    console.error('Database connection failed:', error);
  }
})();
