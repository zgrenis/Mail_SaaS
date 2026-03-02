const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { createOAuthClient, SCOPES } = require('../config/google');
const { encrypt } = require('../services/cryptoService');
const { sendEmail } = require('../services/gmailService');

// JWT middleware — user.routes.js'deki mantıkla aynı
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token gerekli' });

  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Geçersiz token' });
  }
}

// GET /api/gmail/connect — frontend bu URL'i açar
router.get('/connect', authMiddleware, (req, res) => {
  const oauth2Client = createOAuthClient();
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state: req.user.id.toString()
  });
  res.json({ url });
});

// GET /api/gmail/callback — Google buraya yönlendirir
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  const userId = parseInt(state);

  if (!code || !userId) {
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard?gmail=error`);
  }

  try {
    const oauth2Client = createOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard?gmail=no_refresh_token`);
    }

    // Gmail adresini al
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    // Şifrele ve kaydet
    await pool.query(
      `UPDATE users SET
        mail_token=$1,
        mail_access_token=$2,
        mail_token_expiry=$3,
        gmail_address=$4
       WHERE id=$5`,
      [
        encrypt(tokens.refresh_token),
        encrypt(tokens.access_token),
        tokens.expiry_date,
        data.email,
        userId
      ]
    );

    res.redirect(`${process.env.FRONTEND_URL}/dashboard?gmail=connected`);
  } catch (err) {
    console.error('[Gmail Callback] Hata:', err);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?gmail=error`);
  }
});

// POST /api/gmail/send
router.post('/send', authMiddleware, async (req, res) => {
  const { to, subject, body } = req.body;

  try {
    const { rows } = await pool.query(
      `SELECT id, gmail_address, mail_token, mail_access_token, mail_token_expiry
       FROM users WHERE id=$1`,
      [req.user.id]
    );

    const user = rows[0];
    if (!user?.mail_token) {
      return res.status(400).json({ error: 'Gmail hesabı bağlı değil' });
    }

    const result = await sendEmail(user, { to, subject, body });
    res.json({ success: true, messageId: result.id });
  } catch (err) {
    console.error('[Gmail Send] Hata:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/gmail/disconnect
router.delete('/disconnect', authMiddleware, async (req, res) => {
  await pool.query(
    `UPDATE users SET mail_token=NULL, mail_access_token=NULL,
     mail_token_expiry=NULL, gmail_address=NULL WHERE id=$1`,
    [req.user.id]
  );
  res.json({ success: true });
});

module.exports = router;