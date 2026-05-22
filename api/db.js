import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env files
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Bypass SSL certificate validation errors (common with Supabase pooler/self-signed certs)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = pg;

const connectionString = 
  process.env.POSTGRES_URL || 
  process.env.POSTGRES_PRISMA_URL || 
  process.env.POSTGRES_URL_NON_POOLING;

const poolConfig = connectionString
  ? { connectionString }
  : {
      user: process.env.POSTGRES_USER,
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DATABASE,
      password: process.env.POSTGRES_PASSWORD,
      port: 5432,
    };

poolConfig.ssl = { rejectUnauthorized: false };

const pool = new Pool(poolConfig);

export default pool;
