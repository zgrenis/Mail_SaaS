from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.models.chat_model import ChatRequest
from app.services.vector_search_service import search_faq
from app.services.rag_service import chat as rag_chat

router = APIRouter()


@router.post("/chat")             # convert to embedding, search on db, send to groq, return the answer 
async def chat_endpoint(req: ChatRequest):
    faq_results = search_faq(req.message)   
    history = [{"role": m.role, "content": m.content} for m in req.history]
    answer = rag_chat(req.brand_name, req.message, faq_results, history)

    return JSONResponse(
        content={"answer": answer, "sources": [r["intent"] for r in faq_results]},
        media_type="application/json; charset=utf-8"
    )


