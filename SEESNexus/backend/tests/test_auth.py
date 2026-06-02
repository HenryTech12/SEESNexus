import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_user(client: AsyncClient):
    user_data = {
        "full_name": "Test User",
        "email": "test@unilag.edu.ng",
        "password": "testpassword",
        "department": "Electrical Engineering",
        "level": "300"
    }
    response = await client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert data["message"] == "Registration successful"
    assert data["data"]["email"] == user_data["email"]

@pytest.mark.asyncio
async def test_login_user(client: AsyncClient):
    # Register first
    user_data = {
        "full_name": "Login User",
        "email": "login@unilag.edu.ng",
        "password": "loginpassword",
        "department": "Systems Engineering",
        "level": "400"
    }
    await client.post("/api/v1/auth/register", json=user_data)
    
    # Login
    login_data = {
        "username": user_data["email"],
        "password": user_data["password"]
    }
    response = await client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data["data"]
    assert data["data"]["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_get_me(client: AsyncClient):
    # Register and login
    user_data = {
        "full_name": "Me User",
        "email": "me@unilag.edu.ng",
        "password": "mepassword",
        "department": "Computer Engineering",
        "level": "500"
    }
    await client.post("/api/v1/auth/register", json=user_data)
    login_res = await client.post("/api/v1/auth/login", data={"username": user_data["email"], "password": user_data["password"]})
    token = login_res.json()["data"]["access_token"]
    
    # Get me
    response = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["email"] == user_data["email"]

@pytest.mark.asyncio
async def test_update_me(client: AsyncClient):
    # Register and login
    user_data = {
        "full_name": "Update User",
        "email": "update@unilag.edu.ng",
        "password": "updatepassword",
        "department": "Mechanical Engineering",
        "level": "200"
    }
    await client.post("/api/v1/auth/register", json=user_data)
    login_res = await client.post("/api/v1/auth/login", data={"username": user_data["email"], "password": user_data["password"]})
    token = login_res.json()["data"]["access_token"]
    
    # Update me
    update_data = {"full_name": "Updated Name", "level": "300"}
    response = await client.put("/api/v1/auth/me", json=update_data, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["full_name"] == "Updated Name"
    assert data["data"]["level"] == "300"

@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient):
    # Register and login
    user_data = {
        "full_name": "Refresh User",
        "email": "refresh@unilag.edu.ng",
        "password": "refreshpassword",
        "department": "Civil Engineering",
        "level": "100"
    }
    await client.post("/api/v1/auth/register", json=user_data)
    login_res = await client.post("/api/v1/auth/login", data={"username": user_data["email"], "password": user_data["password"]})
    refresh_token = login_res.json()["data"]["refresh_token"]
    
    # Refresh
    response = await client.post("/api/v1/auth/refresh", params={"refresh_token": refresh_token})
    assert response.status_code == 200
    assert "access_token" in response.json()["data"]

@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    user_data = {
        "full_name": "Duplicate User",
        "email": "duplicate@unilag.edu.ng",
        "password": "testpassword",
        "department": "Electrical Engineering",
        "level": "300"
    }
    # Register once
    await client.post("/api/v1/auth/register", json=user_data)
    
    # Register again
    response = await client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 400
    res_data = response.json()
    message = res_data.get("message") or res_data.get("detail")
    assert "already registered" in str(message).lower()

@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    login_data = {
        "username": "nonexistent@unilag.edu.ng",
        "password": "wrongpassword"
    }
    response = await client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 401
    res_data = response.json()
    message = res_data.get("message") or res_data.get("detail")
    assert "invalid credentials" in str(message).lower()
