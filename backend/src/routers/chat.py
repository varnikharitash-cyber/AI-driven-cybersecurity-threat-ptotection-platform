from fastapi import APIRouter
from pydantic import BaseModel
from src.services.ai_service import ai_service
from src.services.system_service import get_system_metrics
from fastapi import Depends
from src.auth import verify_token

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/")
async def chat(request: ChatRequest, user=Depends(verify_token)):
    sys = get_system_metrics()
    context = f"CPU: {sys['cpu']}%, RAM: {sys['memory']}%, NET: {sys['recv']}MB"
    response = ai_service.chat(request.message, context)
    return {"response": response}
