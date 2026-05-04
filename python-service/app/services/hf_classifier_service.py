import httpx # provide async requests unlike requests library
from google import genai
import os
from dotenv import load_dotenv
import asyncio

load_dotenv()

HF_SPACE_URL = os.getenv("HF_SPACE_URL")

# ---- Gemini Settings ----
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Free tier models in case of quota exceeded
FALLBACK_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash"
]

env_model = os.getenv("MODEL_NAME")
if env_model and env_model not in FALLBACK_MODELS:
    FALLBACK_MODELS.insert(0, env_model)

client = None


# Initialize Gemini client
if GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f"Gemini client oluşturulamadı: {e}")
        client = None


async def call_gemini(prompt: str, retries: int = 2) -> str | None:
    if not client:
        return None

    for model in FALLBACK_MODELS:
        for attempt in range(retries):
            try:
               r = await client.aio.models.generate_content(model=model, contents=prompt) # aio = async input output
               return r.candidates[0].content.parts[0].text.strip()
            except Exception as e:
                err_str = str(e)
                if "503" in err_str or "UNAVAILABLE" in err_str:
                    wait = 2 ** attempt
                    print(f"Gemini 503 ({model}), {wait}s bekleniyor...")
                    await asyncio.sleep(wait)  # time.sleep yerine
                elif "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                    print(f"Gemini Kota Doldu ({model}), diğer modele geçiliyor...")
                    break 
                elif "404" in err_str or "NOT_FOUND" in err_str:
                    print(f"Model bulunamadı ({model}), atlanıyor...")
                    break
                else:
                    print(f"Gemini hatası ({model}): {e}")
                    break # general error code

    print("Gemini tüm modeller ve denemeler başarısız.")
    return None
# ------------ CLASSIFY FUNCTION -------------
async def classify_text(input_text: str):
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

    gemini_text = await call_gemini(prompt)

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
        async with httpx.AsyncClient() as http:
            response = await http.post(HF_SPACE_URL, json={"text": fixed_text}, timeout=30) #async post request with httpx
            res = response.json()

        return {
            "original_text": input_text,
            "fixed_text": fixed_text,
            "emotion": emotion,
            "department": res.get("department"),
            "score": res.get("score")
        }

    except Exception as e:
        return {"error": str(e)}