const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

// REGISTER
router.post('/register', async (req, res) => {
  const { email, password, plan } = req.body;
  console.log("Register request body:", req.body); // Log request body
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    // add new user to database
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
    // specific error handling for unique constraint violation (email already exists)
    if (err.code === '23505') {
      return res.status(409).json({ 
        error: "This email address is already in use. Please try another one.(TR Email adresi zaten kullanılıyor. Lütfen başka bir tane deneyin.)" 
      });
    }

    // general error
    console.error("Registration error:", err); //! Log for developer visibility
    res.status(500).json({ 
      error: "An internal server error occurred. Please try again later.(TR Dahili bir sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.)" 
    });
  }
});

// LOGIN
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

// DELETE ACCOUNT
router.delete('/delete-account', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM processed_emails WHERE user_id=$1', [req.user.id]);
    await pool.query('DELETE FROM users WHERE id=$1', [req.user.id]);
    res.json({ message: 'Hesap başarıyla silindi.' });
  } catch (err) {
    console.error('Hesap silme hatası:', err);
    res.status(500).json({ error: err.message });
  }
});

// REMOVE GMAIL CONNECTION
router.delete('/disconnect-gmail', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM processed_emails WHERE user_id=$1', [req.user.id]);
    await pool.query(
      `UPDATE users SET 
        mail_token=NULL, 
        mail_access_token=NULL, 
        mail_token_expiry=NULL, 
        gmail_address=NULL 
       WHERE id=$1`,
      [req.user.id]
    );
    res.json({ message: 'Gmail bağlantısı kesildi, işlenmiş mailler temizlendi.' });
  } catch (err) {
    console.error('Gmail disconnect hatası:', err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;