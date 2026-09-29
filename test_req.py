import urllib.request
import json

payload = {
  "email": "test99@example.com",
  "password": "password123",
  "first_name": "Test",
  "last_name": "User",
  "location": "Kandy",
  "phone_number": "0771234567"
}

req = urllib.request.Request("http://127.0.0.1:8000/auth/register", data=json.dumps(payload).encode(), headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as res:
        print("STATUS:", res.status)
        print("RESPONSE:", res.read().decode())
except Exception as e:
    print("ERROR:", str(e))
