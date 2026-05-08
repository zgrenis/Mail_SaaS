import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, X, MessageCircle, Loader2, Sparkles, Trash2 } from "lucide-react";

/* ──────────── connection config ────────────────── */
const API_URL     = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
const LS_KEY      = "chatbot_history"; // local storage key for chatbot history
const MAX_HISTORY = 20;

/* ──────────── helpers ───────────────────────── */
const formatTime = (date) =>
  new Date(date).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

function loadHistory(brandName) {
  try {
    const raw = localStorage.getItem(`${LS_KEY}_${brandName}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveHistory(brandName, messages) {
  localStorage.setItem(
    `${LS_KEY}_${brandName}`,
    JSON.stringify(messages.slice(-MAX_HISTORY)) // save from end to start (last messages)
  );
}

/* ──────────── bot writing bubble ────────────────── */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-200">
        <Bot size={13} className="text-white" />
      </div>
      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
        {[0, 150, 300].map((d) => (
          <span key={d} className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
            style={{ animationDelay: `${d}ms`, animationDuration: "1s" }} />
        ))}
      </div>
    </div>
  );
}

/* ─── message render function ────────────────────────────────────────────────── */
function Message({ msg, isLast }) {
  const isBot = msg.role === "assistant";
  return (
    <div className={`flex items-end gap-2 ${isBot ? "" : "flex-row-reverse"} ${isLast ? "animate-[fadeSlideUp_0.18s_ease]" : ""}`}>
      {/* edit bubble location and render if bot writting */}
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-200 mb-0.5">
          <Bot size={13} className="text-white" />
        </div>
      )}

      <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
        ${isBot ? "bg-white border border-slate-100 text-slate-700 rounded-bl-sm"
                : "bg-indigo-600 text-white rounded-br-sm shadow-indigo-200"}`}>
        <p className="whitespace-pre-wrap">
          {msg.content}
        </p>
        {!msg.streaming && (
          <time className={`block text-[10px] mt-1 ${isBot ? "text-slate-400" : "text-indigo-200"}`}>
            {formatTime(msg.time)}
          </time>
        )}
      </div>
    </div>
  );
}

/* ─── ChatBot ────────────────────────────────────────────────── */
export default function ChatBot({ brandName = "VELOUR Asistant" }) {
  const WELCOME = {
    role: "assistant",
    content: `Merhaba! Ben ${brandName} müşteri hizmetleri asistanıyım. Size nasıl yardımcı olabilirim? 😊`,
    time: new Date().toISOString(),
  };

  const [open,     setOpen]     = useState(false);   //dialog page open/close state
  const [messages, setMessages] = useState(() => {   // load from local storage
    const saved = loadHistory(brandName);
    return saved.length > 0 ? saved : [WELCOME];
  });
  const [input,   setInput]   = useState("");         //input field state
  const [loading, setLoading] = useState(false);      //loading state

  //to improve User Experience
  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);
  const readerRef   = useRef(null);

  useEffect(() => { saveHistory(brandName, messages); }, [messages, brandName]);   //save history state every change on messages or brandName
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]); //auto scroll to bottom
  useEffect(() => { if (open) setTimeout(() => textareaRef.current?.focus(), 160); }, [open]); //auto focus on open

  //clean datas before sending to backend 
  const getApiHistory = useCallback(() =>
    messages.filter((m) => !m.streaming).map(({ role, content }) => ({ role, content })),
  [messages]);

  /* update last streaming bot message */
  const updateLastBot = useCallback((updater) => {
    setMessages((prev) => {
      const copy = [...prev];
      copy[copy.length - 1] = updater({ ...copy[copy.length - 1] });
      return copy;
    });
  }, []);

  //chat screen
  function handleInputChange(e) {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 100) + "px"; }
  }

  function clearHistory() {
    localStorage.removeItem(`${LS_KEY}_${brandName}`);
    setMessages([WELCOME]);
  }

 async function sendMessage() {
  const text = input.trim();
  if (!text || loading) return;

  setMessages((prev) => [
    ...prev,
    { role: "user", content: text, time: new Date().toISOString() },  // ISO: year month day
    { role: "assistant", content: "", time: new Date().toISOString(), streaming: true },
  ]);

  setInput("");
  if (textareaRef.current) textareaRef.current.style.height = "auto"; //auto resize textarea
  setLoading(true);

  try {
    const res = await fetch(`${API_URL}/api/chat`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        brand_name: brandName.toLowerCase(),
        message:    text,
        history:    getApiHistory(),
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => `HTTP ${res.status}`);
      throw new Error(errText);
    }
//!
    const reader  = res.body.getReader(); // to read stream api response
    readerRef.current = reader;
    const decoder = new TextDecoder();   //! decoder is necesseary when streaming data from api on http
    let   buffer  = "";
    let   gotAnyChunk = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      //split lines 
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();               //for incomplete lines

      for (const line of lines) {
        if (line.startsWith("event: error")) continue; //error check

        if (line.startsWith("data:")) {                 // to get data
          const raw = line.slice(5).trim();
          if (!raw) continue;

          if (raw === "[DONE]") {                        // to end the stream
            if (!gotAnyChunk) {
              updateLastBot((m) => ({ ...m, content: "Yanıt alınamadı. Lütfen tekrar deneyin." }));
            }
            break;
          }

          try {
            const parsed = JSON.parse(raw);

            if (parsed.message && !parsed.chunk) {      //spesific error message
              updateLastBot((m) => ({ ...m, content: `Hata: ${parsed.message}` }));
              gotAnyChunk = true;
              break;
            }

            if (parsed.chunk) {                          // chunk is real data  
              gotAnyChunk = true;
              updateLastBot((m) => ({ ...m, content: m.content + parsed.chunk }));
            }
          } catch {                                      // for fallback (string format)
            if (raw.length > 0) {
              gotAnyChunk = true;
              updateLastBot((m) => ({ ...m, content: m.content + raw }));
            }
          }
        }
      }
    }

  } catch (err) { // catch connection errors
    if (err.name !== "AbortError") {
      updateLastBot((m) => ({ ...m, content: `Bağlantı hatası: ${err.message}` }));
    }
  } finally {    //
    updateLastBot((m) => ({ ...m, streaming: false }));
    readerRef.current = null;
    setLoading(false);
  }
}
  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn { from{opacity:0;transform:translateY(16px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>

      {/* FAB */}
      <button onClick={() => setOpen((v) => !v)} aria-label="Müşteri hizmetleri"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-300 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95">
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-[370px] max-w-[calc(100vw-24px)] bg-slate-50 rounded-2xl shadow-2xl shadow-slate-300/60 border border-slate-200 flex flex-col overflow-hidden"
          style={{ animation: "popIn .22s ease" }}>

          {/* Header */}
          <header className="bg-indigo-600 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight">{brandName}</p>
              <p className="text-indigo-200 text-[11px]">Müşteri Hizmetleri</p>
            </div>
            <span className="flex items-center gap-1 bg-white/15 rounded-full px-2.5 py-0.5 text-[10px] text-indigo-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Çevrimiçi
            </span>
            <button onClick={clearHistory} title="Geçmişi temizle"
              className="text-white/60 hover:text-white hover:bg-white/15 rounded-lg p-1.5 transition-colors">
              <Trash2 size={14} />
            </button>
            <button onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white hover:bg-white/15 rounded-lg p-1 transition-colors">
              <X size={16} />
            </button>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 max-h-[400px] scroll-smooth">
            <div className="flex justify-center">
              <span className="text-[10px] text-slate-400 bg-white border border-slate-100 rounded-full px-3 py-0.5 shadow-sm">
                {new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
              </span>
            </div>
            {messages.map((m, i) => ( 
               m.content ? <Message key={i} msg={m} isLast={i === messages.length - 1} />
            : null))}
            {messages[messages.length - 1]?.streaming && messages[messages.length - 1]?.content === "" && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          <div className="h-px bg-slate-200 mx-4" />

          {/* Footer */}
          <div className="px-3 py-3 bg-white flex items-end gap-2">
            <textarea ref={textareaRef} rows={1}
              placeholder="Mesajınızı yazın…"
              value={input} onChange={handleInputChange} onKeyDown={handleKey}
              className="flex-1 resize-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all max-h-24 leading-relaxed font-[inherit]" />
            <button onClick={sendMessage} disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-md shadow-indigo-200">
              {loading ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
            </button>
          </div>

          <p className="text-center text-[10px] text-slate-400 pb-2 bg-white">
            Powered by <span className="text-indigo-500 font-medium">Orbis</span>
          </p>
        </div>
      )}
    </>
  );
}