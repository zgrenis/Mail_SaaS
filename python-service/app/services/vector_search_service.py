import os
import logging
import psycopg2
import psycopg2.extras
from psycopg2 import pool
from app.services.embedding_service import embed_text

logger = logging.getLogger(__name__)        #? it will show errors and infos

# Connection pool to manage database connections
_pool: pool.SimpleConnectionPool | None = None  #? lazy loading connection pool
def get_pool():
    global _pool
    try:
        if _pool is None:
            _pool = pool.SimpleConnectionPool(
                minconn=1,
                maxconn=10,
                dsn=os.environ["DATABASE_URL"],
            )
            logger.info("Connection pool created.")
        return _pool
    except KeyError:
        logger.error("DATABASE_URL environment variable not found.")
    except Exception as e:
        logger.exception("An error occurred while creating the connection pool.")

def _to_vec_str(vec: list[float]) -> str:               #? Private helper function for convert vector to string
    return "[" + ",".join(str(x) for x in vec) + "]"


def search_faq(
    query: str, #input
    top_k: int = 3,#how many results
    min_similarity: float = 0.35,#minimum similarity
) -> list[dict]: #return list of dictionaries

    try:
        vec_str = _to_vec_str(embed_text(query))
    except RuntimeError as e:
        logger.error("Embedding hatası | hata=%s", e)
        raise                                       #? raise stops the function and sends the error back

    sql = """
        WITH scored AS (
            SELECT
                id,
                faq_id,
                department,
                intent,
                response,
                1 - (embedding <=> %(vec)s::vector) AS similarity
            FROM faq_embeddings
        )
        SELECT * FROM scored
        WHERE similarity >= %(min_sim)s
        ORDER BY similarity DESC
        LIMIT %(top_k)s
    """

    p = get_pool()
    conn = p.getconn()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur: #? cursor parameters provide access data like row["column_name"] format
            cur.execute(sql, {
                "vec": vec_str,
                "min_sim": min_similarity,
                "top_k": top_k,
            })
            return [dict(r) for r in cur.fetchall()]    #? returns list of dictionaries
    except psycopg2.Error as e:
        logger.error("search_faq failed | Error=%s", e)
        raise
    finally:
        p.putconn(conn)  # return connection to the pool