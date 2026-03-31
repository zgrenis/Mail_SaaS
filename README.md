# 📬 Akıllı Mail SaaS Sistemi

Kullanıcıların Gmail hesaplarını bağlayarak gelen mailleri otomatik olarak sınıflandıran ve ilgili departmana ileten SaaS uygulaması.

---

## 🏗️ Mimari

```
┌─────────────────┐     ┌─────────────────────┐     ┌──────────────────────────┐
│  WordPress      │────▶│  Node.js Backend     │────▶│  Python FastAPI          │
│  Frontend       │     │  (Render.com)        │     │  (HuggingFace Spaces)    │
└─────────────────┘     └──────────┬──────────┘     └──────────────────────────┘
                                   │                           │
                         ┌─────────▼──────────┐               │
                         │  PostgreSQL DB      │     ┌─────────▼──────────┐
                         │  (Render.com)       │     │  HuggingFace Model  │
                         └────────────────────┘     │  enis10/bitirme_    │
                                                     │  siniflandirma      │
                                   │                 └────────────────────┘
                         ┌─────────▼──────────┐
                         │  Gmail API          │
                         │  (Google OAuth2)    │
                         └────────────────────┘
```

---

## 🚀 Özellikler

- **Gmail OAuth2 entegrasyonu** — Kullanıcılar kendi Gmail hesaplarını güvenli şekilde bağlar
- **Otomatik mail çekme** — Her 5 dakikada bir inbox kontrol edilir
- **AI destekli sınıflandırma** — Gelen mailler kendi eğittiğim BERT tabanlı model ile sınıflandırılır
- **Gemini entegrasyonu** — Yazım hatası düzeltme ve duygu analizi
- **Otomatik yönlendirme** — Mail ilgili departmanın mail adresine iletilir
- **Token şifreleme** — Kullanıcı tokenları AES-256-GCM ile şifreli saklanır
- **İşlenmiş mail takibi** — Aynı mail iki kez işlenmez

---

## 📁 Proje Yapısı

```
backend/                          # Node.js API
├── config/
│   ├── db.js                     # PostgreSQL bağlantısı
│   └── google.js                 # Google OAuth2 config
├── middleware/
│   └── auth.js                   # JWT doğrulama
├── routes/
│   ├── user.routes.js            # Kayıt, giriş, hesap silme
│   └── gmail.routes.js           # Gmail bağlama, gönderme
├── services/
│   ├── cryptoService.js          # Token şifreleme/çözme
│   └── gmailService.js           # Gmail okuma/gönderme
├── jobs/
│   └── mailPoller.js             # Cron job — mail çekme ve işleme
├── .env
└── index.js

python-service/                   # FastAPI sınıflandırma servisi
├── app/
│   ├── main.py
│   ├── models/
│   │   └── input_model.py
│   ├── routes/
│   │   ├── classify.py
│   │   └── hf_classifier_route.py
│   └── services/
│       └── hf_classifier_service.py
├── Dockerfile
└── requirements.txt
```

---

## 🗄️ Veritabanı Yapısı

### `users`
| Kolon | Tip | Açıklama |
|-------|-----|----------|
| id | integer (PK) | Otomatik artan ID |
| email | varchar(255) | Kullanıcı email |
| password | varchar(255) | bcrypt hashlenmiş şifre |
| plan | varchar(50) | Free / Pro |
| mail_token | text | Şifreli Gmail refresh token |
| mail_access_token | text | Şifreli Gmail access token |
| mail_token_expiry | bigint | Access token expire zamanı |
| gmail_address | varchar(255) | Bağlı Gmail adresi |
| created_at | timestamp | Kayıt tarihi |

### `processed_emails`
| Kolon | Tip | Açıklama |
|-------|-----|----------|
| id | serial (PK) | Otomatik artan ID |
| user_id | integer (FK) | users tablosuna referans |
| message_id | varchar(255) | Gmail message ID |
| subject | varchar(255) | Mail konusu |
| preview | text | İlk 10 kelime |
| department | varchar(100) | Yönlendirilen departman |
| sender | varchar(255) | Gönderen adresi |
| processed_at | timestamp | İşlenme zamanı |

---

## 🔌 API Endpoints

### Kullanıcı
| Method | URL | Açıklama | Auth |
|--------|-----|----------|------|
| POST | `/api/users/register` | Kayıt ol | ❌ |
| POST | `/api/users/login` | Giriş yap | ❌ |
| DELETE | `/api/users/disconnect-gmail` | Gmail bağlantısını kes | ✅ |
| DELETE | `/api/users/delete-account` | Hesabı sil | ✅ |

### Gmail
| Method | URL | Açıklama | Auth |
|--------|-----|----------|------|
| GET | `/api/gmail/connect` | OAuth URL döner | ✅ |
| GET | `/api/gmail/callback` | Google callback | ❌ |
| POST | `/api/gmail/send` | Mail gönder | ✅ |
| DELETE | `/api/gmail/disconnect` | Gmail bağlantısını kes | ✅ |

---

## ⚙️ Kurulum

### Gereksinimler

- Node.js 18+
- Python 3.10+
- PostgreSQL
- Google Cloud hesabı
- HuggingFace hesabı

### 1. Backend kurulumu

```bash
cd backend
npm install
```

`.env` dosyası oluştur:

```env
# Veritabanı
DATABASE_URL=postgresql://user:password@host/dbname

# JWT
JWT_SECRET=gizli_anahtar

# Şifreleme (32 byte hex üret)
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=...

# Google OAuth2
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:5000/api/gmail/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Departman mail adresleri
lojistik_mail=lojistik@sirket.com
musteri_hizmetleri_mail=musteri@sirket.com
finans_mail=finans@sirket.com
teknik_destek_mail=teknik@sirket.com

# Python servisi
HF_SPACE_URL=https://enis10-bitirme-siniflandirma-api.hf.space/classify/
```

### 2. Veritabanı kurulumu

```sql
-- Mail token kolonları
ALTER TABLE users 
ADD COLUMN mail_access_token TEXT,
ADD COLUMN mail_token_expiry BIGINT,
ADD COLUMN gmail_address VARCHAR(255);

-- İşlenmiş mailler tablosu
CREATE TABLE processed_emails (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  message_id VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  preview TEXT,
  department VARCHAR(100),
  sender VARCHAR(255),
  processed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, message_id)
);
```

### 3. Python servisi (HuggingFace Spaces)

HuggingFace Spaces'e deploy edilmiştir. Lokal çalıştırmak için:

```bash
cd python-service
pip install -r requirements.txt
python -m app.main
```

`.env` dosyası:

```env
HF_ID=enis10/bitirme_siniflandirma
GEMINI_API_KEY=...
HOST=127.0.0.1
PORT=8000
```

### 4. Google Cloud Console ayarları

1. [console.cloud.google.com](https://console.cloud.google.com) → Yeni proje oluştur
2. **APIs & Services → Library** → Gmail API aktif et
3. **OAuth consent screen** → External → scope ekle: `gmail.readonly`, `gmail.send`
4. **Credentials → OAuth 2.0 Client ID** oluştur
5. Authorized redirect URIs'e ekle: `http://localhost:5000/api/gmail/callback`

---

## 🔄 Mail İşleme Akışı

```
Kullanıcı Gmail bağlar
        ↓
Her 5 dakikada cron job çalışır
        ↓
Inbox'tan son 5 mail çekilir
        ↓
processed_emails tablosunda daha önce işlendi mi kontrol edilir
        ↓ (işlenmediyse)
DB'ye kayıt yapılır (subject, preview, sender)
        ↓
Python FastAPI servisine gönderilir
        ↓
Gemini → yazım düzeltme + duygu analizi
BERT   → departman sınıflandırma
        ↓
İlgili departman mail adresine iletilir
        ↓
DB'deki kayıt department bilgisiyle güncellenir
```

---

## 🌐 Deploy

### Backend (Render.com)

Render.com üzerinde Web Service olarak deploy edilir. Environment variables Render dashboard'dan eklenir.

`GOOGLE_REDIRECT_URI` production'da güncellenmeli:
```
GOOGLE_REDIRECT_URI=https://mail-saas-backend.onrender.com/api/gmail/callback
```

### Python Servisi (HuggingFace Spaces)

Docker SDK ile HuggingFace Spaces'e deploy edilir. Secrets olarak `HF_ID` ve `GEMINI_API_KEY` eklenir.

---

## 🔒 Güvenlik

- Kullanıcı şifreleri **bcrypt** ile hashlenir
- Gmail token'ları **AES-256-GCM** ile şifreli saklanır
- API istekleri **JWT** ile korunur
- Token'lar otomatik yenilenir, expire kontrolü yapılır

---

## 📦 Kullanılan Teknolojiler

**Backend:** Node.js, Express, PostgreSQL, node-cron, googleapis, jsonwebtoken, bcrypt

**Python Servisi:** FastAPI, Transformers (BERT), Google Gemini API, HuggingFace Hub

**Deploy:** Render.com (Backend + DB), HuggingFace Spaces (Python Servisi)
