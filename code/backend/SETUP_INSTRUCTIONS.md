# Syncro AI Chatbot — Setup Instructions

## What you're adding
3 files that give Syncro a working AI chatbot:
1. `ai_service.py` — talks to Ollama on the server
2. `chat.py` — the FastAPI route
3. `RFPChatbot.jsx` — the React component for the frontend

---

## Step 1 — Put the files in the right place

```
code/backend/app/
├── ai_service.py        ← NEW (put it here, next to main.py)
├── api/
│   ├── chat.py          ← NEW (put it here, next to bids.py)
│   └── ...existing files
```

For the frontend (React / Next.js):
```
code/frontend/src/components/
└── RFPChatbot.jsx       ← NEW (put it wherever your components live)
```

---

## Step 2 — Install the one new dependency

In your backend folder, run:
```
pip install httpx
```

---

## Step 3 — Register the route in main.py

Open `code/backend/app/main.py` and add these two lines:

**At the top, with the other imports:**
```python
from .api import chat  # add "chat" here
```

**After the existing app.include_router lines:**
```python
app.include_router(chat.router)
```

It should look like this when done:
```python
from .api import listings, auth, profiles, orders, reviews, bids, chat  # ← added chat

app.include_router(listings.router)
app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(orders.router)
app.include_router(reviews.router)
app.include_router(bids.router)
app.include_router(chat.router)   # ← added this line
```

---

## Step 4 — Start the SSH tunnel (every time you work)

Open a terminal and run:
```
ssh -N -L 11434:localhost:11434 -J e22052@tesla.ce.pdn.ac.lk e22052@10.40.18.12
```
Enter your password. Keep this terminal open — do not close it.

---

## Step 5 — Use the React component in your frontend

```jsx
import RFPChatbot from "./components/RFPChatbot";

function SomePage() {
  const token = localStorage.getItem("access_token"); // or wherever you store it

  const handleComplete = ({ bid_request_id, order }) => {
    console.log("BidRequest created:", bid_request_id);
    console.log("Order details:", order);
    // e.g. navigate to /bids/requests/${bid_request_id}
  };

  return (
    <div>
      <h1>Request a Service</h1>
      <RFPChatbot authToken={token} onComplete={handleComplete} />
    </div>
  );
}
```

---

## Step 6 — Test it

With your SSH tunnel running and FastAPI started (`uvicorn app.main:app --reload`), test:

```bash
curl -X POST http://localhost:8000/chat/rfp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "conversation": [
      {"role": "user", "content": "I need catering for a birthday party"}
    ]
  }'
```

You should get back a JSON response with the AI asking a follow-up question.

---

## How it works end-to-end

1. Customer opens chatbot → AI asks "What service are you looking for?"
2. Customer replies → AI asks follow-up questions one at a time
3. After collecting: category, description, quantity, budget, date, location
4. AI returns the data as structured JSON
5. FastAPI saves it as a `BidRequest` in your PostgreSQL database
6. Frontend shows "Sent to sellers!" — sellers can now see and bid on it

---

## Switching to the better model (for demo/production)

In `ai_service.py`, change line 4:
```python
MODEL = "llama3.2:3b"    # fast, for testing
# to:
MODEL = "gemma3:27b"     # smarter, for production (already on your server)
```
