const { google } = require('googleapis');
const { createOAuthClient } = require('../config/google');
const { encrypt, decrypt } = require('./cryptoService');
const pool = require('../config/db');

async function getAuthenticatedClient(user) {
  const oauth2Client = createOAuthClient(); //create OAuth client 

  oauth2Client.setCredentials({             // set credentials
    refresh_token: decrypt(user.mail_token),
    access_token: decrypt(user.mail_access_token),
    expiry_date: user.mail_token_expiry
  });

  // check token if expired, refresh it and update in database
  if (Date.now() >= user.mail_token_expiry - 60000) { //check token expiry
    const { credentials } = await oauth2Client.refreshAccessToken();
    await pool.query(
      `UPDATE users SET mail_access_token=$1, mail_token_expiry=$2 WHERE id=$3`,
      [encrypt(credentials.access_token), credentials.expiry_date, user.id]
    );
    oauth2Client.setCredentials(credentials);
  }

  return oauth2Client;
}

async function fetchNewEmails(user, seenMessageIds = new Set()) {  // using Set for save seen emails ids for quick lookup
  const auth = await getAuthenticatedClient(user);        // get authenticated google client to access inbox
  const gmail = google.gmail({ version: 'v1', auth });    // Launch the Gmail client, which will communicate with gmail services.

  const listRes = await gmail.users.messages.list({       // list last 5 emails with mail's id from inbox
    userId: 'me',
    maxResults: 5,
    labelIds: ['INBOX']
  });

  const messages = listRes.data.messages || [];         // seen emails id
  const newEmails = [];

  for (const msg of messages) {
    if (seenMessageIds.has(msg.id)) continue;           // .has() return boolean. skip if already seen emails

    const detail = await gmail.users.messages.get({     // pull full email details with id
      userId: 'me',
      id: msg.id,
      format: 'full'
    });

    const headers = detail.data.payload.headers;      // extract headers from email's header 
    const getHeader = (name) => headers.find(h => h.name === name)?.value || ''; // helper function to get specific header value

    // Body parse
    let body = '';
    const parts = detail.data.payload.parts;
    if (parts) {
      const textPart = parts.find(p => p.mimeType === 'text/plain') // default text
                    || parts.find(p => p.mimeType === 'text/html'); // html format 
      //? textPart is a json object that contains partId mimtype etc and body {size:.., data:..., etc}
      if (textPart?.body?.data) {
      //? use replace to convert base64url to base64, then decode it to utf-8 string
        body = Buffer.from(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
      }
    } else if (detail.data.payload.body?.data) { // if no parts, try to get body from payload
      body = Buffer.from(detail.data.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
    }

    // Add emails to new emails list
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
  const auth = await getAuthenticatedClient(user);  // get authenticated google client
  const gmail = google.gmail({ version: 'v1', auth }); // Launch the Gmail client, which will communicate with gmail services.

  const message = [                                 // create raw email message with headers and body
    `From: ${user.gmail_address}`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'Content-Type: text/html; charset=utf-8',
    '',
    body
  ].join('\n'); // for new line

  //? gmail api requires base64url format, so we convert it to base64url
  const raw = Buffer.from(message)  // text to binary
    .toString('base64')             // binary to base64
    .replace(/\+/g, '-')            // base64 to base64url
    .replace(/\//g, '_')
    .replace(/=+$/, '');

    // send email with gmail api
  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw }
  });
    // response data messageId, labelIds, etc. 
  return res.data;
}

module.exports = { fetchNewEmails, sendEmail, getAuthenticatedClient };