import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const {
  DB_HOST,
  DB_PORT,
  DB_ROOT_PASSWORD,
  DB_DATABASE,
  DB_USERNAME,
  DB_PASSWORD,
  DB_SHADOW_DATABASE,
} = process.env;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: `mysql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`,
    shadowDatabaseUrl: `mysql://root:${DB_ROOT_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_SHADOW_DATABASE}`,
  },
});
