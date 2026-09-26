import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.base_class import Base
from app.db.session import engine, SessionLocal

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_auth():
    # Signup
    response = client.post("/api/v1/auth/signup", json={"email": "test@example.com", "name": "Test User", "password": "password123"})
    assert response.status_code == 200
    
    # Duplicate signup
    response = client.post("/api/v1/auth/signup", json={"email": "test@example.com", "name": "Test User", "password": "password123"})
    assert response.status_code == 400
    
    # Login
    response = client.post("/api/v1/auth/login", data={"username": "test@example.com", "password": "password123"})
    assert response.status_code == 200
    token = response.json()["access_token"]
    
    # /me
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"
    
    # Invalid token
    response = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid"})
    assert response.status_code == 401

def test_categories():
    # Setup: login
    client.post("/api/v1/auth/signup", json={"email": "cat@example.com", "name": "Cat User", "password": "password123"})
    response = client.post("/api/v1/auth/login", data={"username": "cat@example.com", "password": "password123"})
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create
    response = client.post("/api/v1/categories/", json={"name": "Tools"}, headers=headers)
    assert response.status_code == 200
    cat_id = response.json()["id"]
    
    # Duplicate
    response = client.post("/api/v1/categories/", json={"name": "Tools"}, headers=headers)
    assert response.status_code == 409
    
    # Get
    response = client.get(f"/api/v1/categories/{cat_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Tools"

def test_products():
    # Setup: login + category
    client.post("/api/v1/auth/signup", json={"email": "prod@example.com", "name": "Prod User", "password": "password123"})
    response = client.post("/api/v1/auth/login", data={"username": "prod@example.com", "password": "password123"})
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.post("/api/v1/categories/", json={"name": "Electronics"}, headers=headers)
    cat_id = response.json()["id"]
    
    # Create product
    prod_data = {"name": "Laptop", "sku": "LP-001", "category_id": cat_id}
    response = client.post("/api/v1/products/", json=prod_data, headers=headers)
    assert response.status_code == 200
    
    # Duplicate SKU
    response = client.post("/api/v1/products/", json=prod_data, headers=headers)
    assert response.status_code == 409
    
    # Search
    response = client.get("/api/v1/products/?search=Laptop")
    assert response.status_code == 200
    assert len(response.json()) == 1
