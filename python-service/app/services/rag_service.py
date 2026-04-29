import os
from groq import Groq

client = Groq(api_key=os.environ["GROQ_API_KEY"])

SYSTEM = """Sen {brand_name} adlı giyim mağazasının Türkçe müşteri hizmetleri asistanısın.
Aşağıdaki SSS bilgilerini kullanarak kullanıcıya sıcak ve doğal bir dille yardım et.
SSS'de cevap yoksa dürüstçe söyle, müşteri hizmetlerine yönlendir.
Önceki mesajları hatırla. Kullanıcıya "siz" diye hitap et. Sadece Türkçe yanıt ver.

SSS:
{context}"""

def chat(brand_name: str, message: str, faq_results: list[dict], history: list[dict]) -> str:
    context = "\n".join(
        f"[{r['department']}] {r['response']}" for r in faq_results
    ) or "Bu konuda SSS'de bilgi yok."

    messages = history[-10:] + [{"role": "user", "content": message}]

    res = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM.format(brand_name=brand_name, context=context)},
            *messages
        ],
        temperature=0.5,
        max_tokens=512,
    )
    return res.choices[0].message.content