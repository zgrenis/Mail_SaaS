import requests
import json
import time
from huggingface_hub import hf_hub_download
from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

HF_ID = os.getenv("HF_ID")
HF_SPACE_URL = os.getenv("HF_SPACE_URL")

# ---- Gemini Setup ----
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = None

# Öncelik sırasına göre denenecek modeller
FALLBACK_MODELS = [
    "gemini-2.5-flash",        # Stabil, önerilen
    "gemini-2.5-flash-lite",   # Daha hafif, düşük maliyet
    "gemini-2.0-flash",        # Yedek (Haziran 2026'ya kadar)
]

# .env'den model ismi geldiyse listeye ekle
env_model = os.getenv("MODEL_NAME")
if env_model and env_model not in FALLBACK_MODELS:
    FALLBACK_MODELS.insert(0, env_model)

if GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f"Gemini client oluşturulamadı: {e}")
        client = None


def call_gemini_with_fallback(prompt: str, retries: int = 2) -> str | None:
    """Model fallback + retry ile Gemini çağrısı yapar."""
    if not client:
        return None

    for model in FALLBACK_MODELS:
        for attempt in range(retries):
            try:
                r = client.models.generate_content(
                    model=model,
                    contents=prompt
                )
                result = r.candidates[0].content.parts[0].text.strip()
                print(f"Gemini başarılı: model={model}")
                return result

            except Exception as e:
                err_str = str(e)
                if "503" in err_str or "UNAVAILABLE" in err_str:
                    wait = 2 ** attempt  # 1s, 2s exponential backoff
                    print(f"Gemini 503 ({model}), {wait}s beklenip tekrar denenecek...")
                    time.sleep(wait)
                elif "404" in err_str or "NOT_FOUND" in err_str:
                    print(f"Model bulunamadı, atlanıyor: {model}")
                    break  # Bu modeli denemeyi bırak, bir sonrakine geç
                else:
                    print(f"Gemini Hatası ({model}): {e}")
                    break  # Bilinmeyen hata, sonraki modele geç

    print("Tüm Gemini modelleri başarısız oldu.")
    return None


# ------------ CLASSIFY FUNCTION -------------
def classify_text(input_text: str):
    fixed_text = input_text
    emotion = None

# Gramer fix with Gemini
    prompt = f"""
Aşağıdaki kullanıcı girdisini en kısa haliyle özetle ve dil bilgisi ve yazım hatalarına göre düzelt.
Düzeltilmiş metnin sonuna şu formatta duygu ekle:

(Metin içi duygu)

Örnek: Kargom gelmedi. (Şikayet)

Kullanıcı girdisi: "{input_text}"

Sadece düzeltilmiş metni döndür.
"""

    gemini_text = call_gemini_with_fallback(prompt)

    if gemini_text:
        # ---- Separate the emotion from the fixed text ----
        end_idx = gemini_text.rfind(")")
        start_idx = gemini_text.rfind("(", 0, end_idx)

        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            emotion = gemini_text[start_idx + 1:end_idx].strip()
            fixed_text = (gemini_text[:start_idx] + gemini_text[end_idx + 1:]).strip()
        else:
            fixed_text = gemini_text
    

    # ---- HF Space Classification ----
    try:
        response = requests.post(
            HF_SPACE_URL,
            json={"text": fixed_text},
            timeout=30
        )
        res = response.json()

        return {
            "original_text": input_text,
            "fixed_text": fixed_text,
            "duygu": emotion,
            "department": res.get("department"),
            "score": res.get("score")
        }

    except Exception as e:
        return {"error": str(e)}