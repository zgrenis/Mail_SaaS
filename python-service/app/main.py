from fastapi import FastAPI
from dotenv import load_dotenv

from app.routes import hf_classifier_route
from app.routes import rag_route

# Load .env file
load_dotenv()

app = FastAPI(title="Python Model Service")

# ───────────── Routers ──────────────────────
app.include_router(hf_classifier_route.router)
app.include_router(rag_route.router)


# to run shortly = python -m app.main
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=10000,
        reload=True
    )