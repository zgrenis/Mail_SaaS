from fastapi import FastAPI
from app.routes import classify
from app.routes import hf_classifier_route
from dotenv import load_dotenv
import os

#load .env file 
load_dotenv()

app = FastAPI(title="Python Model Service")

# Routers
app.include_router(classify.router) #router variable from classify.py
app.include_router(hf_classifier_route.router) #router variable from hf_classifier.py

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