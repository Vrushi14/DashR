import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = pg;

function normalizeConnectionString(url) {
  if (!url?.trim()) return '';
  let trimmed = url.trim();
  if (trimmed.startsWith('postgres://')) {
    trimmed = trimmed.replace(/^postgres:\/\//, 'postgresql://');
  }
  // pg v8 treats sslmode=require as strict verify; Supabase needs libpq-compat
  if (trimmed.includes('sslmode=require') && !trimmed.includes('uselibpqcompat=')) {
    const sep = trimmed.includes('?') ? '&' : '?';
    trimmed += `${sep}uselibpqcompat=true`;
  }
  return trimmed;
}

const sslConfig = { rejectUnauthorized: false };

const connectionString = normalizeConnectionString(
  process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING
);

const initConnectionString = normalizeConnectionString(
  process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL
);

const hasConnectionString = Boolean(connectionString);
const hasDiscreteConfig = Boolean(
  process.env.POSTGRES_HOST &&
  process.env.POSTGRES_USER &&
  process.env.POSTGRES_DATABASE
);

export function isDbConfigured() {
  return hasConnectionString || hasDiscreteConfig;
}

function buildPoolConfig() {
  if (hasConnectionString) {
    return {
      connectionString,
      ssl: sslConfig,
      max: 2,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    };
  }

  if (hasDiscreteConfig) {
    return {
      user: process.env.POSTGRES_USER,
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DATABASE,
      password: process.env.POSTGRES_PASSWORD,
      port: Number(process.env.POSTGRES_PORT) || 5432,
      ssl: sslConfig,
      max: 2,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    };
  }

  return null;
}

const poolConfig = buildPoolConfig();
const pool = poolConfig ? new Pool(poolConfig) : null;

/** Direct connection for CREATE TABLE (Supabase pooler port 6543 cannot run all DDL). */
let initPool = null;
if (initConnectionString) {
  initPool = new Pool({
    connectionString: initConnectionString,
    ssl: sslConfig,
    max: 1,
    connectionTimeoutMillis: 15000,
  });
}

export async function runSchemaInit(queries) {
  const client = initPool || pool;
  if (!client) throw new Error('Database not configured');
  for (const sql of queries) {
    await client.query(sql);
  }
}

export default pool;

export async function testConnection() {
  if (!pool) {
    return { ok: false, error: 'POSTGRES_URL is not set in environment variables.' };
  }
  try {
    await pool.query('SELECT 1');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export function mapDbError(err) {
  const msg = err?.message || String(err);
  if (!isDbConfigured()) {
    return 'Database is not configured. Set POSTGRES_URL in Vercel (or .env.local for local API).';
  }
  if (/ECONNREFUSED|ENOTFOUND|ETIMEDOUT|timeout/i.test(msg)) {
    return 'Cannot connect to the database server. Check POSTGRES_URL and that the database allows connections from Vercel.';
  }
  if (/password|authentication|SASL/i.test(msg)) {
    return 'Database authentication failed. Check your database username and password in POSTGRES_URL.';
  }
  if (/SSL|certificate/i.test(msg)) {
    return 'Database SSL connection failed. Try a connection string with ?sslmode=require from your provider.';
  }
  return 'Database error. Please try again later or contact support.';
}
