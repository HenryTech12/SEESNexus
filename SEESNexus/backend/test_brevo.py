import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def test_brevo():
    api_key = os.getenv("BREVO_API_KEY")
    if not api_key:
        print("BREVO_API_KEY not found in .env")
        return

    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json"
    }
    
    # Using a common sender email format that often works better for initial tests
    payload = {
        "sender": {
            "name": "SEES Nexus Test",
            "email": "fakorohenry@gmail.com" # Using a likely valid email for testing
        },
        "to": [
            {
                "email": "fakorohenry@gmail.com" 
            }
        ],
        "subject": "Brevo API Test",
        "htmlContent": "<html><body><h1>Test Successful</h1><p>Brevo API is working correctly.</p></body></html>"
    }

    print(f"Testing Brevo with API Key: {api_key[:10]}...")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=payload)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
        except Exception as e:
            print(f"An error occurred: {e}")

if __name__ == "__main__":
    asyncio.run(test_brevo())
