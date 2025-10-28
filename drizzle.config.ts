import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './src/drizzle/migration',
  schema: './drizzle/schema.ts',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});