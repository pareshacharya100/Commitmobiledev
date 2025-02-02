import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "pg";
import * as schema from "@db/schema";

const DATABASE_URL = "postgres://postgres:Commit1212@database-1.cr0oqaqes3iv.us-east-1.rds.amazonaws.com:5432/postgres";

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
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

// Example query to test the connection
(async () => {
  try {
    const result = await db.query(schema.users); // Replace `schema.users` with your actual table
    console.log("Connected to the database successfully:", result);
  } catch (error) {
    console.error("Database connection failed:", error);
  }
})();
