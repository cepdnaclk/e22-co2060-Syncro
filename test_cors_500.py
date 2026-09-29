import urllib.request
import json

payload = {
  "email": "failcors3@test.com",
  "password": "password123",
  "first_name": "A",
  "last_name": "B",
  "location": "Kandy",
  "phone_number": "0771234567"
}

req = urllib.request.Request("http://127.0.0.1:8000/auth/register", data=json.dumps(payload).encode(), headers={'Content-Type': 'application/json', 'Origin': 'http://localhost:5173'})
try:
    with urllib.request.urlopen(req) as res:
        print("STATUS:", res.status)
        print("HEADERS:", res.headers)
        print("RESPONSE:", res.read().decode())
except urllib.error.HTTPError as e:
    print("STATUS:", e.code)
    print("HEADERS:", e.headers)
    print("ERROR:", e.read().decode())
