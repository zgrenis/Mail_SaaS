from fastapi import APIRouter
from app.models.chat_model import ChatRequest
from app.services.vector_search_service import search_faq
from app.services.rag_service import chat 
from fastapi.responses import StreamingResponse
import json

router = APIRouter()


@router.post("/chat")             # convert to embedding, search on db, send to groq, return the answer 
async def chat_endpoint(req: ChatRequest):
    faq_results = search_faq(req.message)
    history = [{"role": m.role, "content": m.content} for m in req.history]

    #? convert to chunk format which backend expects
    def sse_generator():
        for token in chat(req.brand_name, req.message, faq_results, history):  # catch the chat() yield's chunks
            yield f"data: {json.dumps({'chunk': token})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        sse_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",          #disable nginx buffering
        }
    )


