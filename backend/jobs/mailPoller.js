const cron = require('node-cron');
const pool = require('../config/db');
const { fetchNewEmails, sendEmail } = require('../services/gmailService');

const DEPARTMENT_MAIL_MAP = {
  "Lojistik": process.env.lojistik_mail,
  "Müşteri Hizmetleri": process.env.musteri_hizmetleri_mail,
  "Finans": process.env.finans_mail,
  "Teknik Destek": process.env.teknik_destek_mail
};

async function isProcessed(userId, messageId) {
  const { rows } = await pool.query(
    'SELECT 1 FROM processed_emails WHERE user_id=$1 AND message_id=$2',
    [userId, messageId]
  );
  return rows.length > 0;
}

async function markProcessed(userId, messageId, meta = {}) {
  await pool.query(
    `INSERT INTO processed_emails 
      (user_id, message_id, subject, preview, department, sender) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     ON CONFLICT DO NOTHING`,
    [
      userId,
      messageId,
      meta.subject || null,
      meta.preview || null,
      meta.department || null,
      meta.sender || null
    ]
  );
}

async function classifyAndForward(user, email) {
  let result = null; // scope'u try dışında tanımla

  try {
    const response = await fetch('http://127.0.1.2:8000/siniflandirma/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `${email.subject}\n${email.body}` })
    });

    result = await response.json();
    const department = result.department;

    console.log(`[Classifier] User ${user.id} - "${email.subject}"`);
    console.log(`  → Departman: ${department}`);
    console.log(`  → Duygu: ${result.duygu}`);
    console.log(`  → Skor: ${result.score}`);

    const targetEmail = DEPARTMENT_MAIL_MAP[department];
    if (!targetEmail) {
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
                      AKILLI MAIL SİSTEMİ
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:24px;color:#F5F5F5;line-height:24px;font-size:15px;font-family:'Times New Roman',Times,serif;">
                      <b>Kimden:</b> ${email.from} → ${targetEmail}<br/>
                      <b>Tahmin Edilen Departman:</b> ${department}<br/>
                      <b>Olasılık:</b> ${result.score}<br/>
                      <b>Konu:</b> ${email.subject}<br/>
                      <b>Düzeltilmiş/Özet Mail:</b> ${result.fixed_text}<br/>
                      <b>Duygu Durumu:</b> ${result.duygu}<br/>
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

    console.log(`[Forwarder] User ${user.id} - "${email.subject}" → ${targetEmail} gönderildi`);

  } catch (err) {
    console.error(`[Classifier] Hata - User ${user.id}:`, err.message);
  }

  return result; // try/catch dışında, her durumda döner
}

async function pollAllUsers() {
  try {
    const { rows: users } = await pool.query(
      `SELECT id, gmail_address, mail_token, mail_access_token, mail_token_expiry
       FROM users WHERE mail_token IS NOT NULL`
    );

    console.log(`[MailPoller] ${users.length} kullanıcı kontrol ediliyor...`);

    for (const user of users) {
      try {
        const emails = await fetchNewEmails(user, new Set());

        for (const email of emails) {
          const already = await isProcessed(user.id, email.id);
          if (already) {
            console.log(`[MailPoller] Atlandı (işlendi): "${email.subject}"`);
            continue;
          }

          // Önce kaydet (department henüz yok)
          await markProcessed(user.id, email.id, {
            subject: email.subject,
            preview: email.body?.split(/\s+/).slice(0, 10).join(' '),
            sender: email.from
          });

          // Sonra sınıflandır ve gönder
          const result = await classifyAndForward(user, email);

          // Department gelince güncelle
          if (result?.department) {
            await pool.query(
              'UPDATE processed_emails SET department=$1 WHERE user_id=$2 AND message_id=$3',
              [result.department, user.id, email.id]
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

function startMailPoller() {
  console.log('[MailPoller] Başlatıldı — her 5 dakikada bir çalışacak');
  pollAllUsers();
  cron.schedule('*/5 * * * *', pollAllUsers);
}

module.exports = { startMailPoller };