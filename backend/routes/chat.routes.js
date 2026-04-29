import express from 'express'
import rateLimit from 'express-rate-limit'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()
const limiter = rateLimit({ windowMs: 60_000, max: 30 })
const PY = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'

// Kullanıcıdan gelen chat mesajı
router.post('/', limiter, async (req, res) => {
  const { message, history = [], brandName } = req.body
  const userId = req.user?.id  // auth middleware'den gelecek

  if (!message) return res.status(400).json({ error: 'message zorunlu' })

  try {
    const response = await fetch(`${PY}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        brand_name: brandName || 'Mağaza',
        message,
        history
      })
    })
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Yanıt alınamadı, lütfen tekrar deneyin.' })
  }
})

// Admin — FAQ yükle ve indeksle
router.post('/index', authMiddleware, async (req, res) => {
  const { faqData } = req.body
  const userId = req.user?.id

  try {
    const response = await fetch(`${PY}/index-faq`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, faq_data: faqData })
    })
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'FAQ indexleme başarısız' })
  }
})

export default router