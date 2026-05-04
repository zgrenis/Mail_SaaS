import os
from groq import Groq

client = Groq(api_key=os.environ["GROQ_API_KEY"])

SYSTEM = """Sen {brand_name} adlı giyim mağazasının Türkçe müşteri hizmetleri asistanısın. Lojistik, Teknik Destek(web sitesi ve mobil için), Finans ve Müşteri hizmetleri departmanlarımız var. 
Aşağıdaki SSS bilgilerini kullanarak kullanıcıya sıcak ve doğal bir dille yardım et.
SSS'de cevap yoksa dürüstçe söyle, müşteri hizmetlerine yönlendir.
Önceki mesajları hatırla. Kullanıcıya "siz" diye hitap et. Sadece Türkçe yanıt ver.

SSS:
{context}"""

def chat(brand_name: str, message: str, faq_results: list[dict], history: list[dict]) -> str:
    context = "\n".join(                                                  # take faq results and join them (3 results returned)
        f"[{r['department']}] {r['response']}" for r in faq_results
    ) or "Bu konuda Sıkça Sorulan Sorular'da bilgi yok."    

    messages = history[-10:] + [{"role": "user", "content": message}]   # last 10 messages should be #! not available for now

    res = client.chat.completions.create(                               # request to groq
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM.format(brand_name=brand_name, context=context)},
            *messages
        ],
        temperature=0.5,
        max_tokens=512,
    )
    return res.choices[0].message.content