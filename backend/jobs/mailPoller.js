const cron = require('node-cron');
const pool = require('../config/db');
const { fetchNewEmails, sendEmail } = require('../services/gmailService');

// relevant departments 
const DEPARTMENT_MAIL_MAP = {
  "Lojistik": process.env.lojistik_mail,
  "Müşteri Hizmetleri": process.env.musteri_hizmetleri_mail,
  "Finans": process.env.finans_mail,
  "Teknik Destek": process.env.teknik_destek_mail
};
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL;

async function isProcessed(userId, messageId) {       // check if email is already processed for user
  const { rows } = await pool.query(
    'SELECT 1 FROM processed_emails WHERE user_id=$1 AND message_id=$2', // returns 1 if found, otherwise empty result
    [userId, messageId]
  );
  return rows.length > 0;  // 1 or 0  
}

// save processed email
async function markProcessed(userId, messageId, meta = {}) { //meta ={} prevent error in empty situtions
  await pool.query(
    `INSERT INTO processed_emails 
      (user_id, message_id, subject, mail, processed, department, sender) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) 
     ON CONFLICT DO NOTHING`,                   //! if same email comes again, skip it without error
    [
      userId,
      messageId,
      meta.subject || null,
      meta.mail || null,
      meta.processed || null,
      meta.department || null,
      meta.sender || null
    ]
  );
}

//process and forward emails to relevant departments
async function classifyAndForward(user, email) {
  let result = null; 
  
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `${email.subject}\n${email.body}` })
    });

    result = await response.json(); // convert response to json
    const department = result.department; // extract department from response

    // Log classification result for debugging
    console.log(`[Classifier] User ${user.id} - "${email.subject}"`);
    console.log(`  → Departman: ${department}`);
    console.log(`  → Duygu: ${result.duygu}`);
    console.log(`  → Skor: ${result.score}`);
    const targetEmail = DEPARTMENT_MAIL_MAP[department]; //mail address search in map
    if (!targetEmail) {     // not defined department
      console.error(`[Classifier] Bilinmeyen departman: ${department}`);
      return result;
    }

    await sendEmail(user, {
      to: targetEmail,
      subject: email.subject,
      body: `
        <div style="background:#94B4C1; padding:20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#547792; border-radius:12px;">
                  <tr>
                    <td align="center" style="background:#213448;color:#FFFCFB;padding:24px;font-size:26px;font-weight:600;letter-spacing:1px;font-family:'Trebuchet MS',Arial,sans-serif;border-radius:12px 12px 0 0;">
                      AKILLI MAIL ASİSTANI
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:24px;color:#F5F5F5;line-height:24px;font-size:15px;font-family:'Times New Roman',Times,serif;">
                      <b>Kimden:</b> ${email.from} → ${targetEmail}<br/>
                      <b>Tahmin Edilen Departman:</b> ${department}<br/>
                      <b>Olasılık:</b> ${result.score}<br/>
                      <b>Konu:</b> ${email.subject}<br/>
                      <b>Düzeltilmiş/Özet Mail:</b> ${result.fixed_text}<br/>
                      <b>Duygu Durumu:</b> ${result.emotion}<br/>
                      <b>Orijinal Mail:</b> ${email.body}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      `
    });
    // Log forwarding action for debugging
      console.log(`[Forwarder] User ${user.id} - "${email.subject}" → ${targetEmail} gönderildi`);
  } catch (err) {
    console.error(`[Classifier] Hata - User ${user.id}:`, err.message);
  }
  return result; 
}

// polling function to fetch new emails for a user
async function pollAllUsers() {
  try {
    //? rows destructure response which contains rowCount oid etc. Rows like response from postgres
    const { rows: users } = await pool.query( //get mail tokens
      `SELECT id, gmail_address, mail_token, mail_access_token, mail_token_expiry
       FROM users WHERE mail_token IS NOT NULL`
    );

    // Log checking total users
    console.log(`[MailPoller] ${users.length} kullanıcı kontrol ediliyor...`);

    for (const user of users) {
      try {
        const emails = await fetchNewEmails(user, new Set());     //fetching

        for (const email of emails) {       // check email is processed or not
          const already = await isProcessed(user.id, email.id);
          if (already) {
            console.log(`[MailPoller] Atlandı (işlendi): "${email.subject}"`);
            continue; // skip if already processed
          }

          // First, save the email, otherwise the email will be processed twice.
          await markProcessed(user.id, email.id, {
            subject: email.subject,
            mail: email.body,
            sender: email.from
          });

          // Then, classify
          const result = await classifyAndForward(user, email);

          // Update department and processed fields in database if classification is successful
          if (result) {
            const processedContent = `Düzeltilmiş Mail:
            ${result.fixed_text || '-'}

            Departman: ${result.department || '-'}
            Duygu Durumu: ${result.duygu || '-'}`;

            await pool.query(
              'UPDATE processed_emails SET department=$1, processed=$2 WHERE user_id=$3 AND message_id=$4',
              [result.department, processedContent, user.id, email.id]
            );
          }
        }

      } catch (userErr) {
        console.error(`[MailPoller] User ${user.id} hatası:`, userErr.message);
      }
    }
  } catch (err) {
    console.error('[MailPoller] Genel hata:', err);
  }
}

// Starts the mail poller
function startMailPoller() {
  console.log('[MailPoller] Başlatıldı — her 5 dakikada bir çalışacak');
  pollAllUsers();
  cron.schedule('*/5 * * * *', pollAllUsers);
}

module.exports = { startMailPoller };