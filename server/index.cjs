const express = require('express');
const cors = require('cors');
const db = require('./db.cjs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ─── AUTH ─────────────────────────────────────────────────────────────────────

// Signup
app.post('/api/signup', (req, res) => {
  const { name, email, password, pharmacy_name, ods_code, nhs_contract } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const stmt = db.prepare(
    'INSERT INTO users (name, email, password, pharmacy_name, ods_code, nhs_contract) VALUES (?, ?, ?, ?, ?, ?)'
  );
  stmt.run(
    [name, email, password, pharmacy_name || name + ' Pharmacy', ods_code || '', nhs_contract || ''],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        message: 'Signup successful',
        user: {
          id: this.lastID,
          name,
          email,
          pharmacy_name: pharmacy_name || name + ' Pharmacy',
          ods_code: ods_code || '',
          nhs_contract: nhs_contract || ''
        }
      });
    }
  );
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) {
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
  });
});

// ─── PROFILE ──────────────────────────────────────────────────────────────────

// Get profile
app.get('/api/profile/:userId', (req, res) => {
  const { userId } = req.params;
  db.get('SELECT id, name, email, pharmacy_name, ods_code, nhs_contract FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json(row);
  });
});

// Update profile
app.put('/api/profile/:userId', (req, res) => {
  const { userId } = req.params;
  const { name, pharmacy_name, ods_code, nhs_contract } = req.body;
  db.run(
    'UPDATE users SET name = ?, pharmacy_name = ?, ods_code = ?, nhs_contract = ? WHERE id = ?',
    [name, pharmacy_name, ods_code, nhs_contract, userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Profile updated successfully' });
    }
  );
});

// ─── INVOICES ─────────────────────────────────────────────────────────────────

// Get all invoices for a user
app.get('/api/invoices/:userId', (req, res) => {
  const { userId } = req.params;
  db.all('SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!rows || rows.length === 0) {
      // Return default demo invoices if none saved yet
      return res.json([
        {
          id: 'demo-1',
          distributor: 'Alliance Healthcare',
          bill_no: 'ALL/LON/9482',
          date: '15 May 2026',
          amount: '£2,452.10',
          vat_slab: '20% VAT',
          leakage: '£31.20',
          leakage_type: 'Rate Difference',
          status: 'Action Required'
        },
        {
          id: 'demo-2',
          distributor: 'AAH Pharmaceuticals',
          bill_no: 'AAH/DIS/40291',
          date: '12 May 2026',
          amount: '£1,124.50',
          vat_slab: '20% VAT',
          leakage: '£8.20',
          leakage_type: 'Scheme Shortfall',
          status: 'Action Required'
        },
        {
          id: 'demo-3',
          distributor: 'Phoenix Medical',
          bill_no: 'PHX/7821-W',
          date: '08 May 2026',
          amount: '£845.00',
          vat_slab: '20% VAT',
          leakage: '£0',
          leakage_type: 'Fully Matched',
          status: 'Fully Matched'
        }
      ]);
    }
    res.json(rows);
  });
});

// Create a new invoice (simulated OCR upload)
app.post('/api/invoices/:userId', (req, res) => {
  const { userId } = req.params;
  const { distributor, bill_no, date, amount, vat_slab, leakage, leakage_type, status } = req.body;

  db.run(
    'INSERT INTO invoices (user_id, distributor, bill_no, date, amount, vat_slab, leakage, leakage_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [userId, distributor, bill_no, date, amount, vat_slab || '20% VAT', leakage || '£0', leakage_type || 'Fully Matched', status || 'Fully Matched'],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, message: 'Invoice saved' });
    }
  );
});

// Raise a claim on an invoice
app.post('/api/invoices/:invoiceId/claim', (req, res) => {
  const { invoiceId } = req.params;
  // Only update real DB rows (not demo- prefixed)
  if (invoiceId.startsWith('demo-')) {
    return res.json({ message: 'Claim logged (demo mode)' });
  }
  db.run(
    "UPDATE invoices SET status = 'Claim Raised' WHERE id = ?",
    [invoiceId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Claim raised successfully' });
    }
  );
});

// Delete an invoice
app.delete('/api/invoices/:invoiceId', (req, res) => {
  const { invoiceId } = req.params;
  if (invoiceId.startsWith('demo-')) {
    return res.json({ message: 'Demo invoice cleared' });
  }
  db.run('DELETE FROM invoices WHERE id = ?', [req.params.invoiceId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Invoice deleted' });
  });
});

// Clear all invoices for a user
app.delete('/api/invoices/user/:userId', (req, res) => {
  db.run('DELETE FROM invoices WHERE user_id = ?', [req.params.userId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'All invoices cleared' });
  });
});

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`DashRx server (SQLite) running on http://0.0.0.0:${PORT}`);
  console.log('Use with: npm run dev (Vite proxies /api to this port)');
});
