import pytest
import pytest_asyncio
from httpx import AsyncClient

@pytest_asyncio.fixture
async def auth_token(client: AsyncClient):
    user_data = {
        "full_name": "Event Goer",
        "email": "goer@unilag.edu.ng",
        "password": "goerpassword",
        "department": "Electrical Engineering",
        "level": "300"
    }
    await client.post("/api/v1/auth/register", json=user_data)
    login_res = await client.post("/api/v1/auth/login", data={"username": user_data["email"], "password": user_data["password"]})
    return login_res.json()["data"]["access_token"]

@pytest.mark.asyncio
async def test_get_events(client: AsyncClient):
    response = await client.get("/api/v1/events/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "events" in data["data"]

@pytest.mark.asyncio
async def test_create_event_non_admin(client: AsyncClient, auth_token: str):
    event_data = {
        "title": "Hackathon 2024",
        "description": "Annual SEES Hackathon",
        "event_type": "Workshop",
        "location": "Main Hall",
        "start_date": "2024-06-01T09:00:00",
        "end_date": "2024-06-01T18:00:00",
        "registration_deadline": "2024-05-30T23:59:59"
    }
    response = await client.post("/api/v1/events/", json=event_data, headers={"Authorization": f"Bearer {auth_token}"})
    # Should be 403 for student
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_register_for_event(client: AsyncClient, auth_token: str):
    import uuid
    event_id = str(uuid.uuid4())
    response = await client.post(f"/api/v1/events/{event_id}/register", headers={"Authorization": f"Bearer {auth_token}"})
    # Likely 404 since event doesn't exist
    assert response.status_code in [201, 404]
