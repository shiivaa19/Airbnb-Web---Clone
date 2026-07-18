import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from app.core.config import settings

router = APIRouter()

class ChatMessage(BaseModel):
    role: str # 'user' or 'assistant' or 'system'
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    response: str

@router.post("/chat", response_model=ChatResponse)
async def chat_with_grok(request: ChatRequest):
    if not settings.XAI_API_KEY:
        # If API key is not supplied, provide an informative simulated assistance response
        # indicating how they can activate the live Grok integration in SDE reviews.
        user_msg = request.messages[-1].content.lower()
        
        # Simple intelligent fallback agent
        if "beachfront" in user_msg or "beach" in user_msg:
          fallback = "🏖️ (Simulated Grok) Beachfront stays match Malibu, Maui, or Rio! I have updated your search filter."
        elif "300" in user_msg or "budget" in user_msg:
          fallback = "💸 (Simulated Grok) For stays under $300, check out Shibuya Loft, Cairo Oasis, or the Tuscan Vineyard."
        elif "tokyo" in user_msg:
          fallback = "🇯🇵 (Simulated Grok) Shibuya central loft matches Tokyo. Filtered locations for Shibuya, Japan!"
        else:
          fallback = "🤖 (Simulated Grok AI) Hi! To enable live Grok LLM generation, set your XAI_API_KEY environment variable. Let me know what stays you want to find!"
          
        return ChatResponse(response=fallback)

    headers = {
        "Authorization": f"Bearer {settings.XAI_API_KEY}",
        "Content-Type": "application/json"
    }

    # System instruction context
    system_prompt = {
        "role": "system",
        "content": (
            "You are the Airbnb AI Concierge. You assist guests in finding luxury vacation stays, "
            "vacation rentals, and cabins. Be helpful, concise, and friendly. "
            "We have stays worldwide including Tokyo, Paris, Aspen, Santorini, Kyoto, Malibu, Rome, New York, Sydney, and Cairo. "
            "If the user asks for beachfront, Tokyo lofts, or properties under $300, suggest them! "
            "Respond in clean, simple plain text or markdown."
        )
    }

    messages = [system_prompt] + [
        {"role": m.role, "content": m.content} for m in request.messages
    ]

    payload = {
        "model": "grok-beta",
        "messages": messages,
        "temperature": 0.7
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post("https://api.xai.com/v1/chat/completions", json=payload, headers=headers)
            if res.status_code != 200:
                # Return informative error from xAI to assist debugging
                raise HTTPException(
                    status_code=res.status_code,
                    detail=f"xAI Grok API error: {res.text}"
                )
            
            data = res.json()
            completion_text = data["choices"][0]["message"]["content"]
            return ChatResponse(response=completion_text)
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to communicate with Grok API: {str(e)}"
        )
