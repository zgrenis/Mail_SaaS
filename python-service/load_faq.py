import json
import os
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

load_dotenv()

model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

def embed(text: str) -> str:
    vec = model.encode(text, normalize_embeddings=True).tolist()
    return "[" + ",".join(str(x) for x in vec) + "]"

def load():
    with open("sss.json", encoding="utf-8") as f:
        data = json.load(f)

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    rows = []

    for item in data:
        for variation in item["variations"]:
            rows.append((
                item["id"],
                item.get("department", ""),
                item.get("intent", ""),
                variation,
                item["response"],
                embed(variation)
            ))
            print(f"✓ {item['intent']} → {variation[:40]}")

    with conn.cursor() as cur:
        cur.execute("DELETE FROM faq_embeddings")
        psycopg2.extras.execute_values(
            cur,
            """
            INSERT INTO faq_embeddings
              (faq_id, department, intent, variation, response, embedding)
            VALUES %s
            """,
            rows,
            template="(%s,%s,%s,%s,%s,%s::vector)"
        )
    conn.commit()
    conn.close()
    print(f"\n✅ Toplam {len(rows)} variation yüklendi.")

if __name__ == "__main__":
    load()