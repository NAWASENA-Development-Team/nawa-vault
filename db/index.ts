/**
 * db/index.ts — Standard PostgreSQL connection via postgres.js
 *
 * Driver: postgres (postgres.js) — lebih lightweight dari node-postgres (pg),
 * kompatibel dengan Netlify Functions (Node.js runtime), dan bekerja sangat
 * baik dengan PgBouncer di transaction pooling mode.
 *
 * PgBouncer transaction mode tidak support prepared statements,
 * jadi kita disable di sini.
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

// Singleton — penting untuk Netlify Functions agar tidak membuat
// terlalu banyak koneksi baru saat function di-invoke berulang kali.
// Next.js caches module di warm lambda, jadi ini aman.
const globalForDb = globalThis as unknown as { _pgClient?: postgres.Sql };

const client =
  globalForDb._pgClient ??
  postgres(process.env.DATABASE_URL!, {
    max: 10,                  // max connections dari satu function instance
    idle_timeout: 20,         // detik sebelum koneksi idle ditutup
    connect_timeout: 10,      // timeout saat connect
    prepare: false,           // WAJIB false untuk PgBouncer transaction mode
    ssl: process.env.DATABASE_SSL === 'true'
      ? { rejectUnauthorized: false }  // ganti ke true jika punya SSL cert valid
      : false,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb._pgClient = client;
}

export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === 'development',
});