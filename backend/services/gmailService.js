const { google } = require('googleapis');
const { createOAuthClient } = require('../config/google');
const { encrypt, decrypt } = require('./cryptoService');
const pool = require('../config/db');

async function getAuthenticatedClient(user) {
  const oauth2Client = createOAuthClient();

  oauth2Client.setCredentials({
    refresh_token: decrypt(user.mail_token),
    access_token: decrypt(user.mail_access_token),
    expiry_date: user.mail_token_expiry
  });

  // Token süresi dolduysa yenile
  if (Date.now() >= user.mail_token_expiry - 60000) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    await pool.query(
      `UPDATE users SET mail_access_token=$1, mail_token_expiry=$2 WHERE id=$3`,
      [encrypt(credentials.access_token), credentials.expiry_date, user.id]
    );
    oauth2Client.setCredentials(credentials);
  }

  return oauth2Client;
}

async function fetchNewEmails(user, seenMessageIds = new Set()) {
  const auth = await getAuthenticatedClient(user);
  const gmail = google.gmail({ version: 'v1', auth });

  const listRes = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 5,
    labelIds: ['INBOX']
  });

  const messages = listRes.data.messages || [];
  const newEmails = [];

  for (const msg of messages) {
    if (seenMessageIds.has(msg.id)) continue;

    const detail = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id,
      format: 'full'
    });

    const headers = detail.data.payload.headers;
    const getHeader = (name) => headers.find(h => h.name === name)?.value || '';

    // Body parse
    let body = '';
    const parts = detail.data.payload.parts;
    if (parts) {
      const textPart = parts.find(p => p.mimeType === 'text/plain')
                    || parts.find(p => p.mimeType === 'text/html');
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
      }
    } else if (detail.data.payload.body?.data) {
      body = Buffer.from(detail.data.payload.body.data, 'base64').toString('utf-8');
    }

    newEmails.push({
      id: msg.id,
      from: getHeader('From'),
      to: getHeader('To'),
      subject: getHeader('Subject'),
      date: getHeader('Date'),
      snippet: detail.data.snippet,
      body
    });
  }

  return newEmails;
}

async function sendEmail(user, { to, subject, body }) {
  const auth = await getAuthenticatedClient(user);
  const gmail = google.gmail({ version: 'v1', auth });

  const message = [
    `From: ${user.gmail_address}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/html; charset=utf-8',
    '',
    body
  ].join('\n');

  const raw = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw }
  });

  return res.data;
}

module.exports = { fetchNewEmails, sendEmail, getAuthenticatedClient };