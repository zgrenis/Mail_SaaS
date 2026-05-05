import os
import logging
import threading
import psycopg2
import psycopg2.extras
from psycopg2 import pool
from contextlib import contextmanager
from app.services.embedding_service import embed_text

logger = logging.getLogger(__name__)

_pool: pool.SimpleConnectionPool | None = None
_pool_lock = threading.Lock()

#? if a few thread try to get the pool at the same time, 
#? _pool_lock prevents confusing them and creating multiple pool (thread safe).


def get_pool() -> pool.SimpleConnectionPool:      #? lazy loading for pool. return pool.SimpleConnectionPool
    global _pool
    if _pool is None:
        with _pool_lock:
            if _pool is None:  # double-checked locking
                db_url = os.environ.get("DATABASE_URL") # .get("") is safer than [""]
                if not db_url:
                    raise RuntimeError("DATABASE_URL environment variable not set.")
                _pool = pool.SimpleConnectionPool(minconn=1, maxconn=10, dsn=db_url)
                logger.info("Connection pool created.")
    return _pool

 
@contextmanager       #? context manager that manages the connection (returns connection when needed and closes it when done)
def _get_conn():     
    p = get_pool()
    conn = p.getconn()
    try:
        yield conn  #? returns the db connection when needed and yield doesnt forget address
    finally:
        p.putconn(conn) #? returns the connection to the pool when done


_SEARCH_SQL = """
    WITH scored AS (
        SELECT
            id, faq_id, department, intent, response,
            1 - (embedding <=> %s::vector) AS similarity
        FROM faq_embeddings
    )
    SELECT * FROM scored
    WHERE similarity >= %s
    ORDER BY similarity DESC
    LIMIT %s
"""


def search_faq(
    query: str,
    top_k: int = 3,
    min_similarity: float = 0.35,
) -> list[dict]:
    try:
        vec = embed_text(query) # get embedding for the query (list of float)
    except RuntimeError:
        logger.exception("Embedding failed for query=%r", query)
        raise

    vec_str = f"[{','.join(map(str, vec))}]" 
    
    #? convert float to string because postgresql doesnt support psycopg2 list, So we convert it to string format that postgresql understands and postgre converts it back to vector. 

    try:
        with _get_conn() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(_SEARCH_SQL, (vec_str, min_similarity, top_k))
                return [dict(r) for r in cur.fetchall()]   # Convert each line to Python dict and return it as a list. (removing RealDictRow object)
    except psycopg2.Error:
        logger.exception("search_faq DB error | query=%r", query)
        raise # reraise the exception to let the caller handle it.