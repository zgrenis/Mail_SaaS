import os
from groq import Groq

client = Groq(api_key=os.environ["GROQ_API_KEY"])

SYSTEM = """Sen {brand_name} adlı  kurumsal bir giyim markasının Türkçe müşteri hizmetleri asistanısın. Lojistik, Teknik Destek(web sitesi ve mobil için), Finans ve Müşteri hizmetleri departmanlarımız var. 
Aşağıdaki SSS bilgilerini kullanarak kullanıcıya sıcak ve doğal bir dille yardım et. Konuşma üslubun  çözüm üretici olsun. Kullanıcıyı sıkma ve ona güven ver.
SSS'de cevap yoksa dürüstçe söyle, müşteri hizmetleri mail adresi olan enis.destek@gmail.com adresine yönlendir.
Önceki mesajları hatırla. Kullanıcıya "siz" diye hitap et. Sadece Türkçe yanıt ver.

SSS:
{context}"""

def chat(brand_name: str, message: str, faq_results: list[dict], history: list[dict]) -> str:
    context = "\n".join(                                                  # take faq results and join them (3 results returned)
        f"[{r['department']}] {r['response']}" for r in faq_results       # JSON to prompt formatting
    ) or "Bu konuda Sıkça Sorulan Sorular'da bilgi yok."    

    messages = history[-10:] + [{"role": "user", "content": message}]   # last 10 messages should be 

    #? open stream connection with groq to pull response chunk by chunk
    stream = client.chat.completions.create(                               # request to groq
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=[
            {"role": "system", "content": SYSTEM.format(brand_name=brand_name, context=context)},
            *messages
        ],
        temperature=0.5,
        max_tokens=512,
        stream=True,           # stream enabled for real time response 
    )

    #? send every response that come from groq to backend via yield 
    #? yield is like return but it returns values without terminating the function
    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta 