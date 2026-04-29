import os
import psycopg2
import psycopg2.extras
from app.services.embedding_service import embed_text

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def search_faq(query: str, top_k: int = 3) -> list[dict]:
    vec = embed_text(query)
    vec_str = "[" + ",".join(str(x) for x in vec) + "]"

    sql = """
        SELECT faq_id, department, intent, response,
               1 - (embedding <=> %s::vector) AS similarity
        FROM faq_embeddings
        ORDER BY embedding <=> %s::vector
        LIMIT %s
    """
    with get_conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, (vec_str, vec_str, top_k))
            rows = cur.fetchall()

    return [dict(r) for r in rows if r["similarity"] >= 0.35]


def insert_faq_embeddings(faq_items: list[dict]):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM faq_embeddings")  # hepsini sil, yeniden yükle

        rows = []
        for item in faq_items:
            for variation in item["variations"]:
                vec = embed_text(variation)
                vec_str = "[" + ",".join(str(x) for x in vec) + "]"
                rows.append((
                    item["id"],
                    item.get("department", ""),
                    item.get("intent", ""),
                    variation,
                    item["response"],
                    vec_str
                ))

        with conn.cursor() as cur:
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
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM faq_embeddings WHERE user_id = %s", (user_id,)
            )

        rows = []
        for item in faq_items:
            for variation in item["variations"]:   # her variation ayrı satır
                vec = embed_text(variation)
                vec_str = "[" + ",".join(str(x) for x in vec) + "]"
                rows.append((
                    user_id,
                    item["id"],
                    item.get("department", ""),
                    item.get("intent", ""),
                    variation,
                    item["response"],
                    vec_str
                ))

        with conn.cursor() as cur:
            psycopg2.extras.execute_values(
                cur,
                """
                INSERT INTO faq_embeddings
                  (user_id, faq_id, department, intent, variation, response, embedding)
                VALUES %s
                """,
                rows,
                template="(%s,%s,%s,%s,%s,%s,%s::vector)"
            )
        conn.commit()
    with get_conn() as conn:
        # Önce bu kullanıcının eski FAQ'larını sil
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM faq_embeddings WHERE user_id = %s", (user_id,)
            )

        rows = []
        for item in faq_items:
            # Tüm variation'ları birleştirip tek embedding üret
            text = " ".join(item["variations"])
            vec = embed_text(text)
            vec_str = "[" + ",".join(str(x) for x in vec) + "]"
            rows.append((
                user_id,
                item["id"],
                item.get("department", ""),
                item.get("intent", ""),
                item.get("variations", []),
                item["response"],
                vec_str
            ))

        with conn.cursor() as cur:
            psycopg2.extras.execute_values(
                cur,
                """
                INSERT INTO faq_embeddings
                  (user_id, faq_id, department, intent, variations, response, embedding)
                VALUES %s
                """,
                rows,
                template="(%s,%s,%s,%s,%s,%s,%s::vector)"
            )
        conn.commit()