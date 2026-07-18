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
    system_prompt_text = (
        "You are the friendly, helpful, and premium Airbnb AI Concierge. "
        "Your goal is to assist users with their travel queries, recommend properties from our database, "
        "and help them plan their stays. "
        "We have properties in: Tokyo (Japan), Paris (France), Aspen (United States), Santorini (Greece), "
        "Kyoto (Japan), Malibu (United States), Rome (Italy), New York (United States), Sydney (Australia), Cairo (Egypt), Cape Town (South Africa). "
        "We also dynamically support listings in other searched locations (like Goa, Delhi, Mumbai, Kerala). "
        "Be warm, professional, and highly conversational. Greet users back, answer general questions, "
        "provide helpful tips, and suggest relevant stays in a friendly manner. Keep responses engaging, helpful, and natural."
    )

    # 1. Attempt Groq / Grok
    if settings.XAI_API_KEY:
        try:
            print("Attempting to connect to Groq/Grok API...")
            is_groq = settings.XAI_API_KEY.startswith("gsk_")
            url = "https://api.groq.com/openai/v1/chat/completions" if is_groq else "https://api.xai.com/v1/chat/completions"
            model = "llama-3.3-70b-versatile" if is_groq else "grok-beta"

            headers = {
                "Authorization": f"Bearer {settings.XAI_API_KEY}",
                "Content-Type": "application/json"
            }

            messages = [
                {"role": "system", "content": system_prompt_text}
            ] + [
                {"role": m.role, "content": m.content} for m in request.messages
            ]

            payload = {
                "model": model,
                "messages": messages,
                "temperature": 0.2
            }

            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(url, json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    completion_text = data["choices"][0]["message"]["content"]
                    print(f"SUCCESS: Responded using Groq/Grok ({model})!")
                    return ChatResponse(response=completion_text)
                else:
                    print(f"Groq/Grok API returned error status: {res.status_code}. Detail: {res.text}")
        except Exception as e:
            print(f"Groq/Grok connection failed with error: {e}")

    # 2. Fallback to Gemini
    if settings.GEMINI_API_KEY:
        try:
            print("Attempting to connect to Gemini API...")
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            
            gemini_contents = []
            for m in request.messages:
                role = "model" if m.role == "assistant" else "user"
                gemini_contents.append({
                    "role": role,
                    "parts": [{"text": m.content}]
                })

            payload = {
                "systemInstruction": {
                    "parts": [{"text": system_prompt_text}]
                },
                "contents": gemini_contents,
                "generationConfig": {
                    "temperature": 0.2
                }
            }

            headers = {
                "Content-Type": "application/json"
            }

            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(url, json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    completion_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    print("SUCCESS: Responded using Gemini (gemini-1.5-flash)!")
                    return ChatResponse(response=completion_text)
                else:
                    print(f"Gemini API returned error status: {res.status_code}. Detail: {res.text}")
        except Exception as e:
            print(f"Gemini connection failed with error: {e}")

    # 3. Raise error if both keys fail to prevent returning static simulated answers
    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail="Both Groq/Grok and Gemini APIs failed to respond. Please check your API keys."
    )
