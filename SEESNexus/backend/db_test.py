import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def test_db():
    url = os.getenv("DATABASE_URL")
    if url.startswith("postgresql+asyncpg://"):
        url = url.replace("postgresql+asyncpg://", "postgresql://")
    print(f"Testing connection to: {url.split('@')[1] if '@' in url else url}")
    try:
        # Force SSL
        import ssl
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        # Strip query params if any
        base_url = url.split('?')[0]
        
        conn = await asyncpg.connect(base_url, ssl=ctx)
        print("Connection successful!")
        await conn.close()
    except Exception as e:
        print(f"Connection failed: {type(e).__name__}: {e}")

if __name__ == "__main__":
    asyncio.run(test_db())
