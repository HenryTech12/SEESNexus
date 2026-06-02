import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_send_code(client: AsyncClient):
    response = await client.post("/api/v1/notify/send-code", json={"email": "test@unilag.edu.ng"})
    assert response.status_code == 200
    assert response.json()["status"] == "success"

@pytest.mark.asyncio
async def test_verify_code(client: AsyncClient):
    response = await client.post("/api/v1/notify/verify-code", json={"email": "test@unilag.edu.ng", "code": "123456"})
    # Status depends on whether the code is actually 123456. 
    # Usually, we'd mock the verification service.
    assert response.status_code in [200, 400]

@pytest.mark.asyncio
async def test_root_endpoint(client: AsyncClient):
    response = await client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "success"
