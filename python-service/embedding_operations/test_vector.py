import os
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

# load .env file
load_dotenv()

# load model
print("Model yükleniyor...")
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

query = 'kargom nerede'    
print(f"Sorgu işleniyor: {query}")

# create vector from query text
vec = model.encode(query, normalize_embeddings=True).tolist()
# convert to postgres pgvector format and list is enough

try:
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur: # realDictCursor to get results as dictionary
        cur.execute('''
            SELECT intent, variation, response,
                   1 - (embedding <=> %s::vector) AS similarity 
            FROM faq_embeddings
            ORDER BY embedding <=> %s::vector
            LIMIT 3
        ''', (vec, vec))     # <=> calculate cosine similarity  ::vector convert to postgres vector type not string etc.
        
        results = cur.fetchall()
        if not results:
            print("Sonuç bulunamadı.")
        
        for r in results:
            print(f"[{r['similarity']:.2f}] {r['intent']} → {r['variation']}")
            print(f"       {r['response'][:80]}...")
            print()
    conn.close()
except Exception as e:
    print(f"Hata oluştu: {e}")