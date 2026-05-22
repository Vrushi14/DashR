import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import pool, { isDbConfigured, testConnection, mapDbError } from './db.js';

const app = express();

app.use(cors());
app.use(express.json());

function requireDb(res) {
  if (!isDbConfigured() || !pool) {
    res.status(503).json({
      error:
        'Database is not configured. Set POSTGRES_URL in Vercel Project Settings → Environment Variables, then redeploy.',
    });
    return false;
  }
  return true;
}

// ─── INIT TABLES ──────────────────────────────────────────────────────────────
async function initDB() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      pharmacy_name TEXT DEFAULT 'My Pharmacy',
      ods_code TEXT DEFAULT '',
      nhs_contract TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      distributor TEXT NOT NULL,
      bill_no TEXT NOT NULL,
      date TEXT NOT NULL,
      amount TEXT NOT NULL,
      vat_slab TEXT DEFAULT '20% VAT',
      leakage TEXT DEFAULT '£0',
      leakage_type TEXT DEFAULT 'Fully Matched',
      status TEXT DEFAULT 'Fully Matched',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id SERIAL PRIMARY KEY,
      invoice_id INTEGER NOT NULL REFERENCES invoices(id),
      name TEXT NOT NULL,
      qty TEXT NOT NULL,
      billed_rate TEXT NOT NULL,
      contract_rate TEXT NOT NULL,
      variance TEXT NOT NULL,
      total_leakage TEXT NOT NULL
    )
  `);
}

initDB().catch((err) => console.error('DB init failed:', err.message));

// ─── AUTH ─────────────────────────────────────────────────────────────────────

// Signup
app.post('/api/signup', async (req, res) => {
  if (!requireDb(res)) return;
  const { name, email, password, pharmacy_name, ods_code, nhs_contract } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email, password, pharmacy_name, ods_code, nhs_contract) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [name, email, password, pharmacy_name || name + ' Pharmacy', ods_code || '', nhs_contract || '']
    );
    res.status(201).json({
      message: 'Signup successful',
      user: {
        id: result.rows[0].id,
        name,
        email,
        pharmacy_name: pharmacy_name || name + ' Pharmacy',
        ods_code: ods_code || '',
        nhs_contract: nhs_contract || ''
      }
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Signup error:', err.message);
    res.status(500).json({ error: mapDbError(err) });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  if (!requireDb(res)) return;
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length > 0) {
      const row = result.rows[0];
      res.json({
        message: 'Login successful',
        user: {
          id: row.id,
          name: row.name,
          email: row.email,
          pharmacy_name: row.pharmacy_name || row.name + ' Pharmacy',
          ods_code: row.ods_code || '',
          nhs_contract: row.nhs_contract || ''
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: mapDbError(err) });
  }
});

// ─── PROFILE ──────────────────────────────────────────────────────────────────

// Get profile
app.get('/api/profile/:userId', async (req, res) => {
  if (!requireDb(res)) return;
  try {
    const result = await pool.query(
      'SELECT id, name, email, pharmacy_name, ods_code, nhs_contract FROM users WHERE id = $1',
      [req.params.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: mapDbError(err) });
  }
});

// Update profile
app.put('/api/profile/:userId', async (req, res) => {
  if (!requireDb(res)) return;
  const { name, pharmacy_name, ods_code, nhs_contract } = req.body;
  try {
    await pool.query(
      'UPDATE users SET name = $1, pharmacy_name = $2, ods_code = $3, nhs_contract = $4 WHERE id = $5',
      [name, pharmacy_name, ods_code, nhs_contract, req.params.userId]
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: mapDbError(err) });
  }
});

// ─── INVOICES ─────────────────────────────────────────────────────────────────

// Get all invoices for a user
app.get('/api/invoices/:userId', async (req, res) => {
  if (!requireDb(res)) return;
  try {
    const result = await pool.query(
      'SELECT * FROM invoices WHERE user_id = $1 ORDER BY created_at DESC',
      [req.params.userId]
    );
    if (result.rows.length === 0) {
      return res.json([
        { id: 'demo-1', distributor: 'Alliance Healthcare', bill_no: 'ALL/LON/9482', date: '15 May 2026', amount: '£2,452.10', vat_slab: '20% VAT', leakage: '£31.20', leakage_type: 'Rate Difference', status: 'Action Required' },
        { id: 'demo-2', distributor: 'AAH Pharmaceuticals', bill_no: 'AAH/DIS/40291', date: '12 May 2026', amount: '£1,124.50', vat_slab: '20% VAT', leakage: '£8.20', leakage_type: 'Scheme Shortfall', status: 'Action Required' },
        { id: 'demo-3', distributor: 'Phoenix Medical', bill_no: 'PHX/7821-W', date: '08 May 2026', amount: '£845.00', vat_slab: '20% VAT', leakage: '£0', leakage_type: 'Fully Matched', status: 'Fully Matched' }
      ]);
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: mapDbError(err) });
  }
});

// Create a new invoice
app.post('/api/invoices/:userId', async (req, res) => {
  if (!requireDb(res)) return;
  const { distributor, bill_no, date, amount, vat_slab, leakage, leakage_type, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO invoices (user_id, distributor, bill_no, date, amount, vat_slab, leakage, leakage_type, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id',
      [req.params.userId, distributor, bill_no, date, amount, vat_slab || '20% VAT', leakage || '£0', leakage_type || 'Fully Matched', status || 'Fully Matched']
    );
    res.status(201).json({ id: result.rows[0].id, message: 'Invoice saved' });
  } catch (err) {
    res.status(500).json({ error: mapDbError(err) });
  }
});

// Raise a claim on an invoice
app.post('/api/invoices/:invoiceId/claim', async (req, res) => {
  if (!requireDb(res)) return;
  if (req.params.invoiceId.startsWith('demo-')) {
    return res.json({ message: 'Claim logged (demo mode)' });
  }
  try {
    await pool.query("UPDATE invoices SET status = 'Claim Raised' WHERE id = $1", [req.params.invoiceId]);
    res.json({ message: 'Claim raised successfully' });
  } catch (err) {
    res.status(500).json({ error: mapDbError(err) });
  }
});

// Delete an invoice
app.delete('/api/invoices/:invoiceId', async (req, res) => {
  if (!requireDb(res)) return;
  if (req.params.invoiceId.startsWith('demo-')) {
    return res.json({ message: 'Demo invoice cleared' });
  }
  try {
    await pool.query('DELETE FROM invoices WHERE id = $1', [req.params.invoiceId]);
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ error: mapDbError(err) });
  }
});

// Clear all invoices for a user
app.delete('/api/invoices/user/:userId', async (req, res) => {
  if (!requireDb(res)) return;
  try {
    await pool.query('DELETE FROM invoices WHERE user_id = $1', [req.params.userId]);
    res.json({ message: 'All invoices cleared' });
  } catch (err) {
    res.status(500).json({ error: mapDbError(err) });
  }
});

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  if (!isDbConfigured()) {
    return res.status(503).json({
      status: 'error',
      database: 'not_configured',
      message: 'POSTGRES_URL is missing. Add it in Vercel environment variables.',
      timestamp: new Date().toISOString(),
    });
  }
  const db = await testConnection();
  if (!db.ok) {
    return res.status(503).json({
      status: 'error',
      database: 'unreachable',
      message: db.error,
      timestamp: new Date().toISOString(),
    });
  }
  res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
});

export default app;

// Local Postgres API (optional): node api/index.js
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DashRx API (Postgres) on http://0.0.0.0:${PORT}`);
    if (!isDbConfigured()) {
      console.warn('Warning: POSTGRES_URL not set — login/signup will fail until .env.local is configured.');
    }
  });
}
