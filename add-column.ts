import { config } from 'dotenv';
config({ path: '.env.local' });
import { sql } from 'drizzle-orm';

async function main() {
  const { db } = await import('./db/index.js');
  try {
    await db.execute(sql`ALTER TABLE assets ADD COLUMN base_location varchar(100);`);
    console.log("Column added successfully!");
  } catch (e) {
    console.error("Error or column already exists:", e);
  }
  process.exit(0);
}
main();
