import requests
import json
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
model_name = "gemini-2.5-flash"

if GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
    except:
        client = None


# ------------ CLASSIFY FUNCTION -------------
def classify_text(input_text: str):
    fixed_text = input_text
    emotion = None

    # Gramer fix with Gemini
    if client:
        prompt = f"""
Aşağıdaki kullanıcı girdisini dil bilgisi ve yazım hatalarına göre düzelt.
Düzeltilmiş metnin sonuna şu formatta duygu ekle:

(Metin içi duygu)

Örnek: Kargom gelmedi. (Şikayet)

Kullanıcı girdisi: "{input_text}"

Sadece düzeltilmiş metni döndür.
"""
        try:
            r = client.models.generate_content(
                model=model_name,
                contents=prompt
            )

            # ---- Getting the correct text for Gemini 2.0 ----
            gemini_text = r.candidates[0].content.parts[0].text.strip()
            fixed_text = gemini_text

            # ---- Pull emotion ----
            end_idx = gemini_text.rfind(")")
            start_idx = gemini_text.rfind("(", 0, end_idx)

            if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                # Pull Emotion
                emotion = gemini_text[start_idx + 1:end_idx].strip()

                # Remove emotion from text
                fixed_text = (gemini_text[:start_idx] + gemini_text[end_idx+1:]).strip()

        except Exception as e:
            print("Gemini Hatası:", e)
            fixed_text = input_text
            emotion = None

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
