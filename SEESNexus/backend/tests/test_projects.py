import pytest
import pytest_asyncio
from httpx import AsyncClient

@pytest_asyncio.fixture
async def auth_token(client: AsyncClient, db_session):
    from app.models.all_models import User, UserRole
    from sqlalchemy.future import select
    
    user_data = {
        "full_name": "Project Lead",
        "email": "lead@unilag.edu.ng",
        "password": "leadpassword",
        "department": "Systems Engineering",
        "level": "400"
    }
    
    # Check if user already exists
    result = await db_session.execute(select(User).where(User.email == user_data["email"]))
    user = result.scalars().first()
    
    if not user:
        await client.post("/api/v1/auth/register", json=user_data)
        # Promote to contributor
        result = await db_session.execute(select(User).where(User.email == user_data["email"]))
        user = result.scalars().first()
        user.role = UserRole.CONTRIBUTOR
        await db_session.commit()
    
    login_res = await client.post("/api/v1/auth/login", data={"username": user_data["email"], "password": user_data["password"]})
    return login_res.json()["data"]["access_token"]

@pytest.mark.asyncio
async def test_create_project(client: AsyncClient, auth_token: str):
    project_data = {
        "title": "Smart Irrigation System",
        "description": "An automated irrigation system using IoT.",
        "tech_stack": ["Arduino", "FastAPI", "PostgreSQL"],
        "category": "EMBEDDED",
        "status": "IDEATION"
    }
    response = await client.post("/api/v1/projects/", json=project_data, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["title"] == project_data["title"]

@pytest.mark.asyncio
async def test_get_projects(client: AsyncClient, auth_token: str):
    response = await client.get("/api/v1/projects/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert isinstance(data["data"]["projects"], list)

@pytest.mark.asyncio
async def test_get_project_by_id(client: AsyncClient, auth_token: str):
    # Create project
    project_data = {
        "title": "Solar Powered Car",
        "description": "A car powered by solar energy.",
        "tech_stack": ["Python", "Resberry Pi"],
        "category": "EMBEDDED",
        "status": "IDEATION"
    }
    create_res = await client.post("/api/v1/projects/", json=project_data, headers={"Authorization": f"Bearer {auth_token}"})
    project_id = create_res.json()["data"]["id"]
    
    # Get by id
    response = await client.get(f"/api/v1/projects/{project_id}")
    assert response.status_code == 200
    assert response.json()["data"]["title"] == project_data["title"]

@pytest.mark.asyncio
async def test_update_project(client: AsyncClient, auth_token: str):
    # Create project
    project_data = {
        "title": "Original Title",
        "description": "Original Description",
        "tech_stack": ["Java"],
        "category": "WEB",
        "status": "IDEATION"
    }
    create_res = await client.post("/api/v1/projects/", json=project_data, headers={"Authorization": f"Bearer {auth_token}"})
    project_id = create_res.json()["data"]["id"]
    
    # Update
    update_data = {"title": "Updated Title", "status": "IN_PROGRESS"}
    response = await client.put(f"/api/v1/projects/{project_id}", json=update_data, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    assert response.json()["data"]["title"] == "Updated Title"

@pytest.mark.asyncio
async def test_delete_project(client: AsyncClient, auth_token: str):
    # Create project
    project_data = {
        "title": "Project to Delete",
        "description": "Delete me",
        "tech_stack": ["Go"],
        "category": "WEB",
        "status": "IDEATION"
    }
    create_res = await client.post("/api/v1/projects/", json=project_data, headers={"Authorization": f"Bearer {auth_token}"})
    project_id = create_res.json()["data"]["id"]
    
    # Delete
    response = await client.delete(f"/api/v1/projects/{project_id}", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_unauthorized_project_delete(client: AsyncClient, auth_token: str):
    # Create project by user 1
    project_data = {
        "title": "User 1 Project",
        "description": "Desc",
        "tech_stack": ["React"],
        "category": "WEB",
        "status": "IDEATION"
    }
    create_res = await client.post("/api/v1/projects/", json=project_data, headers={"Authorization": f"Bearer {auth_token}"})
    project_id = create_res.json()["data"]["id"]
    
    # Register and login user 2
    user2_data = {
        "full_name": "User Two",
        "email": "user2@unilag.edu.ng",
        "password": "password",
        "department": "Civil",
        "level": "400"
    }
    await client.post("/api/v1/auth/register", json=user2_data)
    login_res = await client.post("/api/v1/auth/login", data={"username": user2_data["email"], "password": user2_data["password"]})
    token2 = login_res.json()["data"]["access_token"]
    
    # Try delete user 1's project by user 2
    response = await client.delete(f"/api/v1/projects/{project_id}", headers={"Authorization": f"Bearer {token2}"})
    # Should be 403 Forbidden
    assert response.status_code == 403
    assert "not authorized" in response.json()["message"].lower()
