import 'dotenv/config';
import type { Config } from 'drizzle-kit';
import {DATABASE_URL} from './src/db';

export default {
  schema: './src/db/schema.ts',
  out: './db',
  driver: 'pg', 
  dbCredentials: {
    connectionString: DATABASE_URL,
  },
} satisfies Config;