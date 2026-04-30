from pydantic import BaseModel


class FAQItem(BaseModel):
    id: int
    department: str
    intent: str
    variations: list[str]
    response: str


class IndexRequest(BaseModel):
    faq_data: list[FAQItem]
