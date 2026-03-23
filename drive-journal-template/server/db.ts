import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';

// This is commented out by default. Uncomment when connecting to a real database
/*
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
*/

// Use a mock DB interface for now that doesn't need a real connection
// This allows the template to work without database setup
export const db = {
  select: () => ({
    from: () => ({
      where: () => []
    })
  }),
  insert: () => ({
    values: () => ({
      returning: () => []
    })
  }),
  update: () => ({
    set: () => ({
      where: () => ({
        returning: () => []
      })
    })
  }),
  delete: () => ({
    where: () => {}
  })
} as any;