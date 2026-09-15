import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

async function main() {
  const sql = postgres(process.env.DATABASE_URL as string, { max: 1 });
  const db = drizzle(sql);
  
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log("Migrations complete!");
  
  await sql.end();
}
main();
