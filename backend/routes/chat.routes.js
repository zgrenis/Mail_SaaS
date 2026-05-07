const { Router } = require("express");
const axios       = require("axios");
const router             = Router();
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:10000";

// /api/chat/
//? open SSE Connection between node js and python service
//? send message from node js to python service
//? receive response from python service and send it to client

router.post("/", async (req, res) => {
  const { brand_name, message, history = [] } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ error: "message alanı boş olamaz." });
  }

  //? SSE Server-Sent Events
  //? it's protocol that send response from server to client in real time by chunks
  //? Protocol doesn't wait for all data to be ready
  //? It sends data as soon as it's ready, making it ideal for real-time applications

  //? sent headers to client im"mediately to keep connection for streaming
  res.setHeader("Content-Type",    "text/event-stream"); 
  res.setHeader("Cache-Control",   "no-cache");
  res.setHeader("Connection",      "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); //disable buffering for NGINX
  res.flushHeaders(); 

  const sendChunk = (chunk) => //send chunk to client in SSE format
    res.write(`data: ${JSON.stringify({ chunk })}\n\n`);

  const sendError = (msg) => //send error to client in SSE format
    res.write(`event: error\ndata: ${JSON.stringify({ message: msg })}\n\n`);

  //? node js send close event when client close the connection and we cancel the previous connection 
  //! It is low level code to prevent memory leak automatically.
  const source = axios.CancelToken.source();
  res.on("close", () => source.cancel("client_disconnected")); 

  try {
    // log
    console.log(`[chat.route] → ${PYTHON_SERVICE_URL}/chat | brand=${brand_name}`);
    
    //? Open stream connection with python service
    const upstream = await axios.post(    
      `${PYTHON_SERVICE_URL}/chat`,
      { brand_name, message, history },
      {
        responseType:  "stream",           // connect with streaming format 
        timeout:       60_000,             // 60 second timeout
        cancelToken:   source.token,
      }
    );

    console.log(`[chat.route] upstream status: ${upstream.status}`);

    //? send data from python service to client in real time 
    upstream.data.on("data", (chunk) => {
      const raw = chunk.toString("utf-8"); // chunk is a binary format data so we convert it to utf-8 string
      try {
        const parsed = JSON.parse(raw);   // parse the json data
        if (parsed.answer) {              // if parsed data has answer field
          sendChunk(parsed.answer);       // send it to client
        } else {
          sendChunk(raw);                 // else send raw data
        }
      } catch (e) {
        sendChunk(raw);                 // if parsing fails send raw data
      }
    });

    //? send end signal to client when stream ends to close SSE connection
    upstream.data.on("end", () => {       
      console.log("[chat.route] stream bitti → [DONE]");
      res.write("data: [DONE]\n\n");
      res.end();
    });

    //? send error message to client when stream error and close the connection
    upstream.data.on("error", (err) => { 
      console.error("[chat.route] stream error:", err.message);
      sendError(err.message);
      res.end();
    });

  } catch (err) {
    // when user close the connection return without error message
    if (axios.isCancel(err)) {
      console.log("[chat.route] istemci bağlantıyı kesti, normal.");
      return;
    }

    // send error message to client
    const status  = err.response?.status;
    const detail  = err.response?.data?.detail ?? err.message;
    console.error(`[chat.route] hata: ${status ?? "network"} — ${detail}`);
    sendError(`${status ? `HTTP ${status}: ` : ""}${detail}`);
    res.end();
  }
});

module.exports = router;