const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');

    db.serialize(() => {
      // Users table with pharmacy profile fields
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

      // Add new columns if upgrading from old schema
      db.run(`ALTER TABLE users ADD COLUMN pharmacy_name TEXT DEFAULT 'My Pharmacy'`, () => {});
      db.run(`ALTER TABLE users ADD COLUMN ods_code TEXT DEFAULT ''`, () => {});
      db.run(`ALTER TABLE users ADD COLUMN nhs_contract TEXT DEFAULT ''`, () => {});

      // Invoices / supplier statements table
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`);

      // Invoice line items table
      db.run(`CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        qty TEXT NOT NULL,
        billed_rate TEXT NOT NULL,
        contract_rate TEXT NOT NULL,
        variance TEXT NOT NULL,
        total_leakage TEXT NOT NULL,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id)
      )`);
    });
  }
});

module.exports = db;
