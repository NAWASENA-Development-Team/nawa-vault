import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load .env.local untuk dev lokal, .env untuk production
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
});
