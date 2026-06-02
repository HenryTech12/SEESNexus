import asyncio
from app.database import engine, Base
from app.models.all_models import User, Hardware, HardwareCategory, HardwareStatus

async def init_db():
    async with engine.begin() as conn:
        # Import all models here to ensure they are registered with Base.metadata
        print("Dropping existing tables...")
        await conn.run_sync(Base.metadata.drop_all)
        print("Creating tables...")
        await conn.run_sync(Base.metadata.create_all)
        print("Tables created successfully!")

if __name__ == "__main__":
    asyncio.run(init_db())
