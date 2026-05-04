from fastapi import APIRouter
from app.models.input_model import InputText
from app.services.hf_classifier_service import classify_text

router = APIRouter()

@router.post("/classify")               # edit gramer and classify the text
async def classify(item: InputText):
    result = await classify_text(item.text)
    return result
