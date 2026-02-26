const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Register

router.post('/register', async (req, res) => {
  const { email, password, plan } = req.body;

  try {
    // 1. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Attempt to insert into the database
    const result = await pool.query(
      'INSERT INTO users (email, password, plan) VALUES ($1, $2, $3) RETURNING id, email, plan, created_at',
      [email, hashedPassword, plan || 'Free'] // Default to 'Free' if plan is not provided
    );

    // Success response
    res.status(201).json({ 
      message: "User created successfully.",
      user: result.rows[0] 
    });

  } catch (err) {
    // 3. Specific Error Handling
    if (err.code === '23505') {
      // 23505 = Unique Violation (Duplicate key)
      return res.status(409).json({ 
        error: "This email address is already in use. Please try another one.(TR Email adresi zaten kullanılıyor. Lütfen başka bir tane deneyin.)" 
      });
    }

    // 4. General message for all other unexpected errors
    console.error("Registration error:", err); // Log for developer visibility
    res.status(500).json({ 
      error: "An internal server error occurred. Please try again later.(TR Dahili bir sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.)" 
    });
  }
});
// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Incorrect password' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;