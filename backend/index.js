const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'db',
  user: 'dockuser',
  password: 'dockpassword',
  database: 'dockstack'
});

db.connect(err => {
  if (err) {
    console.error('DB connection error:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  db.ping(err => {
    if (err) {
      console.error('DB ping failed:', err);
      return res.status(500).json({ status: 'DOWN', error: err.message });
    }
    res.status(200).json({ status: 'UP' });
  });
});

// Existing API
app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.listen(5000, () => {
  console.log('Backend running on port 5000');
});