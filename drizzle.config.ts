import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql", 
    schema: "./src/Drizzle/schema.ts",
    out: "./src/Drizzle/migrations", 
    dbCredentials: { // database connection details
        url: process.env.Database_URL as string
    },
    verbose: true, // enables detailed logging
    strict: true, // enables strict mode for type safety
});