import pytest
import pytest_asyncio
from httpx import AsyncClient

# Admin operations usually require Admin role. 
# In conftest, we can create an admin user or override the check.

@pytest_asyncio.fixture
async def admin_client(client: AsyncClient, db_session):
    from app.models.all_models import User, UserRole
    from app.utils.hashing import get_password_hash
    from sqlalchemy.future import select
    
    admin_data = {
        "full_name": "Admin Panel User",
        "email": "admin_panel@unilag.edu.ng",
        "password": "adminpassword",
        "department": "Systems Engineering",
        "level": "500",
        "role": UserRole.ADMIN
    }
    
    # Check if admin already exists to avoid IntegrityError
    result = await db_session.execute(select(User).where(User.email == admin_data["email"]))
    admin = result.scalars().first()
    
    if not admin:
        admin = User(
            full_name=admin_data["full_name"],
            email=admin_data["email"],
            password=get_password_hash(admin_data["password"]),
            department=admin_data["department"],
            level=admin_data["level"],
            role=admin_data["role"]
        )
        db_session.add(admin)
        await db_session.commit()
    
    login_res = await client.post("/api/v1/auth/login", data={"username": admin_data["email"], "password": admin_data["password"]})
    token = login_res.json()["data"]["access_token"]
    client.headers.update({"Authorization": f"Bearer {token}"})
    return client

@pytest.mark.asyncio
async def test_admin_get_users(admin_client: AsyncClient):
    response = await admin_client.get("/api/v1/admin/users")
    assert response.status_code == 200
    assert isinstance(response.json()["data"], list)

@pytest.mark.asyncio
async def test_admin_get_loans(admin_client: AsyncClient):
    response = await admin_client.get("/api/v1/admin/loans")
    assert response.status_code == 200
    assert isinstance(response.json()["data"], list)

@pytest.mark.asyncio
async def test_admin_dashboard_stats(admin_client: AsyncClient):
    response = await admin_client.get("/api/v1/admin/dashboard")
    assert response.status_code == 200
    assert "total_users" in response.json()["data"]

@pytest.mark.asyncio
async def test_admin_update_role(admin_client: AsyncClient):
    # Create a student first
    student_data = {
        "full_name": "To Be Admin",
        "email": "tobeadmin@unilag.edu.ng",
        "password": "password",
        "department": "Electrical",
        "level": "200"
    }
    reg_res = await admin_client.post("/api/v1/auth/register", json=student_data)
    user_id = reg_res.json()["data"]["id"]
    
    response = await admin_client.put(f"/api/v1/admin/users/{user_id}/role", json={"role": "ADMIN"})
    assert response.status_code == 200
    assert response.json()["data"]["role"] == "ADMIN"
