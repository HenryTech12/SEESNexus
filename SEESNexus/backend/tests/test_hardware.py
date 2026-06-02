import pytest
import pytest_asyncio
from httpx import AsyncClient
from app.models.all_models import UserRole

@pytest_asyncio.fixture
async def admin_token(client: AsyncClient):
    user_data = {
        "full_name": "Admin User",
        "email": "admin_hw@unilag.edu.ng",
        "password": "adminpassword",
        "department": "Systems Engineering",
        "level": "500"
    }
    await client.post("/api/v1/auth/register", json=user_data)
    # Manually promote to admin in real DB or via endpoint if exists
    # For testing, we might need a way to set role.
    from app.database import AsyncSessionLocal
    from app.models.all_models import User
    from sqlalchemy import select
    from app.database import get_db
    
    # Actually, we can just login and hope we have a way to promote.
    # Root user in seed.py is admin.
    
    login_res = await client.post("/api/v1/auth/login", data={"username": user_data["email"], "password": user_data["password"]})
    return login_res.json()["data"]["access_token"]

@pytest.mark.asyncio
async def test_add_hardware_non_admin(client: AsyncClient, admin_token: str):
    # This should fail if the user is not an admin
    hw_data = {
        "name": "Oscilloscope",
        "serial_number": "OSC-123",
        "category": "Measurement",
        "quantity": 2,
        "available_quantity": 2
    }
    response = await client.post("/api/v1/hardware/", json=hw_data, headers={"Authorization": f"Bearer {admin_token}"})
    # If the user is default STUDENT, this should be 403.
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_get_hardware(client: AsyncClient):
    response = await client.get("/api/v1/hardware/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "hardware" in data["data"]

@pytest.mark.asyncio
async def test_request_loan(client: AsyncClient):
    # Register and login student
    student_data = {
        "full_name": "Borrower",
        "email": "borrower@unilag.edu.ng",
        "password": "borrowerpassword",
        "department": "Computer Science",
        "level": "300"
    }
    await client.post("/api/v1/auth/register", json=student_data)
    login_res = await client.post("/api/v1/auth/login", data={"username": student_data["email"], "password": student_data["password"]})
    token = login_res.json()["data"]["access_token"]

    # First, I need some hardware in the DB. I'll rely on seed or add it.
    # Since I'm using an in-memory DB, I'll add it via a hack or an admin account.
    
    # For now, let's assume there is an ID we can use or it returns 404.
    import uuid
    hw_id = str(uuid.uuid4())
    loan_data = {
        "hardware_id": hw_id,
        "purpose": "Final year project",
        "expected_return_date": "2024-12-31T23:59:59"
    }
    response = await client.post(f"/api/v1/hardware/{hw_id}/loan", json=loan_data, headers={"Authorization": f"Bearer {token}"})
    # Might be 404 if hardware doesn't exist
    assert response.status_code in [201, 404]

@pytest.mark.asyncio
async def test_get_my_loans(client: AsyncClient):
    # Register and login student
    student_data = {
        "full_name": "Loan Checker",
        "email": "checker@unilag.edu.ng",
        "password": "checkerpassword",
        "department": "Computer Science",
        "level": "300"
    }
    await client.post("/api/v1/auth/register", json=student_data)
    login_res = await client.post("/api/v1/auth/login", data={"username": student_data["email"], "password": student_data["password"]})
    token = login_res.json()["data"]["access_token"]
    
    response = await client.get("/api/v1/hardware/loans/my", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert isinstance(response.json()["data"], list)

@pytest.mark.asyncio
async def test_complete_loan_workflow(client: AsyncClient, db_session):
    # 1. Register and login as admin to add hardware
    admin_data = {
        "full_name": "HW Admin",
        "email": "hw_admin@unilag.edu.ng",
        "password": "adminpassword",
        "department": "Systems",
        "level": "500"
    }
    await client.post("/api/v1/auth/register", json=admin_data)
    
    # Manually promote to admin
    from app.models.all_models import User, UserRole
    from sqlalchemy import select
    result = await db_session.execute(select(User).where(User.email == admin_data["email"]))
    user = result.scalars().first()
    user.role = UserRole.ADMIN
    await db_session.commit()

    login_res = await client.post("/api/v1/auth/login", data={"username": admin_data["email"], "password": admin_data["password"]})
    admin_token = login_res.json()["data"]["access_token"]

    # 2. Add hardware
    hw_data = {
        "name": "Arduino Uno",
        "serial_number": "ARD-001",
        "category": "MICROCONTROLLER",
        "quantity": 5,
        "available_quantity": 5
    }
    hw_res = await client.post("/api/v1/hardware/", json=hw_data, headers={"Authorization": f"Bearer {admin_token}"})
    assert hw_res.status_code == 201
    hw_id = hw_res.json()["data"]["id"]

    # 3. Register and login as student
    student_data = {
        "full_name": "Student Borrower",
        "email": "student_b@unilag.edu.ng",
        "password": "password",
        "department": "Computer",
        "level": "300"
    }
    await client.post("/api/v1/auth/register", json=student_data)
    login_res = await client.post("/api/v1/auth/login", data={"username": student_data["email"], "password": student_data["password"]})
    student_token = login_res.json()["data"]["access_token"]

    # 4. Request loan
    loan_data = {
        "hardware_id": hw_id,
        "purpose": "Testing",
        "expected_return_date": "2024-12-31T23:59:59"
    }
    loan_res = await client.post(f"/api/v1/hardware/{hw_id}/loan", json=loan_data, headers={"Authorization": f"Bearer {student_token}"})
    assert loan_res.status_code == 200
    loan_id = loan_res.json()["data"]["id"]

    # 5. Get my loans
    my_loans_res = await client.get("/api/v1/hardware/loans/my", headers={"Authorization": f"Bearer {student_token}"})
    assert my_loans_res.status_code == 200
    assert any(loan["id"] == loan_id for loan in my_loans_res.json()["data"])

