import httpx
import json
import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

print("AI service loaded")

# Google Gemini Configuration (Primary)
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-3.6-flash"

# Groq Configuration (Fallback)
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "openai/gpt-oss-120b"

SYSTEM_PROMPT = """You are a friendly, helpful AI assistant for Syncro, a marketplace app in Sri Lanka.
Your goal is to collect service request details from a customer through a warm, natural conversation.

STRICT LANGUAGE RULES:
1. DEFAULT TO ENGLISH: If the user writes in English (e.g. "hi", "hello", "I need a cake"), you MUST respond ONLY in plain, natural ENGLISH. Do NOT use Singlish, Sinhala, or Tamil words when the user communicates in English.
2. SINHALA SCRIPT: Respond in natural spoken Sinhala (සිංහල script) ONLY if the user explicitly writes in Sinhala script or asks to speak Sinhala.
3. TAMIL SCRIPT: Respond in natural spoken Tamil (தமிழ் script) ONLY if the user explicitly writes in Tamil script or asks to speak Tamil.
4. SINGLISH / TANGLISH: Respond in Singlish or Tanglish ONLY if the user explicitly types Singlish (e.g., "mata cake ekak one") or Tanglish.

Conversation Rules:
- Ask ONLY ONE question at a time.
- Be warm, helpful, and polite.
- If an answer is vague, ask for more detail.
- Do NOT ask for information you have already collected.

You MUST collect ALL of these 6 fields before finishing:
1. category   - type of service needed (e.g. Catering, Tutoring, Photography, Cleaning, Repair, Delivery, etc.)
2. description - details of what they need
3. quantity    - how many people / units / hours needed
4. budget      - their maximum budget in LKR
5. event_date  - the date they need the service
6. location    - city or area in Sri Lanka

When you have ALL 6 fields, output EXACTLY this in English JSON format and nothing else:
READY:{"category":"...","description":"...","quantity":"...","budget":"...","event_date":"...","location":"..."}
"""

async def chat_with_ai(conversation_history: list) -> dict:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages += conversation_history

    response = None
    last_error = None

    # 1. Primary: Try Google Gemini
    if GEMINI_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    GEMINI_URL,
                    headers={
                        "Authorization": f"Bearer {GEMINI_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": GEMINI_MODEL,
                        "messages": messages
                    }
                )
            if resp.status_code == 200:
                response = resp
            else:
                detail = resp.text
                print(f"Gemini API returned status {resp.status_code}: {detail}")
                last_error = f"Gemini error ({resp.status_code}): {detail}"
        except Exception as e:
            print(f"Gemini request exception: {e}")
            last_error = str(e)

    # 2. Fallback: Try Groq if Gemini is not configured or encountered an issue
    if response is None and GROQ_API_KEY:
        try:
            print("Falling back to Groq...")
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    GROQ_URL,
                    headers={
                        "Authorization": f"Bearer {GROQ_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": GROQ_MODEL,
                        "messages": messages
                    }
                )
            if resp.status_code == 200:
                response = resp
            else:
                detail = resp.text
                print(f"Groq API returned status {resp.status_code}: {detail}")
                last_error = f"Groq error ({resp.status_code}): {detail}"
        except Exception as e:
            print(f"Groq request exception: {e}")
            last_error = str(e)

    if response is None:
        print("ALL AI PROVIDERS FAILED:", last_error)
        return {
            "status": "error",
            "message": f"AI service error: {last_error or 'No AI provider available'}"
        }

    ai_text = response.json()["choices"][0]["message"]["content"].strip()

    if "READY:" in ai_text:
        try:
            json_part = ai_text.split("READY:")[1].strip()
            if json_part.startswith("```json"):
                json_part = json_part[7:].strip()
            if json_part.startswith("```"):
                json_part = json_part[3:].strip()
            if json_part.endswith("```"):
                json_part = json_part[:-3].strip()
            if "}" in json_part:
                json_part = json_part[:json_part.rindex("}") + 1]
            order_data = json.loads(json_part)
            return {
                "status": "complete",
                "order": order_data,
                "message": "Perfect! I have all your details. Sending your request to sellers now!"
            }
        except (json.JSONDecodeError, ValueError) as err:
            print("READY JSON parse error:", err, "raw:", json_part)

    return {
        "status": "collecting",
        "message": ai_text
    }