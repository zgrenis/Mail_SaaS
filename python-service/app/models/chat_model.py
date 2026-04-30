from pydantic import BaseModel


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    brand_name: str
    message: str
    history: list[Message] = []
