import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal, engine
from app.models.all_models import User, UserRole, Hardware, HardwareCategory, HardwareStatus
from app.utils.hashing import get_password_hash

async def seed_data():
    async with AsyncSessionLocal() as db:
        # Create Admin
        admin_email = "admin@unilag.edu.ng"
        result = await db.execute(select(User).where(User.email == admin_email))
        if not result.scalars().first():
            admin = User(
                full_name="System Admin",
                email=admin_email,
                password=get_password_hash("admin123"),
                department="Systems Engineering",
                level="500",
                role=UserRole.ADMIN
            )
            db.add(admin)
            print("Admin user created")

        # Sample Hardware
        hw_count = (await db.execute(select(func.count(Hardware.id)))).scalar()
        if hw_count == 0:
            hardware_items = [
                Hardware(
                    name="Oscilloscope",
                    serial_number="OSC-001",
                    category=HardwareCategory.MEASUREMENT,
                    quantity=5,
                    available_quantity=5
                ),
                Hardware(
                    name="Arduino Uno",
                    serial_number="ARD-001",
                    category=HardwareCategory.MICROCONTROLLER,
                    quantity=20,
                    available_quantity=20
                )
            ]
            db.add_all(hardware_items)
            print("Sample hardware added")

        await db.commit()

from sqlalchemy.future import select
from sqlalchemy import func

if __name__ == "__main__":
    asyncio.run(seed_data())
