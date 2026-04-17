const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { createOAuthClient, SCOPES } = require('../config/google');
const { encrypt } = require('../services/cryptoService');
const { sendEmail } = require('../services/gmailService');
const authMiddleware = require('../middleware/auth');

// GOOGLE PAGE GET /api/gmail/connect — request with bearer token, returns Google OAuth URL
router.get('/connect', authMiddleware, (req, res) => {
  const oauth2Client = createOAuthClient();
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state: req.user.id.toString() // which user is connecting their Gmail, will be used in callback to identify
  });
  res.json({ url });
});

// SAVE TOKENS GET /api/gmail/callback — REDIRECT_URI
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query; // code is the authorization apply code for one usage ...?code=4/0..
  const userId = parseInt(state);

  if (!code || !userId) {
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard?gmail=error`);
  }

  try {
    const oauth2Client = createOAuthClient();
    const { tokens } = await oauth2Client.getToken(code); // verify with code & 
    // get  mail_token(refresh_token), mail_access_token (access_token), mail_token_expiry (expiry_date)
    
    //? mail_token (refresh_token): long time token. if token is expired, we can use refresh_token to get new access_token.
    //?                            it reminds Google that the user has given permission and allows us to obtain an access key.

    //? mail_access_token (access_token): short time token. we use this token to access Gmail API.
    //? mail_token_expiry (expiry_date): access_token's expiry date just in milliseconds unix format.   
    



    if (!tokens.refresh_token) {                          // if no refresh token or lifetime is over, user needs to reconnect
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard?gmail=no_refresh_token`);
    }

    // get gmail address
    oauth2Client.setCredentials(tokens);     // set credentials to get user info
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

    res.redirect(`${process.env.GOOGLE_REDIRECT_URI}`);
  } catch (err) {
    console.error('[Gmail Callback] Hata:', err);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?gmail=error`);
  }
  } catch (error) {
     console.error('[Gmail Callback] Detaylı hata:', JSON.stringify(err, null, 2));
  res.redirect(`${process.env.FRONTEND_URL}/dashboard?gmail=error&reason=${err.message}`);
  }
});






//? POST /api/gmail/send  just for test
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

module.exports = router;