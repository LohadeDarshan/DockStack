const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = 5000;

app.use(express.json());

// ✅ FIX 3: Single connection ki jagah CONNECTION POOL use karo
// Pool automatically reconnect karta hai agar connection drop ho jaaye
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'dockstack',
  user: process.env.DB_USER || 'dockuser',
  password: process.env.DB_PASSWORD || 'dockpassword',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // ✅ FIX 4: Stale connections ko auto-handle karo
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Promise wrapper for cleaner async/await usage
const db = pool.promise();

// ✅ FIX 5: Startup pe DB connection verify karo with retry
async function waitForDB(retries = 10, delay = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      const [rows] = await db.query('SELECT 1');
      console.log('✅ DB connected successfully');
      return true;
    } catch (err) {
      console.log(`⏳ DB connection attempt ${i}/${retries} failed: ${err.message}`);
      if (i === retries) {
        console.error('❌ Could not connect to DB after all retries');
        process.exit(1);
      }
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

// Health check endpoint — Jenkins pipeline isko check karta hai
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({ status: 'UP', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'DOWN', error: err.message });
  }
});

// Users fetch endpoint
app.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// App start — pehle DB ready karo, phir server listen karo
async function startServer() {
  console.log('🔄 Waiting for database connection...');
  await waitForDB();

  app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
  });
}

startServer();