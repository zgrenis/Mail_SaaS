const cron = require('node-cron');
const pool = require('../config/db');
const { fetchNewEmails } = require('../services/gmailService');

// userId -> Set<messageId> — ileride Redis'e taşınabilir
const seenEmailsCache = new Map();

// Dışarıdan erişilebilir queue
const pendingEmailQueue = [];

async function pollAllUsers() {
  try {
    const { rows: users } = await pool.query(
      `SELECT id, gmail_address, mail_token, mail_access_token, mail_token_expiry
       FROM users
       WHERE mail_token IS NOT NULL`
    );

    console.log(`[MailPoller] ${users.length} kullanıcı kontrol ediliyor...`);

    for (const user of users) {
      try {
        if (!seenEmailsCache.has(user.id)) {
          seenEmailsCache.set(user.id, new Set());
        }

        const seenIds = seenEmailsCache.get(user.id);
        const newEmails = await fetchNewEmails(user, seenIds);

        if (newEmails.length > 0) {
          console.log(`[MailPoller] User ${user.id} - ${newEmails.length} yeni mail`);

          newEmails.forEach(email => {
            seenIds.add(email.id);
            pendingEmailQueue.push({ userId: user.id, email });
            console.log(`[Queue] User ${user.id} - "${email.subject}" kuyruğa eklendi`);
          });

          // Cache'i 100 ID ile sınırla
          if (seenIds.size > 100) {
            seenEmailsCache.set(user.id, new Set([...seenIds].slice(-100)));
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
  pollAllUsers(); // uygulama açılışında hemen bir kere çalıştır
  cron.schedule('*/5 * * * *', pollAllUsers);
}

module.exports = { startMailPoller, pendingEmailQueue };