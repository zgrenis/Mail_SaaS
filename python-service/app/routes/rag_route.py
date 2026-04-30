from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.models.chat_model import ChatRequest
from app.models.faq_model import IndexRequest
from app.services.vector_search_service import search_faq, insert_faq_embeddings
from app.services.rag_service import chat as rag_chat

router = APIRouter()


@router.post("/chat")
async def chat_endpoint(req: ChatRequest):
    faq_results = search_faq(req.message)
    history = [{"role": m.role, "content": m.content} for m in req.history]
    answer = rag_chat(req.brand_name, req.message, faq_results, history)

    return JSONResponse(
        content={"answer": answer, "sources": [r["intent"] for r in faq_results]},
        media_type="application/json; charset=utf-8"
    )


# route for admin to index faq data (adding new faq data to vector database)
@router.post("/index-faq")
async def index_faq(req: IndexRequest):
    insert_faq_embeddings([i.model_dump() for i in req.faq_data])
    return {"status": "ok", "indexed": len(req.faq_data)}
