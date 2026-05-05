const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const pool    = require('../config/db');
const auth    = require('../middleware/auth');

//! ────────────────── Helpers ──────────────────

const signToken = (user) =>     // signs a jsonwebtoken including user id and email, expires in 1 hour
  jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' }); 

const asyncHandler = (fn) => (req, res, next) =>       
  Promise.resolve(fn(req, res, next)).catch(next); 
  //? Wrapper function that reduces try-catch blocks.
  //? every response returns a promise. fn => async
  //? we catch with catch(next) and next is a function that is called when an error occurs.
  //? Instead of examining error codes individually for each functions, we specify them all at once with global error handling.
    

//! ────────────────── Routes ──────────────────

// REGISTER
router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, plan } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    'INSERT INTO users (email, password, plan) VALUES ($1, $2, $3) RETURNING id, email, plan, created_at',
    [email, hashedPassword, plan ?? 'Free']
  );

  res.status(201).json({ message: 'User created successfully.', user: rows[0] });
}));

// LOGIN
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
  if (!rows.length) return res.status(404).json({ error: 'User not found' });

  const user  = rows[0];
  const match = await bcrypt.compare(password, user.password);  // compare password with hashed password
  if (!match) return res.status(401).json({ error: 'Incorrect password' });

  res.json({ token: signToken(user) });
}));

// DELETE ACCOUNT
router.delete('/delete-account', auth, asyncHandler(async (req, res) => {
  const { id } = req.user;
  await pool.query('DELETE FROM processed_emails WHERE user_id=$1', [id]);
  await pool.query('DELETE FROM users WHERE id=$1', [id]);
  res.json({ message: 'Hesap başarıyla silindi.' });
}));

// DISCONNECT GMAIL
router.delete('/disconnect-gmail', auth, asyncHandler(async (req, res) => {
  const { id } = req.user;
  await pool.query('DELETE FROM processed_emails WHERE user_id=$1', [id]);
  await pool.query(
    `UPDATE users SET
      mail_token=NULL, mail_access_token=NULL,
      mail_token_expiry=NULL, gmail_address=NULL
     WHERE id=$1`,
    [id]
  );
  res.json({ message: 'Gmail bağlantısı kesildi, işlenmiş mailler temizlendi.' });
}));

//! ────────────────── Global error handler ──────────────────
router.use((err, req, res, next) => {
  if (err.code === '23505') return res.status(409).json({ error: 'Bu email zaten kullanımda.' });
  console.error(err);
  res.status(500).json({ error: 'Sunucu hatası.' });
});

module.exports = router;