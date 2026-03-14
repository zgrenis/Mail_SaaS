const { google } = require('googleapis'); //connect to google ecosystem

function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID, //client id from google cloud console
    process.env.GOOGLE_CLIENT_SECRET, //client secret from google cloud console
    process.env.GOOGLE_REDIRECT_URI //redirect URI from google cloud console
  );
}

// specifying permissions to the user
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email'
];

module.exports = { createOAuthClient, SCOPES };