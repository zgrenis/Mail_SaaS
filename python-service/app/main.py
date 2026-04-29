from fastapi import FastAPI
from app.routes import classify
from app.routes import hf_classifier_route
from dotenv import load_dotenv
import os

from pydantic import BaseModel
from app.services.vector_search_service import search_faq, insert_faq_embeddings
from app.services.rag_service import chat as rag_chat

from fastapi.responses import JSONResponse
import json


#load .env file 
load_dotenv()

app = FastAPI(title="Python Model Service")

# Routers
app.include_router(classify.router) #router variable from classify.py
app.include_router(hf_classifier_route.router) #router variable from hf_classifier.py


class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    brand_name: str
    message: str
    history: list[Message] = []

class FAQItem(BaseModel):
    id: int
    department: str
    intent: str
    variations: list[str]
    response: str

class IndexRequest(BaseModel):
    faq_data: list[FAQItem]
    
@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    faq_results = search_faq(req.message)
    history = [{"role": m.role, "content": m.content} for m in req.history]
    answer = rag_chat(req.brand_name, req.message, faq_results, history)
    
    return JSONResponse(
        content={"answer": answer, "sources": [r["intent"] for r in faq_results]},
        media_type="application/json; charset=utf-8"
    )
    

@app.post("/index-faq")
async def index_faq(req: IndexRequest):
    insert_faq_embeddings([i.model_dump() for i in req.faq_data])  # user_id yok
    return {"status": "ok", "indexed": len(req.faq_data)}

@app.get("/hello")
def hello():
    return {"message": "Hello from Python FastAPI!"}

# to run shortly = python -m app.main 
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=7860,  # static port for HF Spaces 
        reload=False  # it must be false in Spaces'te 
    )