# 📬 Akıllı Mail SaaS & Chatbot Sistemi

Kullanıcıların Gmail hesaplarını bağlayarak gelen mailleri otomatik olarak sınıflandıran, ilgili departmana ileten ve akıllı chatbot desteği sunan kapsamlı SaaS uygulaması.

---

## 🏗️ Mimari

```
┌────────────────────┐       ┌──────────────────────┐       ┌──────────────────────────┐
│  React (Vite)      │──────▶│  Node.js Backend     │──────▶│  Python FastAPI          │
│  Frontend          │       │                      │       │  (Container)             │
└────────────────────┘       └──────┬───────────────┘       └──────────────────────────┘
                                    │                               │
                          ┌─────────▼──────────┐                  │
                          │  PostgreSQL DB     │        ┌─────────▼────────────┐
                          │                    │        │ Vector Storage       │
                          └────────────────────┘        │ (Embeddings/FAQ)     │
                                    │                   └──────────────────────┘
                          ┌─────────▼──────────┐
                          │  Gmail API         │        ┌──────────────────────┐
                          │  (OAuth2)          │        │ Groq API             │
                          └────────────────────┘        │ (Chat/LLM)           │
                                                         └──────────────────────┘

┌──────────────────┐
│ HuggingFace      │ (E-mail Classification)
│ Classification   │
└──────────────────┘
```

---

## 🚀 Özellikler

- **Gmail OAuth2 entegrasyonu** — Kullanıcılar kendi Gmail hesaplarını güvenli şekilde bağlar
- **Otomatik mail çekme** — Her 5 dakikada bir inbox kontrol edilir
- **AI destekli sınıflandırma** — Gelen mailler HuggingFace modeli ile sınıflandırılır
- **Otomatik yönlendirme** — Mail ilgili departmanın mail adresine iletilir
- **Token şifreleme** — Kullanıcı tokenları AES-256-GCM ile şifreli saklanır
- **İşlenmiş mail takibi** — Aynı mail iki kez işlenmez
- **Akıllı Chatbot** — RAG (Retrieval Augmented Generation) tabanlı, gerçek zamanlı SSE streaming ile sohbet
- **Vektör Arama** — FAQ'lar vektör embeddings ile aranır ve ilgili cevaplar sunulur
- **İletişim Formu** — Kullanıcılar web sitesi üzerinden doğrudan mesaj gönderebilir

---

## 📁 Proje Yapısı

```
frontend/                         # React Vite Frontend
├── src/
│   ├── components/               # Tekrar kullanılabilir UI bileşenleri
│   ├── pages/
│   │   ├── Dashboard.jsx         # Mail istatistikleri ve kontrol paneli
│   │   ├── Chatbot.jsx           # Gerçek zamanlı sohbet arayüzü
│   │   ├── Login.jsx             # Kullanıcı giriş sayfası
│   │   ├── Register.jsx          # Kullanıcı kayıt sayfası
│   │   ├── Contact.jsx           # İletişim formu sayfası
│   │   └── ...                   # Diğer sayfalar
│   ├── store/                    # Redux state yönetimi
│   └── api/                      # Axios config ve API çağrıları
├── .env
└── package.json

backend/                          # Node.js API
├── config/
│   ├── db.js                     # PostgreSQL bağlantısı
│   └── google.js                 # Google OAuth2 config
├── middleware/
│   └── auth.js                   # JWT doğrulama
├── routes/
│   ├── user.routes.js            # Kayıt, giriş, hesap silme
│   ├── gmail.routes.js           # Gmail bağlama, gönderme
│   ├── chat.routes.js            # Chatbot SSE streaming
│   └── contact.routes.js         # İletişim formu işleme
├── services/
│   ├── cryptoService.js          # Token şifreleme/çözme
│   └── gmailService.js           # Gmail okuma/gönderme
├── jobs/
│   └── mailPoller.js             # Cron job — mail çekme ve işleme
├── .env
└── index.js

python-service/                   # FastAPI AI Servisi
├── app/
│   ├── main.py                   # FastAPI uygulaması
│   ├── models/
│   │   ├── chat_model.py         # Chat request modeli
│   │   ├── input_model.py        # Sınıflandırma input modeli
│   │   └── faq_model.py          # FAQ veri modeli
│   ├── routes/
│   │   ├── hf_classifier_route.py  # E-mail sınıflandırma endpoint
│   │   └── rag_route.py            # Chatbot/RAG endpoint
│   └── services/
│       ├── hf_classifier_service.py # HuggingFace sınıflandırma
│       ├── rag_service.py           # RAG chat servisi
│       ├── embedding_service.py     # Vektör embedding işlemleri
│       └── vector_search_service.py # Vektör tabanlı FAQ arama
├── embedding_operations/
│   ├── load_faq.py               # FAQ'ları vektör embeddings'e dönüştür
│   └── test_vector.py            # Vektör işlemlerini test et
├── Dockerfile                    # Container yapılandırması
├── requirements.txt              # Python bağımlılıkları
└── .env
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

### Chat (Chatbot - SSE Streaming)
| Method | URL | Açıklama | Auth |
|--------|-----|----------|------|
| POST | `/api/chat` | Chatbot'a mesaj gönder (SSE Stream) | ❌ |
| | `brand_name: string` | Markaların adı | |
| | `message: string` | Kullanıcı mesajı | |
| | `history: array` | Sohbet geçmişi (opsiyonel) | |

### İletişim
| Method | URL | Açıklama | Auth |
|--------|-----|----------|------|
| POST | `/api/contact` | İletişim formu gönder | ❌ |
| | `name: string` | Gönderenin adı | |
| | `email: string` | Gönderenin email | |
| | `message: string` | Mesaj içeriği | |

### Python FastAPI Endpoints

| Method | URL | Açıklama |
|--------|-----|----------|
| POST | `/classify` | E-mail sınıflandırma (HuggingFace) |
| POST | `/chat` | Chatbot RAG (SSE Stream) |

---

## ⚙️ Kurulum

### Gereksinimler

- Node.js 18+
- Python 3.10+
- PostgreSQL
- Google Cloud hesabı
- HuggingFace hesabı
- Groq API anahtarı

### 1. Frontend kurulumu

```bash
cd frontend
npm install
```

`.env` dosyası oluştur:

```env
VITE_BACKEND_URL=http://localhost:5000
```

Frontend'i başlat:

```bash
npm run dev
```

### 2. Backend kurulumu

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
LOJISTIK_MAIL=lojistik@sirket.com
MUSTERI_HIZMETLERI_MAIL=musteri@sirket.com
FINANS_MAIL=finans@sirket.com
TEKNIK_DESTEK_MAIL=teknik@sirket.com

# Python servisi
PYTHON_SERVICE_URL=http://localhost:10000

# İletişim formu (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Veritabanı kurulumu

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

### 4. Python servisi kurulumu

```bash
cd python-service
pip install -r requirements.txt
```

`.env` dosyası:

```env
# Groq API
GROQ_API_KEY=...

# HuggingFace
HF_API_KEY=...

# Server config
HOST=0.0.0.0
PORT=10000
```

**Alternatif 1: Lokal çalıştırma**
```bash
python -m app.main
```

**Alternatif 2: Docker ile çalıştırma**
```bash
docker build -t mail-saas-python .
docker run -p 10000:10000 --env-file .env mail-saas-python
```

### 5. FAQ Vektörleştirme (İlk Kurulum)

```bash
cd python-service/embedding_operations
python load_faq.py  # FAQ'ları vektör embeddings'e dönüştür
```

### 6. Google Cloud Console ayarları

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
Python FastAPI servisine /classify endpoint'ine gönderilir
        ↓
HuggingFace Transformer → departman sınıflandırma
        ↓
İlgili departman mail adresine iletilir
        ↓
DB'deki kayıt department bilgisiyle güncellenir
```

---

## 💬 Chatbot RAG Akışı

```
Kullanıcı mesaj gönderir
        ↓
Backend /api/chat endpoint'i tetiklenir
        ↓
Backend Python servisine /chat endpoint'ine gönderir
        ↓
Vector Search → FAQ database'de semantik arama
        ↓
İlgili FAQ sonuçları bulunur
        ↓
Groq LLM → Mesaj + FAQ context → Akıllı yanıt üret
        ↓
SSE (Server-Sent Events) ile gerçek zamanlı streaming
        ↓
Yanıt Token Token şeklinde gönderilir
        ↓
Frontend chatbot arayüzünde canlı yazılırken gösterilir
```

---

## ⚙️ Kurulum

### Gereksinimler

- Node.js 18+
- Python 3.10+
- PostgreSQL
- Google Cloud hesabı
- HuggingFace hesabı

### 1. Frontend kurulumu

```bash
cd frontend
npm install
```

`.env` dosyası oluştur:

```env
VITE_BACKEND_URL=http://localhost:5000
```

Frontend'i başlat:

```bash
npm run dev
```

### 2. Backend kurulumu

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

### 3. Veritabanı kurulumu

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

### 4. Python servisi (HuggingFace Spaces)

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

### 5. Google Cloud Console ayarları

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
Python FastAPI servisine /classify endpoint'ine gönderilir
        ↓
HuggingFace Transformer → departman sınıflandırma
        ↓
İlgili departman mail adresine iletilir
        ↓
DB'deki kayıt department bilgisiyle güncellenir
```

---

## 💬 Chatbot RAG Akışı

```
Kullanıcı mesaj gönderir
        ↓
Backend /api/chat endpoint'i tetiklenir
        ↓
Backend Python servisine /chat endpoint'ine gönderir
        ↓
Vector Search → FAQ database'de semantik arama
        ↓
İlgili FAQ sonuçları bulunur
        ↓
Groq LLM → Mesaj + FAQ context → Akıllı yanıt üret
        ↓
SSE (Server-Sent Events) ile gerçek zamanlı streaming
        ↓
Yanıt Token Token şeklinde gönderilir
        ↓
Frontend chatbot arayüzünde canlı yazılırken gösterilir
```

---

## 🔒 Güvenlik

- Kullanıcı şifreleri **bcrypt** ile hashlenir
- Gmail token'ları **AES-256-GCM** ile şifreli saklanır
- API istekleri **JWT** ile korunur
- Token'lar otomatik yenilenir, expire kontrolü yapılır
- Gelen mailler processed_emails tablosunda takip edilir (duplicate prevention)

---

## 📦 Kullanılan Teknolojiler

**Frontend:** 
- React 19, Vite, Tailwind CSS 4, Redux Toolkit, Framer Motion, Chart.js, Lucide Icons

**Backend:** 
- Node.js, Express, PostgreSQL, node-cron, googleapis, jsonwebtoken, bcrypt, axios, cors

**Python Servisi:** 
- FastAPI, Transformers (HuggingFace), Groq API, Scikit-learn, NumPy, Pandas

**Diğer:** 
- Docker, PostgreSQL, Google OAuth2, Groq API
