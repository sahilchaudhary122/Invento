import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.db.base_class import Base
from app.db.session import engine

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def auth_headers():
    client.post(
        "/api/v1/auth/signup",
        json={"email": "wh_user@example.com", "name": "Warehouse User", "password": "password123"},
    )
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "wh_user@example.com", "password": "password123"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_warehouse_and_location_flow(auth_headers):
    # 1. Create Warehouse
    wh_data = {"name": "Main Warehouse", "code": "WH-MAIN", "address": "123 Industrial Pkwy"}
    response = client.post("/api/v1/warehouses/", json=wh_data, headers=auth_headers)
    assert response.status_code == 200
    res_json = response.json()
    wh_id = res_json["id"]
    assert res_json["name"] == "Main Warehouse"
    assert res_json["code"] == "WH-MAIN"

    # Duplicate code conflict
    response = client.post("/api/v1/warehouses/", json=wh_data, headers=auth_headers)
    assert response.status_code == 409

    # 2. List Warehouses
    response = client.get("/api/v1/warehouses/", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1

    # 3. Get Warehouse by ID
    response = client.get(f"/api/v1/warehouses/{wh_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["code"] == "WH-MAIN"

    # Get non-existent warehouse -> 404
    fake_uuid = str(uuid.uuid4())
    response = client.get(f"/api/v1/warehouses/{fake_uuid}", headers=auth_headers)
    assert response.status_code == 404

    # 4. Create Location under Warehouse
    loc_data = {"name": "Aisle 1", "code": "A1"}
    response = client.post(f"/api/v1/warehouses/{wh_id}/locations", json=loc_data, headers=auth_headers)
    assert response.status_code == 200
    loc_json = response.json()
    loc_id = loc_json["id"]
    assert loc_json["warehouse_id"] == wh_id
    assert loc_json["name"] == "Aisle 1"

    # Create location under non-existent warehouse -> 404
    response = client.post(f"/api/v1/warehouses/{fake_uuid}/locations", json=loc_data, headers=auth_headers)
    assert response.status_code == 404

    # 5. List Locations under Warehouse
    response = client.get(f"/api/v1/warehouses/{wh_id}/locations", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["id"] == loc_id

    # 6. Get Location by ID
    response = client.get(f"/api/v1/locations/{loc_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Aisle 1"

    # Get non-existent location -> 404
    response = client.get(f"/api/v1/locations/{fake_uuid}", headers=auth_headers)
    assert response.status_code == 404

    # 7. Update Warehouse
    response = client.put(f"/api/v1/warehouses/{wh_id}", json={"name": "Updated Warehouse"}, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Warehouse"

    # Update non-existent warehouse -> 404
    response = client.put(f"/api/v1/warehouses/{fake_uuid}", json={"name": "No WH"}, headers=auth_headers)
    assert response.status_code == 404

    # 8. Update Location
    response = client.put(f"/api/v1/locations/{loc_id}", json={"name": "Aisle 1 Revised"}, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Aisle 1 Revised"

    # Update location with invalid warehouse_id -> 404
    response = client.put(f"/api/v1/locations/{loc_id}", json={"warehouse_id": fake_uuid}, headers=auth_headers)
    assert response.status_code == 404

    # Update non-existent location -> 404
    response = client.put(f"/api/v1/locations/{fake_uuid}", json={"name": "No Loc"}, headers=auth_headers)
    assert response.status_code == 404

    # 9. Delete Location
    response = client.delete(f"/api/v1/locations/{loc_id}", headers=auth_headers)
    assert response.status_code == 204

    # Get deleted location -> 404
    response = client.get(f"/api/v1/locations/{loc_id}", headers=auth_headers)
    assert response.status_code == 404

    # Delete non-existent location -> 404
    response = client.delete(f"/api/v1/locations/{fake_uuid}", headers=auth_headers)
    assert response.status_code == 404

    # 10. Delete Warehouse
    response = client.delete(f"/api/v1/warehouses/{wh_id}", headers=auth_headers)
    assert response.status_code == 204

    # Get deleted warehouse -> 404
    response = client.get(f"/api/v1/warehouses/{wh_id}", headers=auth_headers)
    assert response.status_code == 404

    # Delete non-existent warehouse -> 404
    response = client.delete(f"/api/v1/warehouses/{fake_uuid}", headers=auth_headers)
    assert response.status_code == 404
