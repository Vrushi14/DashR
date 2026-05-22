const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) { console.error('Error opening database:', err.message); process.exit(1); }
  console.log('Connected to database.');

  db.serialize(() => {
    // Create / migrate users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      pharmacy_name TEXT DEFAULT 'My Pharmacy',
      ods_code TEXT DEFAULT '',
      nhs_contract TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`ALTER TABLE users ADD COLUMN pharmacy_name TEXT DEFAULT 'My Pharmacy'`, () => {});
    db.run(`ALTER TABLE users ADD COLUMN ods_code TEXT DEFAULT ''`, () => {});
    db.run(`ALTER TABLE users ADD COLUMN nhs_contract TEXT DEFAULT ''`, () => {});

    // Create invoices table
    db.run(`CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      distributor TEXT NOT NULL,
      bill_no TEXT NOT NULL,
      date TEXT NOT NULL,
      amount TEXT NOT NULL,
      vat_slab TEXT DEFAULT '20% VAT',
      leakage TEXT DEFAULT '£0',
      leakage_type TEXT DEFAULT 'Fully Matched',
      status TEXT DEFAULT 'Fully Matched',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      qty TEXT NOT NULL,
      billed_rate TEXT NOT NULL,
      contract_rate TEXT NOT NULL,
      variance TEXT NOT NULL,
      total_leakage TEXT NOT NULL
    )`);

    // Seed demo users
    const users = [
      { name: 'Demo Admin',     email: 'admin@dashrx.co.uk',  password: 'Admin@123', pharmacy_name: 'Smiths Pharmacy, London',     ods_code: 'FLF77', nhs_contract: 'NHS-2026-UK' },
      { name: 'Pharmacy Owner', email: 'owner@dashrx.co.uk',  password: 'Owner@123', pharmacy_name: 'Alliance Pharmacy, Manchester', ods_code: 'FLF22', nhs_contract: 'NHS-2026-MCR' },
      { name: 'Test User',      email: 'test@dashrx.co.uk',   password: 'Test@123',  pharmacy_name: 'Boots Pharmacy, Birmingham',   ods_code: 'FLF33', nhs_contract: 'NHS-2026-BHM' },
    ];

    const userStmt = db.prepare('INSERT OR IGNORE INTO users (name, email, password, pharmacy_name, ods_code, nhs_contract) VALUES (?, ?, ?, ?, ?, ?)');
    users.forEach(u => {
      userStmt.run([u.name, u.email, u.password, u.pharmacy_name, u.ods_code, u.nhs_contract], function(err) {
        if (err) {
          console.error(`  x Failed to insert ${u.email}:`, err.message);
        } else if (this.changes > 0) {
          console.log(`  + Seeded: ${u.email}  /  ${u.password}`);
        } else {
          console.log(`  ~ Already exists: ${u.email}`);
        }
      });
    });
    userStmt.finalize();

    // Seed demo invoices for user id=1
    setTimeout(() => {
      db.get('SELECT id FROM users WHERE email = ?', ['admin@dashrx.co.uk'], (err, user) => {
        if (!user) return;
        const invoices = [
          { distributor: 'Alliance Healthcare',  bill_no: 'ALL/LON/9482',  date: '15 May 2026', amount: '£2,452.10', vat_slab: '20% VAT', leakage: '£31.20', leakage_type: 'Rate Difference',  status: 'Action Required' },
          { distributor: 'AAH Pharmaceuticals',  bill_no: 'AAH/DIS/40291', date: '12 May 2026', amount: '£1,124.50', vat_slab: '20% VAT', leakage: '£8.20',  leakage_type: 'Scheme Shortfall', status: 'Action Required' },
          { distributor: 'Phoenix Medical',       bill_no: 'PHX/7821-W',   date: '08 May 2026', amount: '£845.00',   vat_slab: '20% VAT', leakage: '£0',     leakage_type: 'Fully Matched',    status: 'Fully Matched'   },
          { distributor: 'Sigma Pharmaceuticals', bill_no: 'SIG/BHM/5512', date: '04 May 2026', amount: '£612.80',   vat_slab: '5% VAT',  leakage: '£12.50', leakage_type: 'Rate Difference',  status: 'Claim Raised'    },
        ];
        const invStmt = db.prepare('INSERT OR IGNORE INTO invoices (user_id, distributor, bill_no, date, amount, vat_slab, leakage, leakage_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        invoices.forEach(inv => {
          invStmt.run([user.id, inv.distributor, inv.bill_no, inv.date, inv.amount, inv.vat_slab, inv.leakage, inv.leakage_type, inv.status], function(err2) {
            if (!err2 && this.changes > 0) console.log(`  + Invoice seeded: ${inv.bill_no}`);
          });
        });
        invStmt.finalize(() => { console.log('\nSeeding complete.\n'); db.close(); });
      });
    }, 500);
  });
});
