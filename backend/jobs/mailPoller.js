const cron = require('node-cron');
const pool = require('../config/db');
const { fetchLastFiveEmails, sendEmail } = require('../services/gmailService');
const axios = require('axios');

const DEPARTMENT_MAIL_MAP = {
  "Lojistik":           process.env.lojistik_mail,
  "Müşteri Hizmetleri": process.env.musteri_hizmetleri_mail,
  "Finans":             process.env.finans_mail,
  "Teknik Destek":      process.env.teknik_destek_mail,
};

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL;

// Prevents overlapping pollAllUsers runs
let isPolling = false;

// ─── DB helpers ───────────────────────────────────────────────────────────────
//? checking if email already processed 
async function isProcessed(userId, messageId) {
  const { rows } = await pool.query(
    'SELECT 1 FROM processed_emails WHERE user_id=$1 AND message_id=$2',
    [userId, messageId]
  );
  return rows.length > 0;
}

//? add email template to processed_emails table 
async function markProcessed(userId, messageId, meta = {}) {
  // Save email before classifying to prevent double-processing
  await pool.query(
    `INSERT INTO processed_emails (user_id, message_id, subject, mail, processed, department, sender)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT DO NOTHING`,
    [userId, messageId, meta.subject ?? null, meta.mail ?? null,
     meta.processed ?? null, meta.department ?? null, meta.sender ?? null]
  );
}

//? update mail by returned python datas
async function updateClassification(userId, messageId, result) {
  const processed = `Fixed Mail:\n${result.fixed_text || '-'}\n\nDepartment: ${result.department || '-'}\nEmotion: ${result.emotion || '-'}`;
  await pool.query(
    'UPDATE processed_emails SET department=$1, processed=$2 WHERE user_id=$3 AND message_id=$4',
    [result.department, processed, userId, messageId]
  );
}

// ──────────────────────────── Classifier ──────────────────────────────────────
//? classify with python service and send email to related department's email address 
//? finally return python results for update mail from processed_emails 
async function classifyAndForward(user, email) {
  try {
    const { data: result } = await axios.post(`${PYTHON_SERVICE_URL}/classify`, {  
      text: `${email.subject}\n${email.body}`
    });

    const { department, emotion, score, fixed_text } = result;
    console.log(`[Classifier] User ${user.id} | "${email.subject}" → ${department} | Emotion: ${emotion} | Score: ${score}`);

    const targetEmail = DEPARTMENT_MAIL_MAP[department];
    if (!targetEmail) {
      console.error(`[Classifier] Unknown department: "${department}"`);
      return result;
    }

    await sendEmail(user, {
      to: targetEmail,
      subject: email.subject,
      body: buildEmailBody({ from: email.from, targetEmail, department, score, fixed_text, emotion, body: email.body })
    });

    console.log(`[Forwarder] User ${user.id} | "${email.subject}" → ${targetEmail}`);
    return result;

  } catch (err) {
    const msg = err.response
      ? `HTTP ${err.response.status}: ${JSON.stringify(err.response.data)}`
      : err.message;
    console.error(`[Classifier] Error - User ${user.id}:`, msg);
    return null;
  }
}

// ─── Email body builder ───────────────────────────────────────────────────────
//? Formatting the email body for emails to be sent.
function buildEmailBody({ from, targetEmail, department, score, fixed_text, emotion, body }) {
  const fields = [
    ['From',                `${from} → ${targetEmail}`],
    ['Predicted Department', department],
    ['Probability',          score],
    ['Fixed/Summary Mail',   fixed_text],
    ['Emotion',              emotion],
    ['Original Mail',        body],
  ];

  const rowsHtml = fields
    .map(([label, value]) => `<b>${label}:</b> ${value}<br/>`)
    .join('\n');

  return `
    <div style="background:#94B4C1;padding:20px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#547792;border-radius:12px;">
          <tr>
            <td align="center" style="background:#213448;color:#FFFCFB;padding:24px;font-size:26px;font-weight:600;
                letter-spacing:1px;font-family:'Trebuchet MS',Arial,sans-serif;border-radius:12px 12px 0 0;">
              AKILLI MAIL ASİSTANI
            </td>
          </tr>
          <tr>
            <td style="padding:24px;color:#F5F5F5;line-height:24px;font-size:15px;font-family:'Times New Roman',Times,serif;">
              ${rowsHtml}
            </td>
          </tr>
        </table>
      </td></tr></table>
    </div>`;
}

// ─────────────── Per-user pipeline ─────────────────────── 
//! brain of mail poller
//? fetch last 5 emails and verify if already does not processed  
//? if not processed, mark as a template form 
//? classify with python service and forward mail
//? finally update mail in processed_emails table with classification result
async function processUser(user) {
  const emails = await fetchLastFiveEmails(user);
  if (!emails.length) return;

  // Emails are processed sequentially to avoid race conditions per user
  for (const email of emails) {
    if (await isProcessed(user.id, email.id)) {
      console.log(`[MailPoller] Skipped (already processed): "${email.subject}"`);
      continue;
    }

    await markProcessed(user.id, email.id, {
      subject: email.subject,
      mail:    email.body,
      sender:  email.from,
    });

    const result = await classifyAndForward(user, email);
    if (result) await updateClassification(user.id, email.id, result);
  }
}

// ───────────────── Poller ───────────────────────────────────────────────
//? get users with tokens from db and
//? process with Promise.allSettled in parallel for each user
async function pollAllUsers() {
 
  if (isPolling) {   // Skip if previous run is still in progress (threading lock)
    console.warn('[MailPoller] Previous run still active, skipping...');
    return;
  }

  isPolling = true;
  try {
    const { rows: users } = await pool.query(    //return json array of users with tokens
      `SELECT id, gmail_address, mail_token, mail_access_token, mail_token_expiry
       FROM users WHERE mail_token IS NOT NULL`
    );

    console.log(`[MailPoller] Checking ${users.length} user(s)...`);

    // Process all users in parallel — each catches its own errors
    await Promise.allSettled(
      users.map(user =>
        processUser(user).catch(err =>
          console.error(`[MailPoller] User ${user.id} error:`, err.message)
        )
      )
    );

  } catch (err) {
    console.error('[MailPoller] General error:', err);
  } finally {
    isPolling = false; // Always release lock, even on error
  }
}

// ───────────────── Entry point ─────────────────────────────────────────

function startMailPoller() {        // runs every 5 minutes and calls pollAllUsers()
  console.log('[MailPoller] Started — runs every 5 minutes');
  pollAllUsers();
  cron.schedule('*/5 * * * *', pollAllUsers);
}

module.exports = { startMailPoller };