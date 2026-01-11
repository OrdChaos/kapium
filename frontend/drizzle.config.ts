import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';
config({ path: '.env' });
export default defineConfig({
    schema: './db/schema.ts',
    out: './db/migrations',
    dialect: 'turso',
    dbCredentials: {
        url: process.env.VITE_TURSO_DB_URL!,
        authToken: process.env.VITE_TURSO_DB_AUTH_TOKEN!,
    },
});
