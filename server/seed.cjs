const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to database.');

  // Ensure users table exists
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
      process.exit(1);
    }

    // Seed demo users
    const users = [
      { name: 'Demo Admin',     email: 'admin@dashrx.in',  password: 'Admin@123' },
      { name: 'Pharmacy Owner', email: 'owner@dashrx.in',  password: 'Owner@123' },
      { name: 'Test User',      email: 'test@dashrx.in',   password: 'Test@123'  },
    ];

    const stmt = db.prepare('INSERT OR IGNORE INTO users (name, email, password) VALUES (?, ?, ?)');

    users.forEach(u => {
      stmt.run([u.name, u.email, u.password], function(err) {
        if (err) {
          console.error(`  x Failed to insert ${u.email}:`, err.message);
        } else if (this.changes > 0) {
          console.log(`  + Seeded:         ${u.email}  /  ${u.password}`);
        } else {
          console.log(`  ~ Already exists: ${u.email}`);
        }
      });
    });

    stmt.finalize(() => {
      console.log('\nSeeding complete.\n');
      db.close();
    });
  });
});
