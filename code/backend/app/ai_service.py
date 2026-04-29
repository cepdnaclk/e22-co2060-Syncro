import httpx
import json
import os
from dotenv import load_dotenv

load_dotenv()

print("GROQ ai_service loaded")

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL = "llama-3.1-8b-instant"

SYSTEM_PROMPT = """You are a friendly assistant for Syncro, a marketplace app in Sri Lanka.
Your job is to collect service request details from a customer through a simple conversation.

You MUST collect ALL of these fields before finishing:
1. category   - type of service needed (e.g. Catering, Tutoring, Photography, Cleaning, Repair, Delivery, etc.)
2. description - exactly what they need
3. quantity    - how many people / units / hours needed
4. budget      - their maximum budget in LKR
5. event_date  - the date they need the service
6. location    - city or area in Sri Lanka

Rules:
- Ask ONE question at a time
- Be friendly and simple
- If the answer is vague, ask for more detail
- Do NOT ask for something you already have

When you have ALL 6 fields, output EXACTLY this and nothing else:
READY:{"category":"...","description":"...","quantity":"...","budget":"...","event_date":"...","location":"..."}
"""

async def chat_with_ai(conversation_history: list) -> dict:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages += conversation_history

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                GROQ_URL,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": MODEL,
                    "messages": messages
                }
            )
        print("Groq status code:", response.status_code)
        print("Groq response:", response.text)
        response.raise_for_status()
    except Exception as e:
        print("FULL ERROR:", str(e))
        return {
            "status": "error",
            "message": f"AI service error: {str(e)}"
        }

    ai_text = response.json()["choices"][0]["message"]["content"].strip()

    if "READY:" in ai_text:
        try:
            json_part = ai_text.split("READY:")[1].strip()
            if "}" in json_part:
                json_part = json_part[:json_part.rindex("}") + 1]
            order_data = json.loads(json_part)
            return {
                "status": "complete",
                "order": order_data,
                "message": "Perfect! I have all your details. Sending your request to sellers now!"
            }
        except (json.JSONDecodeError, ValueError):
            pass

    return {
        "status": "collecting",
        "message": ai_text
    }