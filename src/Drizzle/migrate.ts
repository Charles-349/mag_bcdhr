import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pkg from "pg";

const { Client } = pkg;

const client = new Client({
  connectionString: process.env.Database_URL,
});

async function main() {
  try {
    console.log("Running migrations...");
    await client.connect();
    const db = drizzle(client);
    await migrate(db, { migrationsFolder: "./src/Drizzle/migrations" });
    console.log("Migrations completed successfully!");
  } catch (err) {
    console.error(" Migration failed:", err);
  } finally {
    await client.end();
    process.exit(0);
  }
}

main();