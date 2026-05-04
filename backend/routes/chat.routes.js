// routes/chat.route.js
// npm install axios  (native fetch yerine — Node sürümünden bağımsız çalışır)

const { Router } = require("express");
const axios       = require("axios");

const router             = Router();
// Python servisinin URL'i — .env'deki PYTHON_SERVICE_URL kullanılır (varsayılan 10000)
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:10000";

router.post("/", async (req, res) => {
  const { brand_name, message, history = [] } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: "message alanı boş olamaz." });
  }

  /* ── SSE headers ── */
  res.setHeader("Content-Type",    "text/event-stream");
  res.setHeader("Cache-Control",   "no-cache");
  res.setHeader("Connection",      "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const sendChunk = (chunk) =>
    res.write(`data: ${JSON.stringify({ chunk })}\n\n`);

  const sendError = (msg) =>
    res.write(`event: error\ndata: ${JSON.stringify({ message: msg })}\n\n`);

  /* ── CancelToken: istemci bağlantıyı keserse iptal et ── */
  const source = axios.CancelToken.source();
  res.on("close", () => source.cancel("client_disconnected"));

  try {
    // Python servisine istek atıyoruz. Endpoint: /chat
    console.log(`[chat.route] → ${PYTHON_SERVICE_URL}/chat | brand=${brand_name}`);

    const upstream = await axios.post(
      `${PYTHON_SERVICE_URL}/chat`,
      { brand_name, message, history },
      {
        responseType:  "stream",   // ← stream olarak al
        timeout:       60_000,     // 60 sn timeout
        cancelToken:   source.token,
      }
    );

    console.log(`[chat.route] upstream status: ${upstream.status}`);

    upstream.data.on("data", (chunk) => {
      const raw = chunk.toString("utf-8");
      // Python servisinden gelen JSON yanıtı SSE formatına çevirip gönderiyoruz
      // Not: Eğer Python servisi stream değil de tek bir JSON döndürüyorsa, 
      // bu 'data' olayı tüm JSON geldiğinde bir kez tetiklenebilir.
      try {
        const parsed = JSON.parse(raw);
        if (parsed.answer) {
          sendChunk(parsed.answer);
        } else {
          sendChunk(raw);
        }
      } catch (e) {
        sendChunk(raw);
      }
    });

    upstream.data.on("end", () => {
      console.log("[chat.route] stream bitti → [DONE]");
      res.write("data: [DONE]\n\n");
      res.end();
    });

    upstream.data.on("error", (err) => {
      console.error("[chat.route] stream error:", err.message);
      sendError(err.message);
      res.end();
    });

  } catch (err) {
    if (axios.isCancel(err)) {
      console.log("[chat.route] istemci bağlantıyı kesti, normal.");
      return;
    }

    const status  = err.response?.status;
    const detail  = err.response?.data?.detail ?? err.message;
    console.error(`[chat.route] hata: ${status ?? "network"} — ${detail}`);
    sendError(`${status ? `HTTP ${status}: ` : ""}${detail}`);
    res.end();
  }
});

module.exports = router;